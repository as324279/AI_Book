const express = require('express');
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const ALADIN_API_KEY = 'ttbas3242751932001';
const PYTHON_SERVER_URL = 'http://192.168.219.103:8000/hybrid-recommend';

// 필터링 조건
const validBook = (book) => book.cover && book.title && book.author && book.description && book.isbn13;
const invalidKeywords = ["수능", "기출", "문제집", "교재", "해설", "논술", "자료집", "정답", "무작정 따라하기"];
const isInvalid = (book) => {
  const text = `${book.title} ${book.categoryName ?? ''}`.toLowerCase();
  return invalidKeywords.some(k => text.includes(k.toLowerCase()));
};

// API 요청 함수
const fetchBooksByGenre = async (genre, sort = 'SalePoint') => {
  const url = `https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${ALADIN_API_KEY}&Query=${encodeURIComponent(genre)}&QueryType=Keyword&Sort=${sort}&MaxResults=35&Cover=Big&Output=JS&Version=20131101`;
  const response = await fetch(url);
  const text = await response.text();
  const json = JSON.parse(text.replace(/^[^=]+ = /, '').replace(/;$/, ''));
  return json.item || [];
};

const fetchCategoryByIsbn = async (isbn13) => {
  const url = `https://www.aladin.co.kr/ttb/api/ItemLookUp.aspx?ttbkey=${ALADIN_API_KEY}&itemIdType=ISBN13&ItemId=${isbn13}&Output=JS&Version=20131101&Cover=Big&OptResult=categoryName`;
  try {
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(text.replace(/^[^=]+ = /, '').replace(/;$/, ''));
    return json?.item?.[0]?.categoryName || '정보 없음';
  } catch {
    return '정보 없음';
  }
};

const extractFrequentKeywords = (books, topN = 5) => {
  const wordCount = {};
  for (const book of books) {
    const text = `${book.title} ${book.categoryName ?? ''}`.toLowerCase();
    const words = text.split(/\s+|>|\//).filter(w => w.length >= 2);
    for (const word of words) {
      wordCount[word] = (wordCount[word] || 0) + 1;
    }
  }
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word]) => word);
};

// 메인 라우터
router.post('/hybrid-recommend', async (req, res) => {
  const { genres, sortoption = 'SalePoint', savedBooks = [] } = req.body;

  if (!genres || genres.length === 0) {
    return res.status(400).json({ error: "No genres provided" });
  }

  try {
    const genreBookMap = {};

    for (const genre of genres) {
      // 1차: 장르 자체로 검색
      const baseBooks = await fetchBooksByGenre(genre, sortoption);
      const validBase = baseBooks.filter(book => validBook(book) && !isInvalid(book));
      genreBookMap[genre] = validBase;

      // 2차: 동적 키워드 추출 및 검색 보강
      const keywords = extractFrequentKeywords(validBase);
      for (const keyword of keywords) {
        const extraBooks = await fetchBooksByGenre(keyword, sortoption);
        const enriched = await Promise.all(
          extraBooks.filter(book => validBook(book) && !isInvalid(book)).map(async (book) => {
            if (!book.categoryName) {
              const category = await fetchCategoryByIsbn(book.isbn13);
              book.categoryName = category;
            }
            return book;
          })
        );
        const deduped = Array.from(new Map(enriched.map(b => [b.isbn13, b])).values());
        genreBookMap[`${genre}::${keyword}`] = deduped;
      }
    }

    // Flask 서버 호출
    const response = await fetch(PYTHON_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genreBookMap, genres, savedBooks }),
    });

    const data = await response.json();
    return res.json({ books: data.books });
  } catch (error) {
    console.error("추천 실패:", error);
    return res.status(500).json({ error: "Recommendation failed" });
  }
});

module.exports = router;

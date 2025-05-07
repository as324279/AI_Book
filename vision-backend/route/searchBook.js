const express = require("express");
const axios = require("axios");
const router = express.Router();
require("dotenv").config();

// ✅ 환경 변수
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;
const ALADIN_API_KEY = process.env.ALADIN_API_KEY;

// 🔍 환경변수 로그로 확인
console.log("📦 GOOGLE_BOOKS_API_KEY:", GOOGLE_BOOKS_API_KEY);
console.log("📦 ALADIN_API_KEY:", ALADIN_API_KEY);
console.log("✅ GOOGLE_BOOKS_API_KEY:", process.env.GOOGLE_BOOKS_API_KEY);

const { summarizeText } = require("../utils/summarizer");

const filterResultsByAnyKeyword = (books, query) => {
  const keywords = query.toLowerCase().split(/\s+/);
  return books
    .map(book => {
      const title = book.title.toLowerCase();
      const matchCount = keywords.filter(k => title.includes(k)).length;
      return { book, matchCount };
    })
    .filter(({ matchCount }) => matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount)
    .map(({ book }) => book);
};


router.get("/", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "검색어(q)가 필요합니다." });

  const encoded = encodeURIComponent(query);
  const googleUrl = `https://www.googleapis.com/books/v1/volumes?q=${encoded}&key=${GOOGLE_BOOKS_API_KEY}`;
  const aladinUrl = `https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${ALADIN_API_KEY}&Query=${encoded}&QueryType=Title&MaxResults=10&start=1&SearchTarget=Book&output=JS&Version=20131101`;

  let googleBooks = [];
  let aladinBooks = [];

   //🔹 Google Books API
   try {
     const googleRes = await axios.get(googleUrl);
     if (googleRes?.data?.items) {
       googleBooks = await Promise.all(googleRes.data.items.map(async (item) => {
         const info = item.volumeInfo;
         console.log("📖 Google 책 제목:", info.title);
         const summary = await summarizeText(description);
         return {
           title: info.title || "제목 없음",
           authors: info.authors?.join(", ") || "저자 정보 없음",
           publisher:info.publisher || "정보 없음",
           publishedDate: info.publishedDate || "정보 없음", 
           thumbnail: info.imageLinks?.thumbnail || null,
            description: info.description || "설명 없음",
           summary,
           source: "Google",
         };
       }));
     }
   } catch (err) {
     console.error("❌ Google Books API 오류:", err.message);
   }

 
  // 🔹 Aladin API
try {
  const aladinRes = await axios.get(aladinUrl);
  if (aladinRes?.data?.item) {
    aladinBooks = await Promise.all(aladinRes.data.item.map(async(item) => {
      console.log("📘 Aladin 책 제목:", item.title); // ✅ 여기 추가!
      console.log("🔍 Aladin 원시 응답:", JSON.stringify(aladinRes?.data, null, 2));
      const description = item.description || item.publisher || "설명 없음";
      const summary = summarizeText(description);
      return {
        title: item.title,
        authors: item.author,
        publisher: item.publisher || "정보 없음",        // ✅ 추가
        publishedDate: item.pubDate || "정보 없음",   
        thumbnail: item.cover,
        description,
        summary,
        source: "Aladin",
      };
    }));
  } else {
    console.log("📭 Aladin 응답에 item이 없습니다:", aladinRes?.data);
  }
} catch (err) {
  console.error("❌ Aladin API 오류:", err.message);
}


  // 🔸 병합 및 필터 적용
  const merged = [...googleBooks, ...aladinBooks]; 
  const filtered = filterResultsByAnyKeyword(merged, query);

  res.json({ books: merged,filtered });
});

module.exports = router;

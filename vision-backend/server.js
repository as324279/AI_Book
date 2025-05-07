require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const vision = require("@google-cloud/vision");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const {Configuration,OpenAI} = require("openai")
const stringSimilarity = require("string-similarity");


const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const GOOGLE_BOOKS_API_KEY = "AIzaSyAnwvS3jcDO610aSMIz2wzfycJAGKFVBA4";
const ALADIN_API_KEY = "ttbas3242751932001";

const searchBooksRouter = require("./route/searchBook");
app.use("/search-books", searchBooksRouter);
// 요약 기능 사용
const { summarizeText } = require("./utils/summarizer");

const generateChallengeRouter = require("./route/generateChallenge");
app.use("/generate-challenge", generateChallengeRouter);

const client = new vision.ImageAnnotatorClient({
  keyFilename: "united-blend-419210-1b5b6a547901.json",
});

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });


const generateNgramsFromText = (text, minWords = 2, maxWords = 6) => {
  const words = text.split(/\s+/);
  const candidates = [];
  for (let i = 0; i < words.length; i++) {
    for (let j = i + minWords; j <= i + maxWords && j <= words.length; j++) {
      const phrase = words.slice(i, j).join(" ");
      if (phrase.length >= 6 && phrase.length <= 30) {
        candidates.push(phrase);
      }
    }
  }
  return [...new Set(candidates.map(cleanText))];
};

const cleanText = (text) => {
  return text
    .replace(/[^가-힣a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .replace(/지은이|저자|추천|출판|감수/g,"")
    .trim();
};


app.post("/ocr", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "파일이 없습니다." });
    const imagePath = path.join(__dirname, "uploads", req.file.filename);

    const [result] = await client.textDetection(imagePath);
    const fullText = result.textAnnotations[0]?.description || "";
    const lines = fullText.split("\n").map(line => line.trim()).filter(Boolean);
    const candidates = generateNgramsFromText(lines.join(" "));
    
    let bestTitle = "";
    let bestScore = 0;
    let bestSource = "";
    let bestApiTitle = "";
    let bestDescription = "";
    let bestThumbnail = "";
    let bestAuthors = [];
    let bestPublisher = "";
    let bestPublishedDate = "";

    for (const candidate of candidates) {
      try {
        const encoded = encodeURIComponent(candidate);
        const [googleRes, aladinRes] = await Promise.all([
          axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encoded}&key=${GOOGLE_BOOKS_API_KEY}`),
          axios.get(`https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${ALADIN_API_KEY}&Query=${encoded}&QueryType=Title&Output=JS&Cover=Big&Version=20131101`),
        ]);

        const googleBook = googleRes?.data?.items?.[0]?.volumeInfo || {};
        const aladinBook = aladinRes?.data?.item?.[0];

        const googleTitle = googleBook.title || "";
        const aladinTitle = aladinBook?.title || "";
        const googleScore = stringSimilarity.compareTwoStrings(candidate, googleTitle);
        const aladinScore = stringSimilarity.compareTwoStrings(candidate, aladinTitle);

        const best = googleScore >= aladinScore
          ? { title: googleTitle, score: googleScore, source: "Google Books" }
          : { title: aladinTitle, score: aladinScore, source: "Aladin" };

        if (best.score > bestScore) {
          bestScore = best.score;
          bestTitle = candidate;
          bestSource = best.source;
          bestApiTitle = best.title;

          const googleDesc = googleBook.description || "";
          const aladinDesc = aladinBook?.description || "";
          bestDescription = aladinDesc.length > googleDesc.length ? aladinDesc : googleDesc;
          bestThumbnail = aladinBook?.cover || googleBook.imageLinks?.thumbnail || "";
          bestAuthors = aladinBook?.author ? [aladinBook.author] : googleBook.authors;
          bestPublisher = aladinBook?.publisher || googleBook.publisher;
          bestPublishedDate = aladinBook?.pubDate || googleBook.publishedDate;
        }

        if (best.score >= 0.95) break;
      } catch (e) {
        console.error("API 오류 (무시):", e.message);
      }
    }

    // const summary = await summarizeText(bestDescription);

    fs.unlink(imagePath, () => {});
    res.json({
      best_title: bestTitle,
      matched_api_title: bestApiTitle,
      matched_from: bestSource,
      best_score: bestScore,
      candidates,
      clova_text: fullText,
      description: bestDescription,
      // summary,
      thumbnail: bestThumbnail,
      authors: bestAuthors,
      publisher: bestPublisher,
      publishedDate: bestPublishedDate,
    });
  } catch (e) {
    console.error("OCR 처리 오류:", e);
    res.status(500).json({ error: "OCR 오류 발생" });
  }
});
// 직접 검색을 위한 것
app.get("/search", async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "검색어가 없습니다." });
  }

  try {
    const encoded = encodeURIComponent(query);

    const [googleResponse, aladinResponse] = await Promise.all([
      axios.get(`https://www.googleapis.com/books/v1/volumes?q=${encoded}&key=${GOOGLE_BOOKS_API_KEY}`),
      axios.get(`https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?ttbkey=${ALADIN_API_KEY}&Query=${encoded}&QueryType=Title&Output=JS&Cover=Big&Version=20131101`),
    ]);

    const googleBook = googleResponse.data.items?.[0]?.volumeInfo || {};
    const aladinBook = aladinResponse.data.item?.[0];

    const mergedBook = {
      title: aladinBook?.title || googleBook.title,
      authors: aladinBook?.author ? [aladinBook.author] : googleBook.authors,
      publisher: aladinBook?.publisher || googleBook.publisher,
      publishedDate: aladinBook?.pubDate || googleBook.publishedDate,
      description: aladinBook?.description || googleBook.description,
      thumbnail: aladinBook?.cover || googleBook.imageLinks?.thumbnail || "",
    };

    res.json({ book: mergedBook });
  } catch (error) {
    console.error("🔴 검색 API 오류:", error.message);
    res.status(500).json({ error: "도서 검색 실패" });
  }
});


const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 서버 실행 중: http://192.168.219.101:${PORT}`);
});

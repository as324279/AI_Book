<종합 프로젝트- AI기반 독서 관리 어플>
# 📚 북마크 (Bookmark) - AI기반 독서 관리 어플

팀 북마크(Bookmark)는 사용자가 도서 표지를 촬영하면 OCR을 통해 제목을 인식해서 사용자에게 도서 정보를 보여주거나 개인별 독서 챌린지 와 사용자 맞춤형 도서 추천 시스템을 제공하는 독서 관리 어플입니다.


## ✨ 주요 기능

* 📷 **OCR 기반 도서 인식**
  Google Cloud Vision API로 도서 표지에서 텍스트 추출 및 도서 정보 제공

* 🔍 **도서 정보 자동 검색**
  Google Books API / Aladin API를 통해 제목 기반 도서 수집

* 🧠 **AI 요약 기능**
  OpenAI GPT API를 활용해 책 설명을 자연스럽게 2\~3줄로 요약

* 🎯 **맞춤 도서 추천**
  KoBERT 또는 SBERT 임베딩 기반 유사도 계산을 통해 사용자 관심 도서와 장르 기반 도서 추천

* 🏆 **독서 챌린지**
  사용자의 난이도에 맞는 독서 챌린지 제공

---
## 프로젝트의 목적

1. 사용자의 관심 장르와 관심 도서 데이터를 반영해서 사용자 맞춤형 도서 추천을 가능하게 하는 것.
2. 키워드 기반 검색 뿐만 아니라, 카메라를 활용해서 도서 표지를 촬영하는 방법으로도 도서 정보를 제공받게 하는 것.
3. 사용자의 독서 습관 형성을 위해 난이도별 독서 챌린지 제공
4. 사용자 간의 원활한 커뮤니티 형성을 위한 커뮤니티 공간 제공





---

## 🛠 사용 기술 스택

### 🔹 프론트엔드

* React Native (Expo Router)
* Firebase Authentication / Realtime DB / Storage
* Axios, AsyncStorage

### 🔹 백엔드

* Express.js (Node.js 기반)
* Python Flask 서버 (KoBERT, SBERT 활용)
* Google Cloud Vision API (OCR)
* OpenAI GPT API (요약)
* Aladin Open API, Google Books API (도서 검색)

---

<details>
<summary>📁 프로젝트 구조 보기</summary>

```
📦bookmark-app/
 ┣ 📁myBookApp/            # React Native 앱 소스
 ┣ 📁vision-backend/       # Express.js 백엔드 서버
 ┣ 📁python-backend/       # 추천 시스템용 Flask 서버
 ┣ 📄README.md
 ┣ 📄package.json
 
```

</details>

---

## ⚙️ 설치 및 실행 방법

### 1. 클론

```bash
git clone https://github.com/your-team-name/bookmark-app.git
cd bookmark-app
```

### 2. 프론트엔드 실행 (React Native)

```bash
cd myBookApp
npm install
npx expo start
```

### 3. 백엔드 실행 (Express.js)

```bash
cd vision-backend
npm install
node server.js
```

### 4. AI 추천 서버 실행 (Flask)

```bash
cd python-backend
pip install
python Recommend.server.py
```

---

## 👨‍👩‍👧‍👦 팀원 소개

| 이름  | 역할                              |
| --- | ------------------------------- |
| 김경호 | 프론트엔드 개발 (UI/UX, Expo, 검색 화면 등) |
| 장우진 | DB연동 및 개발 (Express, API 연동)        |
| 이재민 | AI 모델 개발 및 데이터 수집 (KoBERT, GPT,API) |

---
---

## 🔗 참고 오픈소스 및 API

* [Google Books API](https://developers.google.com/books)
* [Aladin Open API](https://www.aladin.co.kr/ttb/api/)
* [Google Cloud Vision](https://cloud.google.com/vision)
* [OpenAI GPT API](https://platform.openai.com)
* [Firebase](https://firebase.google.com)

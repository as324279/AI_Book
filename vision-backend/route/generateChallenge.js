const { OpenAI } = require("openai");
const express = require("express");
const router = express.Router(); 
require("dotenv").config();

// ✅ OpenAI API 키 설정
const openaiapi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/', async (req, res) => {
  try {
    const { level } = req.body; // 초급/중급/고급

    const prompt = `
너는 독서 챌린지를 설계하는 AI 코치야. 사용자가 선택한 난이도에 맞는 챌린지를 제안해줘.

[규칙]
- 난이도는 반드시 ${level}이다.
- ${level} 난이도에 맞는 설명을 자연스럽게 작성해줘.
- 목표는 몇 주 동안 몇 권 아니면 한달동안 몇권을 읽는지 난이도에 맞춰서 명확히 작성해줘.
- 다양한 문장 표현을 사용해.
- 독서 목적이 명확할수록 독자의 이해와 집중력이 향상된다는 연구 결과가 있어.
- 읽기 과제는 단순한 정보 전달이 아니라 문제 해결, 감정 조절, 정체성 탐색 등 실생활과 연결되어야 해.
- 상황 기반 읽기 과제는 독서 동기와 흥미를 높이고, 후속 활동과의 연결도 매우 효과적이라는 연구가 있다(백혜선, 2023).

[출력 포맷]
난이도 이름: ${level}
설명: (간단한 이유)
목표: (몇 주 동안 몇 권 읽기 + 도전 과제: 줄거리 요약, 친구에게 소개, 감정 기록 등 포함)
`;

const completion = await openaiapi.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const resultText = completion.choices[0].message.content.trim();

    res.json({ result: resultText });
  } catch (error) {
    console.error('🔴 OpenAI API 오류:', error.message);
    res.status(500).json({ error: '챌린지 생성 실패' });
  }
});

module.exports = router;

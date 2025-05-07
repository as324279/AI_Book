const { OpenAI } = require("openai");
require("dotenv").config();

const openaiapi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const summarizeText = async (text) => {
  if (!text || text.length < 30) return "";
  try {
    const completion = await openaiapi.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 사용자에게 책의 핵심 내용을 간단하게 전달하는 요약 전문가야. 구체적인 내용 위주로 2~3줄로 요약해주고, 요약글이 끊어지는 것도 안돼.",
        },
        {
          role: "user",
          content: `다음 책 설명를 요약해줘:\n\n${text}`,
        },
      ],
      max_tokens: 200,
    });

    return completion.choices[0].message.content.trim();
  } catch (e) {
    console.error("❌ 요약 오류:", e.message);
    return "";
  }
};

module.exports = { summarizeText };

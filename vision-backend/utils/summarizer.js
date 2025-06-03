const { OpenAI } = require("openai");
require("dotenv").config();

const openaiapi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const summarizeText = async (text) => {
  if (!text || text.length < 100) return "";
  try {
    const completion = await openaiapi.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "당신은 책의 내용을 전문적으로 요약하는 요약 전문가입니다. 사용자가 제공한 책 설명을 2~3문장으로 간결하게 요약하세요. " +
        "중요한 내용을 구체적으로 요약하되, 문장이 '설계하고', '구성하며' 등으로 어색하게 끊기지 않고 자연스럽게 끝나야 합니다. " +
        "모든 문장은 '-다', '-합니다' 와 같이 종결형으로 끝내세요. 문장의 맥락이 부드럽고 논리적으로 이어지도록 하세요." +
        "예: ~~하고, ~~하며 식으로 끊기지 말고, ~~합니다, ~~이다 등으로 끝맺으세요.",
        },
        {
          role: "user",
          content: `다음 책 설명를 요약해줘:\n\n${text}`,
        },
      ],
      max_tokens: 300,
    });

    return completion.choices[0].message.content.trim();
  } catch (e) {
    console.error("❌ 요약 오류:", e.message);
    return "";
  }
};

module.exports = { summarizeText };

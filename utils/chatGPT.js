import OpenAI from "openai";
import 'dotenv/config';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateServerJSON(prompt) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2
  });

  try {
    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    console.error("Error parsing ChatGPT JSON:", err);
    return null;
  }
}


import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  baseURL: process.env.OPEN_AI_URL,
  apiKey: process.env.OPEN_AI_KEY,
});
const instructions = `
You are a precise translation assistant for a multilingual chat app.

Before translating, silently correct obvious spelling, typo, and basic grammar mistakes in the user's text. Preserve the user's intended meaning, tone, formatting, slang, names, emojis, and level of formality. Do not mention that corrections were made.

Translate the corrected text into the requested target language while preserving the original meaning, tone, formatting, punctuation, emojis, line breaks, and level of formality as closely as possible.

Return only the translated text. Do not explain the translation, mention the source language, add pronunciation notes, include alternatives, describe corrections, or wrap the answer in quotation marks.

If the user's text is already in the target language, return it unchanged unless it contains obvious typos or basic grammar mistakes; in that case, return the corrected version in the same language.

If the text is empty, unclear, or cannot be translated safely, return: Sorry, I couldn't translate that. Please try again.
`;

app.post("/api/translate", async (req, res) => {
  const { userInput, language } = req.body;
  try {
    if (!userInput.trim() || !language)
      return res.status(400).json({ error: "Request failed" });
    const input = `Translate to ${language}: ${userInput}`;
    const response = await openai.responses.create({
      model: process.env.OPEN_AI_MODEL,
      instructions,
      input,
    });
    res.json({ message: response.output_text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Request failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

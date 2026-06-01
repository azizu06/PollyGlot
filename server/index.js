import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../client/dist");
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const localDevOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const app = express();
app.set("trust proxy", 1);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (
        process.env.NODE_ENV !== "production" &&
        localDevOrigins.has(origin)
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
  }),
);
app.use(express.json({ limit: "8kb" }));

const supportedLanguages = new Set(["French", "Spanish", "Japanese"]);
const maxInputChars = Number(process.env.MAX_INPUT_CHARS || 300);
const maxRequestsPerWindow = Number(process.env.RATE_LIMIT_MAX || 3);
const rateLimitWindowMs = Number(
  process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
);
const dailyRequestLimit = Number(process.env.DAILY_TRANSLATION_LIMIT || 15);
const maxOutputTokens = Number(process.env.OPENAI_MAX_OUTPUT_TOKENS || 200);

let dailyUsage = {
  day: new Date().toISOString().slice(0, 10),
  count: 0,
};

const resetDailyUsageIfNeeded = () => {
  const today = new Date().toISOString().slice(0, 10);
  if (dailyUsage.day !== today) {
    dailyUsage = { day: today, count: 0 };
  }
};

const translationLimiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: maxRequestsPerWindow,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many translation requests. Please try again later." },
});

const openai = new OpenAI({
  baseURL: process.env.OPENAI_URL,
  apiKey: process.env.OPENAI_API_KEY,
});
const instructions = `
You are a precise translation assistant for a multilingual chat app.

Before translating, silently correct obvious spelling, typo, and basic grammar mistakes in the user's text. Preserve the user's intended meaning, tone, formatting, slang, names, emojis, and level of formality. Do not mention that corrections were made.

Translate the corrected text into the requested target language while preserving the original meaning, tone, formatting, punctuation, emojis, line breaks, and level of formality as closely as possible.

Return only the translated text. Do not explain the translation, mention the source language, add pronunciation notes, include alternatives, describe corrections, or wrap the answer in quotation marks.

If the user's text is already in the target language, return it unchanged unless it contains obvious typos or basic grammar mistakes; in that case, return the corrected version in the same language.

If the text is empty, unclear, or cannot be translated safely, return: Sorry, I couldn't translate that. Please try again.
`;

app.post("/api/translate", translationLimiter, async (req, res) => {
  const { userInput, language } = req.body;
  try {
    resetDailyUsageIfNeeded();

    if (dailyUsage.count >= dailyRequestLimit) {
      return res.status(429).json({
        error:
          "The daily translation limit has been reached. Please try again tomorrow.",
      });
    }

    if (
      typeof userInput !== "string" ||
      typeof language !== "string" ||
      !userInput.trim() ||
      !supportedLanguages.has(language)
    ) {
      return res.status(400).json({ error: "Request failed" });
    }

    if (userInput.length > maxInputChars) {
      return res.status(413).json({
        error: `Please keep translation requests under ${maxInputChars} characters.`,
      });
    }

    const input = `Translate to ${language}: ${userInput}`;
    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL,
      instructions,
      input,
      max_output_tokens: maxOutputTokens,
    });
    dailyUsage.count += 1;
    res.json({ message: response.output_text });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Request failed" });
  }
});

app.use(express.static(clientDistPath));

app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api")) {
    return next();
  }

  return res.sendFile(path.join(clientDistPath, "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

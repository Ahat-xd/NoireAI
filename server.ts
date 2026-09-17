import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { authRouter, handleOAuthCallback } from "./server/auth";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

// Increased limit for base64 photo/screenshot uploads from gallery
app.use(express.json({ limit: "35mb" }));
app.use(express.urlencoded({ extended: true, limit: "35mb" }));

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `Ты — Noire-AI, универсальный AI-помощник и мультимодальный эксперт-консультант. Твоя главная задача — давать точные, исчерпывающие и применимые на практике ответы-решения как на текстовые запросы пользователей, так и на загруженные ими фотографии/скриншоты из галереи.

ПРАВИЛА ОБРАБОТКИ ВХОДЯЩИХ ДАННЫХ:

1. Работа с изображениями (из галереи):
- Если пользователь присылает фото задачи/уравнения: распознай текст, распиши пошаговое решение с пояснениями и дай финальный ответ.
- Если прислано фото поломки/предмета/бытового прибора: определи, что на фото, в чём проблема, и дай четкую пошаговую инструкцию по исправлению/использованию.
- Если прислан скриншот ошибки на экране (код, приложение, ОС): объясни причину сбоя и предложи конкретный способ исправления.
- Если прислан документ/текст на фото: сделай краткую выжимку главных мыслей и ответь на вопросы по его содержанию.
- Если качество фото низкое или деталь не видна: вежливо попроси уточнить фрагмент или сделать более четкий снимок.

2. Формат и стиль ответов:
- В начале диалога всегда обязательно тепло здоровайся в стиле: «Привет, как дела? Чем могу помочь?» или «Привет! Как дела? Рад помочь!», после чего переходи к сути решения.
- Используй структуру: списки, жирный шрифт для ключевых мыслей и короткие абзацы для лёгкого чтения.
- Для сложных задач делай пошаговые блоки: «Шаг 1», «Шаг 2», «Результат».
- Тон общения: профессиональный, дружелюбный, понятный и сфокусированный на помощи.

3. Структура ответа-решения:
- Суть проблемы / Главный ответ (1–2 предложения).
- Пошаговое решение / Объяснение.
- Итоговый вывод или рекомендация по следующим шагам.

Отвечай на том языке, на котором обратился пользователь или на котором написан текст на присланной фотографии.`;

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

interface ChatHistoryItem {
  role: "user" | "model";
  text?: string;
  images?: Array<{ data: string; mimeType: string }>;
}

// Helper to assemble Gemini contents
function buildContents(
  message: string,
  images?: Array<{ data: string; mimeType: string }>,
  history?: ChatHistoryItem[]
) {
  const contents: any[] = [];

  // Add conversation history if provided
  if (Array.isArray(history) && history.length > 0) {
    for (const item of history) {
      const parts: any[] = [];
      if (item.images && Array.isArray(item.images)) {
        for (const img of item.images) {
          if (img.data && img.mimeType) {
            parts.push({
              inlineData: {
                data: img.data,
                mimeType: img.mimeType,
              },
            });
          }
        }
      }
      if (item.text) {
        parts.push({ text: item.text });
      }
      if (parts.length > 0) {
        contents.push({
          role: item.role,
          parts,
        });
      }
    }
  }

  // Current turn
  const currentParts: any[] = [];
  if (images && Array.isArray(images)) {
    for (const img of images) {
      if (img.data && img.mimeType) {
        currentParts.push({
          inlineData: {
            data: img.data,
            mimeType: img.mimeType,
          },
        });
      }
    }
  }

  if (message && message.trim().length > 0) {
    currentParts.push({ text: message.trim() });
  } else if (currentParts.length > 0) {
    // If user sent only image(s) without explicit text
    currentParts.push({
      text: "Пожалуйста, проанализируй присланное изображение (задачу, поломку, ошибку или документ) и дай подробный структурированный ответ согласно инструкциям.",
    });
  }

  contents.push({
    role: "user",
    parts: currentParts,
  });

  return contents;
}

// Streaming chat endpoint using Server-Sent Events (SSE)
app.post("/api/chat/stream", async (req: Request, res: Response) => {
  const { message, images, history } = req.body;

  if (!message && (!images || images.length === 0)) {
    res.status(400).json({ error: "Необходимо отправить текст или изображение." });
    return;
  }

  // Set headers for SSE streaming
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  try {
    const ai = getGenAI();
    const contents = buildContents(message, images, history);

    const isFirstTurn = !Array.isArray(history) || history.length === 0;
    const effectiveSystemInstruction = isFirstTurn
      ? `${SYSTEM_INSTRUCTION}\n\nВАЖНОЕ ПРАВИЛО НАЧАЛА ДИАЛОГА: Это первое сообщение в диалоге. Обязательно начни свой ответ с дружелюбного приветствия: «Привет, как дела? Чем могу помочь?» (или «Привет! Как дела? Рад помочь!»), а затем подробно и структурированно ответь на вопрос пользователя.`
      : SYSTEM_INSTRUCTION;

    const stream = await ai.models.generateContentStream({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: effectiveSystemInstruction,
        temperature: 0.4,
      },
    });

    for await (const chunk of stream) {
      const textChunk = chunk.text;
      if (textChunk) {
        res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err: any) {
    console.error("Gemini stream error:", err);
    const errorMessage = err?.message || "Произошла ошибка при обработке запроса.";
    res.write(`data: ${JSON.stringify({ error: errorMessage })}\n\n`);
    res.end();
  }
});

// Non-streaming chat endpoint fallback
app.post("/api/chat", async (req: Request, res: Response) => {
  const { message, images, history } = req.body;

  if (!message && (!images || images.length === 0)) {
    res.status(400).json({ error: "Необходимо отправить текст или изображение." });
    return;
  }

  try {
    const ai = getGenAI();
    const contents = buildContents(message, images, history);

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
      },
    });

    res.json({ reply: response.text || "" });
  } catch (err: any) {
    console.error("Gemini error:", err);
    res.status(500).json({
      error: err?.message || "Ошибка при генерации ответа моделью.",
    });
  }
});

// Mount OAuth and Authentication routes
app.use(authRouter);
app.get(["/auth/callback", "/auth/callback/"], handleOAuthCallback);

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

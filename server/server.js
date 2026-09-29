import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigin === '*' && origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (allowedOrigin && allowedOrigin !== '*') {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.static(rootDir));

app.post("/api/generate-character", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is missing in server/.env" });
    }

    const { prompt } = req.body || {};
    if (!prompt) {
      return res.status(400).json({ error: "prompt is required" });
    }

    const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
        prompt,
        size: "1024x1024",
        quality: "high",
        output_format: "png",
        background: "opaque"
      }),
    });

    const data = await imageResponse.json();

    if (!imageResponse.ok) {
      return res.status(imageResponse.status).json(data);
    }

    const image = data?.data?.[0];
    if (!image?.b64_json) {
      return res.status(500).json({ error: "No image returned from API", raw: data });
    }

    return res.json({
      imageBase64: image.b64_json,
      mimeType: "image/png"
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error?.message || "Unknown server error" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

app.listen(port, () => {
  console.log(`WOOJU profile card server running on http://localhost:${port}`);
});

import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const styleReferencePath = path.join(__dirname, "style-reference.png");

const app = express();
const port = process.env.PORT || 3000;
const allowedOrigin = process.env.ALLOWED_ORIGIN || "*";

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigin === "*" && origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (allowedOrigin && allowedOrigin !== "*") {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: "2mb" }));
app.use(express.static(rootDir));

function safeChampionId(value) {
  const id = String(value || "").trim();
  if (!/^[A-Za-z0-9]+$/.test(id)) return null;
  return id;
}

async function fetchOfficialSplash(championId) {
  const url = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championId}_0.jpg`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Riot champion reference download failed: HTTP ${response.status}`);
  }
  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: response.headers.get("content-type") || "image/jpeg",
    url,
  };
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, imageModel: "gpt-image-2.5-sunburst", referenceMode: "official-champion+style" });
});

app.post("/api/generate-character", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is missing in Render environment variables." });
    }

    const prompt = String(req.body?.prompt || "").trim();
    const championId = safeChampionId(req.body?.championId || req.body?.champion?.id);
    if (!prompt) return res.status(400).json({ error: "prompt is required" });
    if (!championId) return res.status(400).json({ error: "valid championId is required" });

    // Image 1: official Riot default splash = identity authority.
    const official = await fetchOfficialSplash(championId);

    // Image 2: cropped approved visual target = style/composition benchmark only.
    const styleBuffer = await fs.readFile(styleReferencePath);

    const serverReferenceRules = `
REFERENCE PRIORITY — FOLLOW EXACTLY:
1) INPUT IMAGE 1 is the official default splash of ${championId}. It is the ONLY character-identity source. Preserve that champion's recognizable anatomy/species, face/head, hair, costume/armor language, signature weapon/prop, silhouette, powers, and visual identity.
2) INPUT IMAGE 2 is STYLE AND COMPOSITION ONLY. Borrow only its premium rendering quality, dramatic close-up energy, perspective, lighting, depth, foreground motion/effects, crisp focal detail, and luxurious game-key-art finish. Do NOT copy the second image's character, face, hair, outfit, jewelry, water motif, blue palette, or Nilah-specific traits unless they genuinely belong to ${championId}.
3) Create an original new scene. Do not simply edit, trace, or reproduce either input.
4) The output must contain artwork only: no text, UI, frame, logo, badges, tags, or card elements.
`.trim();

    const form = new FormData();
    // Use the most capable current editing model for reference-image fidelity.
    form.append("model", process.env.OPENAI_EDIT_MODEL || "gpt-image-2.5-sunburst");
    form.append("image[]", new Blob([official.buffer], { type: official.contentType }), `${championId}-official.jpg`);
    form.append("image[]", new Blob([styleBuffer], { type: "image/png" }), "premium-style-reference.png");
    form.append("prompt", `${serverReferenceRules}\n\n${prompt}`);
    form.append("size", "1024x1024");
    form.append("quality", "high");
    form.append("output_format", "png");
    form.append("background", "opaque");

    const imageResponse = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: form,
    });

    const raw = await imageResponse.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = { error: raw || "Invalid OpenAI response" }; }

    if (!imageResponse.ok) {
      const message = data?.error?.message || data?.error || `OpenAI image edit failed: HTTP ${imageResponse.status}`;
      console.error("OpenAI image edit error", imageResponse.status, data);
      return res.status(imageResponse.status).json({ error: message });
    }

    const imageBase64 = data?.data?.[0]?.b64_json;
    if (!imageBase64) {
      console.error("No image returned", data);
      return res.status(500).json({ error: "OpenAI returned no image data." });
    }

    return res.json({
      imageBase64,
      mimeType: "image/png",
      championReference: official.url,
      referenceMode: "official-champion+premium-style",
      model: process.env.OPENAI_EDIT_MODEL || "gpt-image-2.5-sunburst",
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
  console.log(`WOOJU profile card server running on port ${port}`);
});

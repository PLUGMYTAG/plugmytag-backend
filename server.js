// server.js
require("dotenv").config();
const express       = require("express");
const bodyParser    = require("body-parser");
const cors          = require("cors");
const axios         = require("axios");
const fs            = require("fs");
const { applyEffects } = require("./ffmpeg");
const { generatePack } = require("./generatePack");

const app  = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ── 1-tag endpoint ────────────────────────────────────────
app.post("/generate", async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).send("Missing text");

  try {
    // download raw TTS
    const raw  = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVEN_VOICE_ID}`,
      { text, model_id: "eleven_multilingual_v2", voice_settings:{ stability:0.4, similarity_boost:0.85, style:0.7, use_speaker_boost:true } },
      { headers:{ "xi-api-key": process.env.ELEVEN_API_KEY }, responseType:"arraybuffer" }
    );
    const inPath  = `./input_${Date.now()}.mp3`;
    const outPath = `./output_${Date.now()}.mp3`;
    fs.writeFileSync(inPath, raw.data);

    // apply effects
    await applyEffects(inPath, outPath);

    // download
    res.setHeader("Content-Type", "audio/mpeg");
    res.download(outPath, "producer-tag.mp3", () => {
      fs.unlinkSync(inPath);
      fs.unlinkSync(outPath);
    });

  } catch (err) {
    console.error("❌ Generation error:", err.response?.data || err.message);
    res.status(500).send("Voice generation or processing failed.");
  }
});

// ── pack endpoint ─────────────────────────────────────────
app.post("/generate-pack", async (req, res) => {
  const { producer_name, email, amount } = req.body;
  if (!producer_name || !email || !amount)
    return res.status(400).json({ error: "Missing fields" });

  try {
    await generatePack(
      producer_name,
      email,
      Number(amount),
      process.env.ELEVEN_API_KEY
    );
    res.json({ success: true, message: "Pack wordt gegenereerd en gemaild." });
  } catch (err) {
    console.error("❌ Error in /generate-pack:", err);
    res.status(500).json({ error: "Failed to generate or send pack." });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

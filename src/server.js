const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const axios = require("axios")
const fs = require("fs")
const { applyEffects } = require("./utils/ffmpeg")
require("dotenv").config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(bodyParser.json())

app.post("/generate", async (req, res) => {
  const { text } = req.body
  if (!text) return res.status(400).send("Missing text")

  const voiceId = process.env.ELEVEN_VOICE_ID
  const apiKey = process.env.ELEVEN_API_KEY

  try {
    // 1) TTS genereren
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      { text, model_id: "eleven_multilingual_v2", voice_settings: { stability: 0.4, similarity_boost: 0.85, style: 0.7, use_speaker_boost: true } },
      { headers: { "xi-api-key": apiKey, "Content-Type": "application/json" }, responseType: "arraybuffer" }
    )

    // 2) schrijf raw file
    const rawPath = `./input_${Date.now()}.mp3`
    const finalPath = `./output_${Date.now()}.mp3`
    fs.writeFileSync(rawPath, response.data)

    // 3) pas alle effecten toe
    await applyEffects(rawPath, finalPath)

    // 4) stuur mp3 terug
    res.setHeader("Content-Type", "audio/mpeg")
    res.download(finalPath, "producer-tag.mp3", () => {
      fs.unlinkSync(rawPath)
      fs.unlinkSync(finalPath)
    })
  } catch (err) {
    console.error("❌ Generation error:", err.response?.data || err.message || err)
    res.status(500).send("Voice generation or processing failed.")
  }
})

app.listen(port, () => console.log(`✅ Server running on port ${port}`))

const { generatePack } = require("./utils/generatePack");

app.post("/generate-pack", async (req, res) => {
  try {
    const { producer_name, email, amount } = req.body;

    if (!producer_name || !email || !amount) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await generatePack(
      producer_name,
      email,
      parseInt(amount, 10),
      process.env.ELEVEN_API_KEY
    );

    res.json({ success: true, message: "Voice tag pack is being generated and will be emailed." });
  } catch (err) {
    console.error("❌ Error in /generate-pack:", err);
    res.status(500).json({ error: "Failed to generate or send pack." });
  }
});

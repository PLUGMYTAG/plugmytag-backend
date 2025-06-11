const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")                // 🟢 require cors
const axios = require("axios")
const fs = require("fs")
const { applyEffects } = require("./utils/ffmpeg")
require("dotenv").config()

const app = express()                        // 🟢 init app
const port = process.env.PORT || 3000

app.use(cors())                              // 🟢 CORS “openzetten”
app.use(bodyParser.json())                   // 🟢 JSON body-parser

app.post("/generate", async (req, res) => {
  const { text } = req.body
  if (!text) return res.status(400).send("Missing text")

  const voiceId = process.env.ELEVEN_VOICE_ID
  const apiKey = process.env.ELEVEN_API_KEY

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.85,
          style: 0.7,
          use_speaker_boost: true,
        },
      },
      {
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    )

    const inputPath = `./input_${Date.now()}.mp3`
    const outputPath = `./output_${Date.now()}.mp3`

    fs.writeFileSync(inputPath, response.data)
    await applyEffects(inputPath, outputPath)

    res.setHeader("Content-Type", "audio/mpeg")
    res.download(outputPath, () => {
      fs.unlinkSync(inputPath)
      fs.unlinkSync(outputPath)
    })
  } catch (err) {
    console.error("FULL ERROR:", err.response?.data || err.message || err)
    res.status(500).send("Voice generation or processing failed.")
  }
})

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`)
})

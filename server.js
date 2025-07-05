const express = require("express")
const cors = require("cors")
const fs = require("fs-extra")
const axios = require('axios')
const archiver = require("archiver")
const { exec } = require("child_process")
const path = require("path")

const app = express()
app.use(cors())
app.use(express.json())

const ELEVEN_API_KEY = "sk_3dac651233b8c4b10782891640857d112b17ea0677652f14" // <-- VERVANG met je echte key

const voiceIds = [
  "c8PX8tI3Cx46TLRopRq8",
  "TQ1YahPcaDMsoIPw34oE",
  "03vEurziQfq3V8WZhQvn",
  "Ybqj6CIlqb6M85s9Bl4n",
  "CVRACyqNcQefTlxMj9bt",
  "dPah2VEoifKnZT37774q",
  "BpjGufoPiobT79j2vtj4",
  "RPdRfxxQOaNxn1LtRQqm",
  "gLqGVg4EE30kJbMp6nxl",
  "3uGTjgQn1UwfzgY0VkZG",
  "D11AWvkESE7DJwqIVi7L",
  "vGQNBgLaiM3EdZtxIiuY",
  "T7eLpgAAhoXHlrNajG8v",
  "ekBe3Guq5ZiC4sbKHVFh",
  "gllMMawbYGTja23oQ3Vu",
  "BAdH0bMfq6VleQGLXj38",
  "FF7KdobWPaiR0vkcALHF",
  "LfjSv1XCdZ96k4B1jNJl",
  "zoPK1SQIRgH7reSIsP4q",
  "XdflFrQO8wbGpWMNZHFr",
  "cENJycK4Wg62xVikqkaA",
  "WZlYpi1yf6zJhNWXih74",
  "HWvDv2YkmE8rnsWesuos",
  "FGY2WhTYpPnrIDTdsKH5",
  "geVuXdUpU0lgUukWJCUE",
  "sAGnm3Te7Q3LVVENtdZG",
  "V33LkP9pVLdcjeB2y5Na",
  "nDJIICjR9zfJExIFeSCN",
  "pBZVCk298iJlHAcHQwLr",
  "sScFwemjGrAkDDiTXWMH",
  "pjcYQlDFKMbcOUp6F5GD",
  "hbB2qXyS2GMyyZIZyhAH",
  "TC0Zp7WVFzhA8zpTlRqV",
  "51YRucvcq5ojp2byev44",
  "L4ndSW2PzthljqHuvso3",
  "Dslrhjl3ZpzrctukrQSN",
  "z3kTTwYbQrmL7ckdGcJi",
  "Hjzqw9NR0xFMYU9Us0DL",
  "KLZOWyG48RjZkAAjuM89",
  "zGWLOENwXfL8saHn84KL",
  "WxqqAhUiswIRQNTBz2a5",
  "SpujdQyiKXTCe05mAnq6",
  "BlgEcC0TfWpBak7FmvHW",
  "ZF6FPAbjXT4488VcRRnw",
  "876MHA6EtWKaHTEGzjy5",
  "8RwERzS73M5BcreQgmi6",
  "KmnvDXRA0HU55Q0aqkPG",
  "Ix8C14HEHgIQkJswik2o",
  "ucgJ8SdlW1CZr9MIm8BP",
  "st7NwhTPEzqo2riw7qWC",
  "IoYPiP0wwoQzmraBbiju"
];

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.post("/generate-tags", async (req, res) => {
  const { producerName, amount } = req.body

  if (!producerName || !amount) {
    return res.status(400).json({ error: "Missing input." })
  }

  const tempDir = path.join(__dirname, "temp", Date.now().toString())
  await fs.ensureDir(tempDir)
  const filePaths = []

  let i = 0;
let successfulTags = 0;

while (successfulTags < amount) {
  const voiceId = voiceIds[i % voiceIds.length];
  const rawPath = path.join(tempDir, `tag_raw_${successfulTags + 1}.mp3`);
  const fxPath = path.join(tempDir, `tag_${successfulTags + 1}.mp3`);

  try {
    console.log(`▶️ Generating tag ${successfulTags + 1} with voice ID: ${voiceId}`);
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        text: producerName,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.7, similarity_boost: 0.7 },
      },
      {
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "stream",
      }
    );

    const writer = fs.createWriteStream(rawPath);
    await new Promise((resolve, reject) => {
      response.data.pipe(writer);
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    const fxCmd = `ffmpeg -y -i ${rawPath} -af "areverse,aecho=0.8:0.88:60:0.4,areverse,aecho=0.8:0.9:1000:0.3,loudnorm=I=-16:TP=-1.5:LRA=11,chorus=0.6:0.9:55:0.4:0.25:2,flanger,equalizer=f=200:t=h:width=2:g=-15,equalizer=f=3000:t=h:width=2:g=4" ${fxPath}`;

    await new Promise((resolve, reject) => {
      exec(fxCmd, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    filePaths.push(fxPath);
    successfulTags++;
  } catch (err) {
    console.error(`❌ Error at voice ID ${voiceId}:`, err.response?.data || err.message);
    console.warn(`⚠️ Skipping voice ID: ${voiceId}`);
  }

  i++;
  await delay(1500); // wacht tussen requests
}

  // 3. Zip all FX files
  const zipPath = path.join(tempDir, `${producerName}_tags.zip`)
  const output = fs.createWriteStream(zipPath)
  const archive = archiver("zip", { zlib: { level: 9 } })

  archive.pipe(output)
  filePaths.forEach((file) => archive.file(file, { name: path.basename(file) }))
  await archive.finalize()

  output.on("close", () => {
    res.download(zipPath, `${producerName}_tags.zip`, async () => {
      await fs.remove(tempDir)
    })
  })
})

// ✅ Start server
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

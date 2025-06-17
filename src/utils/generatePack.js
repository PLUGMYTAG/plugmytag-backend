const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const archiver = require("archiver");
const nodemailer = require("nodemailer");
const { getRandomTagText } = require("./getRandomTagText");
const voices = require("../data/plugmytag_10_tag_test_config.json");

async function generateVoiceTag(text, voiceId, outputPath, apiKey) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.45, similarity_boost: 0.7 }
    })
  });
  if (!res.ok) throw new Error(`ElevenLabs error: ${res.statusText}`);
  const buf = await res.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buf));
}

function zipFiles(folderPath, zipPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(folderPath, false);
    archive.finalize();
  });
}

async function sendEmail(zipPath, email, producerName) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: `Your PlugMyTag Pack – ${producerName}`,
    text: "Here are your voice tags!",
    attachments: [{ filename: `${producerName}_tags.zip`, path: zipPath }]
  });
}

async function generatePack(producerName, email, amount, apiKey) {
  const outDir = path.join(__dirname, "../output", producerName);
  const zipPath = path.join(__dirname, "../output", `${producerName}_tags.zip`);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const selected = voices.sort(() => 0.5 - Math.random()).slice(0, amount);

  for (const { voice_id } of selected) {
    const text = getRandomTagText(producerName);
    const outFile = path.join(outDir, `${producerName}_${voice_id.slice(0, 5)}.mp3`);
    await generateVoiceTag(text, voice_id, outFile, apiKey);
  }

  await zipFiles(outDir, zipPath);
  await sendEmail(zipPath, email, producerName);
}

module.exports = { generatePack };

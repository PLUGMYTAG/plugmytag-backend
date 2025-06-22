// utils/generatePack.js
const fs        = require("fs");
const path      = require("path");
const archiver  = require("archiver");
const fetch     = require("node-fetch");
const { getRandomTagText } = require("./getRandomTagText");
const voices    = require("../data/plugmytag_10_tag_test_config.json");
const { applyEffects }     = require("./ffmpeg");

async function generateVoiceTag(text, voiceId, outputPath, apiKey) {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
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
    }
  );
  if (!res.ok) throw new Error(`ElevenLabs error: ${res.statusText}`);
  const buf = await res.arrayBuffer();
  fs.writeFileSync(outputPath, Buffer.from(buf));
}

function zipFiles(folderPath, zipPath) {
  return new Promise((resolve, reject) => {
    const output  = fs.createWriteStream(zipPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(folderPath, false);
    archive.finalize();
  });
}

/**
 * Genereert een zip met N tags, applyEffects, en retourneert het pad naar de ZIP.
 */
async function generatePack(producerName, amount, apiKey) {
  // 1) Map voor deze run aanmaken
  const runDir = path.join(__dirname, "../output", `${producerName}-${Date.now()}`);
  fs.mkdirSync(runDir, { recursive: true });

  // 2) Kies EXACT {amount} eerste stemmen (in config staan 10)
  const selected = voices.slice(0, amount);

  for (let i = 0; i < selected.length; i++) {
    const { voice_id } = selected[i];
    const text    = getRandomTagText(producerName);
    const rawMp3  = path.join(runDir, `${producerName}_${voice_id}.mp3`);
    const fxMp3   = path.join(runDir, `${producerName}_${voice_id}_fx.mp3`);

    // 2a) TTS
    await generateVoiceTag(text, voice_id, rawMp3, apiKey);

    // 2b) FX toepassen
    await applyEffects(rawMp3, fxMp3);

    // 2c) Raw mp3 opruimen, hernoem fx naar origineel naam
    fs.unlinkSync(rawMp3);
    fs.renameSync(fxMp3, rawMp3);
  }

  // 3) ZIP maken
  const zipPath = runDir + ".zip";
  await zipFiles(runDir, zipPath);

  return zipPath;
}

module.exports = { generatePack };

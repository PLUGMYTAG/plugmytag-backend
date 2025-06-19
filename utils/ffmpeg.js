// ffmpeg.js
const { exec } = require("child_process");

function applyEffects(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const filters = [
      // 1) Slapback echo
      "aecho=0.8:0.9:100|200:0.3|0.3",
      // 2) Compressie
      "acompressor=threshold=-20dB:ratio=3:attack=10:release=200",
      // 3) Pitch shift (geen verandering = factor 1.0)
      "asetrate=44100*1.0,aresample=44100"
    ].join(",");

    const cmd = `ffmpeg -y -i "${inputPath}" -af "${filters}" "${outputPath}"`;
    console.log("🔊 Running ffmpeg:", cmd);

    exec(cmd, (err, _stdout, stderr) => {
      if (err) {
        console.error("❌ FFmpeg failed:", stderr);
        return reject(err);
      }
      resolve();
    });
  });
}

module.exports = { applyEffects };

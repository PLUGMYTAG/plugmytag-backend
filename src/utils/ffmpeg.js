// src/utils/ffmpeg.js
const { exec } = require("child_process");

function applyEffects(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    // 130 BPM → 1 kwartnoot ≈462ms, nootwaarden
    const quarter = Math.round(60000 / 130);  // ≈462
    const half    = quarter * 2;              // ≈924
    const whole   = quarter * 4;              // ≈1848

    // Pitch shift +5 halve tonen (factor ≈1.33484)
    const semitones   = 5;
    const pitchFactor = Math.pow(2, semitones / 12);

    // **GEEN** 'afir=reverb' meer – alleen echo, compressor en pitch
    const filters = [
      `aecho=0.8:0.9:${quarter}|${half}:0.5|0.3`,
      `aecho=0.6:0.7:${whole}|${whole * 2}:0.3|0.2`,
      `acompressor=threshold=-20dB:ratio=4:attack=10:release=200`,
      `asetrate=44100*${pitchFactor.toFixed(5)},aresample=44100`
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

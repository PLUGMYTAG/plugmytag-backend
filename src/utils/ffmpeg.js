// utils/ffmpeg.js
const { exec } = require("child_process");

function applyEffects(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    // 130 BPM timings
    const quarter = Math.round(60000 / 130);  // ≈462 ms
    const half    = quarter * 2;              // ≈924 ms
    const whole   = quarter * 4;              // ≈1848 ms

    // Pitch shift van +5 halve tonen
    const semitones   = 5;
    const pitchFactor = Math.pow(2, semitones / 12);

    const filters = [
      // Slapback echo (quarter + half)
      `aecho=0.8:0.9:${quarter}|${half}:0.5|0.3`,
      // Lange reverb-simulatie via tweede echo (whole + 2×whole)
      `aecho=0.6:0.7:${whole}|${whole * 2}:0.3|0.2`,
      // Compressie
      `acompressor=threshold=-20dB:ratio=4:attack=10:release=200`,
      // Pitch‐shift
      `asetrate=44100*${pitchFactor.toFixed(5)},aresample=44100`
    ].join(",");

    console.log("🔊 FFmpeg filters:", filters);

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

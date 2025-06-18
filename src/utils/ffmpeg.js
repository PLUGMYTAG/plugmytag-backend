// utils/ffmpeg.js
const { exec } = require("child_process");

function applyEffects(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    // Bereken BPM‐timings voor 130 BPM
    const quarterMs = Math.round(60000 / 130);      // ca. 462 ms
    const halfMs    = quarterMs * 2;                // ca. 924 ms
    const wholeMs   = quarterMs * 4;                // ca. 1848 ms

    // Pitch shift: 5 halve tonen omhoog
    const semitones   = 5;
    const pitchFactor = Math.pow(2, semitones / 12);

    const filters = [
      // 1) Slapback echo (quarter + half)
      `aecho=0.8:0.9:${quarterMs}|${halfMs}:0.5|0.3`,
      // 2) Extra lange “reverb” via tweede echo (whole + 2×whole)
      `aecho=0.6:0.7:${wholeMs}|${wholeMs * 2}:0.3|0.2`,
      // 3) Compressie
      `acompressor=threshold=-20dB:ratio=4:attack=10:release=200`,
      // 4) Pitch shift
      `asetrate=44100*${pitchFactor.toFixed(5)},aresample=44100`
    ].join(',');

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

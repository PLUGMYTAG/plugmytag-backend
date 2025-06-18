// src/utils/ffmpeg.js
const { exec } = require("child_process")

function applyEffects(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    // 130 BPM → kwartnoot ≈462 ms, halve noot ≈924 ms, hele noot ≈1848 ms
    const quarter = Math.round(60000 / 130)
    const half    = quarter * 2
    const whole   = quarter * 4

    // +5 halve tonen → pitch‐factor ≈1.33484
    const semitones  = 5
    const pitchFactor = Math.pow(2, semitones/12)

    const filters = [
      // 1) Slap-back echo
      `aecho=0.8:0.9:${quarter}|${half}:0.5|0.3`,
      // 2) Compressie
      "acompressor=threshold=-20dB:ratio=4:attack=10:release=200",
      // 3) Distortion
      "acrusher=bits=3:mix=1",
      // 4) Pitch-shift
      `asetrate=44100*${pitchFactor.toFixed(5)},aresample=44100`
    ].join(",")

    const cmd = `ffmpeg -y -i "${inputPath}" -af "${filters}" "${outputPath}"`
    console.log("🔊 Running ffmpeg:", cmd)

    exec(cmd, (err, _stdout, stderr) => {
      if (err) {
        console.error("❌ FFmpeg failed:", stderr)
        return reject(err)
      }
      resolve()
    })
  })
}

module.exports = { applyEffects }

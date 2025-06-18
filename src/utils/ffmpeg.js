const { exec } = require("child_process")

function applyEffects(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    // op 130 BPM:
    const quarter = Math.round(60000 / 130) // ≈461 ms
    const half    = quarter * 2            // ≈922 ms
    const whole   = quarter * 4            // ≈1844 ms

    // semitone shift (5 halve tonen omhoog)
    const semitones  = 5
    const pitchFactor = Math.pow(2, semitones / 12)

    // utils/ffmpeg.js

const filters = [
  // 1) Slapback echo op 130 BPM (462ms & 924ms)
  "aecho=0.8:0.9:462|924:0.5|0.3",
  // 2) Lange reverb via tweede echo
  "aecho=0.6:0.7:1800|3600:0.3|0.2",
  // 3) Compressie
  "acompressor=threshold=-20dB:ratio=4:attack=10:release=200",
  // 4) Pitch‐shift +1 semitoon
  "asetrate=44100*1.05946,aresample=44100"
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

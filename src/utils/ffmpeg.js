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

    const filters = [
  // Slapback echo op 130 BPM (one‐beat=462 ms, two‐beat=924 ms):
  "aecho=0.8:0.9:462|924:0.5|0.3",
  // eenvoudige reverb met tweede echo (lange, zwakkere echo):
  "aecho=0.6:0.7:1800|3600:0.2|0.2",
  // compressie vlakknijpen van dynamiek
  "acompressor=threshold=-20dB:ratio=4:attack=10:release=200",
  // pitch shift (±1 semitoon omhoog, C→C#; pas factor aan voor andere intervallen)
  "asetrate=44100*1.05946,aresample=44100"
].join(",");


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

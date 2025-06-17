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
      // 0) Compression
      "acompressor=threshold=0.3:ratio=6:attack=5:release=50",

      // 1) Slapback echo met langere delays
      `aecho=0.8:0.9:${half}|${whole}:0.4|0.4`,

      // 2) Rijke reverb
      "afir=reverb=50|50|20|0.7",

      // 3) Stutter/glitch op halve noten
      `adelay=${half}|${half},areverse,adelay=${half}|${half},areverse`,

      // 4) Vette distortion
      "acrusher=bits=3:mix=1",

      // 5) Pitch shift (transponeer +5 halve tonen)
      `asetrate=44100*${pitchFactor},aresample=44100`
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

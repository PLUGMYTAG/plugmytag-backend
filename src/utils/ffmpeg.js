const { exec } = require("child_process")

function applyEffects(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    // bereken op 130 BPM:
    // quarterNote = 60_000ms / BPM ≈ 461ms
    // halfNote    = quarterNote * 2 ≈ 923ms
    const quarter = 461
    const half    = quarter * 2

    // semitone shift: C majeur vanaf A (3 halve tonen omhoog)
    // factor = 2^(semitones/12)
    const semitones = 3
    const pitchFactor = Math.pow(2, semitones/12)

    const filters = [
      // 1) Slapback echo op kwart & halve noot
      `aecho=0.8:0.9:${quarter}|${half}:0.4|0.4`,
      // 2) Diepe reverb met decay en wet/dry mix
      //    gebruik herefir of freeverb
      `afir=reverb=50|50|20|0.7`,
      // 3) Stutter/glitch op kwartnoten
      `adelay=${quarter}|${quarter},areverse,adelay=${quarter}|${quarter},areverse`,
      // 4) Vette distortion
      `acrusher=bits=3:mix=1`,
      // 5) Transponeer naar C (C major root) door sample-rate
      `asetrate=44100*${pitchFactor},aresample=44100`,
    ].join(',')

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

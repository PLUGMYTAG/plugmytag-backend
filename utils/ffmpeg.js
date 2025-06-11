const { exec } = require("child_process")

function applyEffects(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const filters = [
      // 1) Slapback echo (2 delays + 2 decays)
      "aecho=0.8:0.9:100|200:0.4|0.4",
      // 2) Extra reverb
      "aecho=0.6:0.8:500:0.3",              
      // 3) Stutter/glitch
      "adelay=150|150,areverse,adelay=150|150,areverse",
      // 4) Heftige distortion
      "acrusher=bits=3:mix=1",
      // 5) Pitch drop (–15%)
      "asetrate=44100*0.85,aresample=44100"
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

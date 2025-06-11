// utils/ffmpeg.js
const { exec } = require("child_process")

function applyEffects(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    // Super-charged effecten:
    const filters = [
      // 1) Sterke echo voor diepte
      "aecho=0.9:0.9:1000:0.5",
      // 2) Kortere, scherpere reverb (extra echo)
      "aecho=0.6:0.8:200:0.4",
      // 3) Duidelijke “stutter” stottering
      "adelay=200|200,areverse,adelay=200|200,areverse",
      // 4) Heftige distortion / bitcrusher
      "acrusher=bits=2:mix=1",
      // 5) Duidelijke pitch shift (–15%)
      "asetrate=44100*0.85,aresample=44100"
    ].join(",")

    const cmd =
      `ffmpeg -y -i "${inputPath}" -af "${filters}" "${outputPath}"`
    console.log("🔊 Running ffmpeg:", cmd)

    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error("❌ FFmpeg failed:", stderr)
        return reject(err)
      }
      resolve()
    })
  })
}

module.exports = { applyEffects }

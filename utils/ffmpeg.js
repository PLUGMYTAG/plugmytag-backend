const { exec } = require("child_process")

function applyEffects(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    // Alle effecten gecombineerd:
    const filters = [
      // echo
      "aecho=0.8:0.9:1000:0.3",
      // extra echo als reverb
      "aecho=0.8:0.9:1000|500:0.5|0.3",
      // stutter
      "adelay=150|150,areverse,adelay=150|150,areverse",
      // distortion / bitcrusher
      "acrusher=bits=4:mix=1",
      // pitch shift (–10%)
      "asetrate=44100*0.9,aresample=44100"
    ].join(",")

    const cmd = `ffmpeg -y -i "${inputPath}" -af "${filters}" "${outputPath}"`
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

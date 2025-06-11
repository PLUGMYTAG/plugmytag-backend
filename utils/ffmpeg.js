// utils/ffmpeg.js
const { exec } = require("child_process")

function applyEffects(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const filters = [
      // 1) Snelle slapback echo voor punch
      "aecho=0.8:0.9:100|200:0.4",
      // 2) Diepe hall-style reverb
      "afir=gtype=gverb:room_scale=50:reverberance=70:wet_gain=5",
      // 3) Stutter/glitch effect (rapid cuts)
      "atrim=0:0.5,asetpts=PTS-STARTPTS,aloop=loop=3:size=44100",
      // 4) Bit-crush distortion voor grit
      "acrusher=bits=3:mix=0.8",
      // 5) Sub-octave drop (pitchedown) voor dark vibe
      "asetrate=44100*0.85,aresample=44100"
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

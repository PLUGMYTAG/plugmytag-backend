const { exec } = require("child_process");

function applyEffects(input, output) {
  return new Promise((resolve, reject) => {
    const filters = [
      // jouw oorspronkelijke filters
      "aecho=0.8:0.9:100|200:0.3|0.3",
      "acompressor=threshold=-20dB:ratio=3:attack=10:release=200",
      "asetrate=44100*1.0,aresample=44100"
    ].join(",");

    const cmd = `ffmpeg -y -i "${input}" -af "${filters}" "${output}"`;
    exec(cmd, (err, _so, se) => err ? reject(se) : resolve());
  });
}

module.exports = { applyEffects };

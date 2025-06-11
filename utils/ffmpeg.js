
const { exec } = require("child_process");

function applyEffects(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        const filters = [
            "aecho=0.8:0.9:1000:0.3",
            "aecho=0.8:0.9:500|1000:0.3|0.25",
            "adelay=30|30,areverse,adelay=30|30,areverse",
            "acrusher=bits=8:mix=0.8",
            "asetrate=44100*0.9,aresample=44100"
        ].join(",");

        const cmd = `ffmpeg -y -i ${inputPath} -af "${filters}" ${outputPath}`;
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error("FFmpeg error:", error);
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

module.exports = { applyEffects };

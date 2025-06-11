
# PlugMyTag Backend (Render-ready)

## 🔧 What this does:
- Accepts text input via POST `/generate-tag`
- Uses ElevenLabs to generate voice
- Applies professional audio effects via ffmpeg:
  - Reverb
  - Echo
  - Stutter
  - Distortion
  - Pitch shift
- Returns final .mp3 file for download

## 🚀 Deploy to Render
1. Create new Web Service on [Render](https://render.com/)
2. Use this repo zipped or connect to GitHub
3. Add environment variables:
   - ELEVEN_API_KEY
   - ELEVEN_VOICE_ID
4. Use `npm install` then `npm start`

## 🧪 Test locally
```bash
npm install
node server.js
```

Then POST to:
`http://localhost:3000/generate-tag` with body:
```json
{ "text": "Your tag line here" }
```

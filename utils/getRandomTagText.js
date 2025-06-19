// getRandomTagText.js
const templates = [
  "This is a tag for >PRODUCER<",
  "Yo, it's >PRODUCER< in the building",
  // … vul aan …
];

function getRandomTagText(producerName) {
  const tpl = templates[Math.floor(Math.random() * templates.length)];
  return tpl.replace(/>PRODUCER</g, producerName);
}

module.exports = { getRandomTagText };

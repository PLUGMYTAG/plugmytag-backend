const tagVariations = [
  "{name} on the beat!",
  "{name} made this beat!",
  "This one's tagged by {name}.",
  "You're now listening to {name}.",
  "{name} just dropped this.",
  "It's a {name} exclusive.",
  "{name} in the mix.",
  "Powered by PlugMyTag – {name}.",
  "This beat is owned by {name}.",
  "You’re locked in with {name}."
];

function getRandomTagText(producerName) {
  const pick = tagVariations[Math.floor(Math.random() * tagVariations.length)];
  return pick.replace("{name}", producerName);
}

module.exports = { getRandomTagText };

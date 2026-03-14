function randomInt(min, max) {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

function pickOne(items) {
  return items[Math.floor(Math.random() * items.length)];
}

module.exports = { randomInt, pickOne };


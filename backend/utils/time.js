function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function addMs(date, ms) {
  return new Date(date.getTime() + ms);
}

module.exports = { sleep, addMs };


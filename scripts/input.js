const readlineSync = require("readline-sync");

const input = () => {
  const content = {};

  content.searchTerm = askAndReturnSearchTerm();
  content.prefix = askAndReturnPrefix();

  return content;
};

const askAndReturnSearchTerm = () => {
  return readlineSync.question("Type a Wikipedia search term: ");
};

const askAndReturnPrefix = () => {
  const prefixes = ["Who is", "What is", "The history of"];

  const selectedPrefixIndex = readlineSync.keyInSelect(
    prefixes,
    "Choose one options"
  );

  return prefixes[selectedPrefixIndex];
};

module.exports = input;

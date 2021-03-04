const readlineSync = require("readline-sync");
const state = require("./state");

const input = () => {
  const content = {
    maximumSentences: 7,
  };
  content.searchTerm = askAndReturnSearchTerm();
  content.prefix = askAndReturnPrefix();
  state.save(content);
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

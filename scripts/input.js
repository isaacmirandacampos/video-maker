const readlineSync = require("readline-sync");
const state = require("./state");

const input = () => {
  const content = {
    maximumSentences: 7,
  };
  content.lang = askAndReturnLanguage();
  content.searchTerm = askAndReturnSearchTerm(content);
  content.prefix = askAndReturnPrefix(content);
  state.save(content);
};
const askAndReturnLanguage = () => {
  const langs = ["pt", "en"];

  const selectedPrefixIndex = readlineSync.keyInSelect(
    langs,
    "Choose one language / Escolha uma das linguagens"
  );

  return langs[selectedPrefixIndex];
};

const askAndReturnSearchTerm = (content) => {
  return readlineSync.question(
    content.lang === "pt"
      ? "Digite um termo para pesquisa no Wikipedia: "
      : "Type a Wikipedia search term: "
  );
};

const askAndReturnPrefix = (content) => {
  const prefixes =
    content.lang === "pt"
      ? ["Quem é", "O que é", "A história do"]
      : ["Who is", "What is", "The history of"];

  const selectedPrefixIndex = readlineSync.keyInSelect(
    prefixes,
    content.lang === "pt" ? "Escolha uma das opções: " : "Choose one options: "
  );
  return prefixes[selectedPrefixIndex];
};

module.exports = input;

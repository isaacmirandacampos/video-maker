const algorithmia = require("algorithmia");
const algorithmiaApiKey = require("../credentials/algorithmia.json").api_key;
const sentenceBoundaryDetection = require("sbd");

const text = async (content) => {
  content.sourceContentOriginal = await fetchContentFromWikipedia(content);
  content.sourceContentSanitized = sanitizeContent(content);
  content.sentences = breakContentIntoSentences(content);
  console.log(content.sentences);
};

const fetchContentFromWikipedia = async (content) => {
  const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
  const wikipediaAlgorithm = algorithmiaAuthenticated.algo(
    "web/WikipediaParser/0.1.2"
  );
  const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm);
  const wikipediaContent = wikipediaResponse.get();

  return wikipediaContent.content;
};

const sanitizeContent = (content) => {
  const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(
    content.sourceContentOriginal
  );
  const withoutDatesInParentheses = removeDatesInParentheses(
    withoutBlankLinesAndMarkdown
  );

  return withoutDatesInParentheses;
};

const removeBlankLinesAndMarkdown = (text) => {
  const allLines = text.split("\n");

  return allLines
    .filter((line) => {
      if (line.trim().length === 0 || line.trim().startsWith("=")) {
        return false;
      }
      return true;
    })
    .join(" ");
};

const removeDatesInParentheses = (text) => {
  return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, "").replace(/  /g, " ");
};

const breakContentIntoSentences = (content) => {
  const arrayTemp = [];
  const sentences = sentenceBoundaryDetection.sentences(
    content.sourceContentSanitized
  );
  sentences.forEach((sentence) => {
    arrayTemp.push({
      text: sentence,
      keywords: [],
      images: [],
    });
  });

  return arrayTemp;
};

module.exports = text;

const algorithmia = require("algorithmia");
const wiki = require("wikipedia");

const algorithmiaApiKey = require("../credentials/algorithmia.json").api_key;
const sentenceBoundaryDetection = require("sbd");
const watsonApiKey = require("../credentials/watson-nlu.json").apikey;
const state = require("./state");

const NaturalLanguageUnderstandingV1 = require("watson-developer-cloud/natural-language-understanding/v1");

const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: "2018-04-05",
  url: "https://gateway.watsonplatform.net/natural-language-understanding/api/",
});

const text = async () => {
  const content = state.load();
  content.sourceContentOriginal = await fetchContentFromWikipedia(content);
  content.sourceContentSanitized = sanitizeContent(content);
  content.sentences = breakContentIntoSentences(content);
  content.sentences = limitMaximumSentences(content);
  content.sentences = await fetchKeywordsOfAllSentences(content);
  state.save(content);
};

const fetchContentFromWikipedia = async (content) => {
  // const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
  // const wikipediaAlgorithm = algorithmiaAuthenticated.algo(
  //   "web/WikipediaParser/0.1.2"
  // );
  // const wikipediaResponse = await wikipediaAlgorithm.pipe({
  //   lang: content.lang,
  //   articleName: content.searchTerm,
  // });
  // const wikipediaContent = wikipediaResponse.get();
  // return wikipediaContent.content;
  console.log("> Pesquisando na wikipedia ");
  await wiki.setLang(content.lang);
  const getPage = await wiki.page(content.searchTerm);
  const getText = await getPage.content();
  console.log("> Baixando os textos da wikipedia");
  return getText;
};

const sanitizeContent = (content) => {
  console.log("> Removendo markdowns do texto");
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
  console.log("> Quebrando texto em sentenças");
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

const limitMaximumSentences = (content) => {
  return content.sentences.slice(0, content.maximumSentences);
};

const fetchKeywordsOfAllSentences = async (content) => {
  console.log("> Pegando keywords das sentenças");
  for (const sentence of content.sentences) {
    sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text);
  }
  return content.sentences;
};

const fetchWatsonAndReturnKeywords = async (sentence) => {
  return new Promise((resolve, reject) => {
    nlu.analyze(
      {
        text: sentence,
        features: {
          keywords: {},
        },
      },
      function (err, response) {
        if (err) {
          throw err;
        } else {
          const keywords = response.keywords.map((keyword) => keyword.text);
          resolve(keywords);
        }
      }
    );
  });
};

module.exports = text;

const google = require("googleapis").google;
const state = require("./state");
const googleSearchCredentials = require("../credentials/google-search.json");

const customSearch = google.customsearch("v1");
const image = async () => {
  let content = state.load();

  content = await fetchImagesOfAllSentences(content);

  state.save(content);
};

const fetchImagesOfAllSentences = async (content) => {
  for (const sentence of content.sentences) {
    const query = `${content.searchTerm} ${sentence.keywords[0]}`;

    sentence.images = await fetchGoogleAndReturnImagesLinks(query);

    sentence.googleSearchQuery = query;
  }
  return content;
};

const fetchGoogleAndReturnImagesLinks = async (query) => {
  const response = await customSearch.cse.list({
    auth: googleSearchCredentials.apiKey,
    cx: googleSearchCredentials.searchEngineId,
    q: query,
    searchType: "image",
    num: 2,
  });

  return response.data.items.map((item) => item.link);
};

module.exports = image;

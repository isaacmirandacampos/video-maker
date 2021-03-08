const google = require("googleapis").google;

const imageDownloader = require("image-downloader");
const state = require("./state");
const googleSearchCredentials = require("../credentials/google-search.json");
const customSearch = google.customsearch("v1");

const image = async () => {
  let content = state.load();
  content = await fetchImagesOfAllSentences(content);
  await downloadAllImages(content);
  state.save(content);
};

const fetchImagesOfAllSentences = async (content) => {
  console.log("> Buscando imagens");
  for (const sentence of content.sentences) {
    const query = `${content.searchTerm} ${sentence.keywords[0]}`;

    sentence.images = await fetchGoogleAndReturnImagesLinks(query, content);
    sentence.googleSearchQuery = query;
  }
  console.log("> Imagens encontradas");
  return content;
};

const fetchGoogleAndReturnImagesLinks = async (query) => {
  console.log(`> Pegando imagem com a query: ${query}`);

  const response = await customSearch.cse.list({
    auth: googleSearchCredentials.apiKey,
    cx: googleSearchCredentials.searchEngineId,
    q: query,
    searchType: "image",
    num: 4,
  });

  return response?.data?.items?.map((item) => item?.link);
};

const downloadAllImages = async (content) => {
  content.downloadedImages = [];

  for (
    let sentenceIndex = 0;
    sentenceIndex < content.sentences.length;
    sentenceIndex++
  ) {
    const images = content.sentences[sentenceIndex].images;

    for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
      const imageUrl = images[imageIndex];
      try {
        if (content.downloadedImages.includes(imageUrl)) {
          throw new Error("Imagem já foi baixada");
        }

        await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`);

        content.downloadedImages.push(imageUrl);

        console.log(
          `> [${sentenceIndex}][${imageIndex}] Baixou imagem com sucesso: ${imageUrl}`
        );
        break;
      } catch (error) {
        console.log(
          `> [${sentenceIndex}][${imageIndex}] Erro ao baixar (${imageUrl}) ${error}`
        );
      }
    }
  }
};

const downloadAndSave = (url, fileName) =>
  imageDownloader.image({
    url,
    url,
    dest: `./content/${fileName}`,
  });

module.exports = image;

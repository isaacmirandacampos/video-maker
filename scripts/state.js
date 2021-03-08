const fs = require("fs");
const contentFilePath = "./content.json";
const scriptFilePath = "./content/video-script.js";

const save = (content) => {
  const contentString = JSON.stringify(content);
  return fs.writeFileSync(contentFilePath, contentString);
};

function saveScript(content) {
  const contentString = JSON.stringify(content);
  const scriptString = `var content = ${contentString}`;
  return fs.writeFileSync(scriptFilePath, scriptString);
}

const load = () => {
  const fileBuffer = fs.readFileSync(contentFilePath, "utf-8");
  return JSON.parse(fileBuffer);
};

module.exports = {
  save,
  saveScript,
  load,
};

const scripts = {
  input: require("./scripts/input"),
  text: require("./scripts/text"),
};

const start = async () => {
  const content = scripts.input();
  console.log(content);
  await scripts.text(content);
};

start();

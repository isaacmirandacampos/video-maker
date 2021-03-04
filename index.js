const scripts = {
  state: require("./scripts/state"),
  input: require("./scripts/input"),
  text: require("./scripts/text"),
  image: require("./scripts/image"),
};

const start = async () => {
  // scripts.input();
  // await scripts.text();
  await scripts.image();

  const content = scripts.state.load();

  console.dir(content, { depth: null });
};

start();

const scripts = {
  input: require("./scripts/input"),
  text: require("./scripts/text"),
  state: require("./scripts/state"),
};

const start = async () => {
  scripts.input();
  await scripts.text();
  const content = scripts.state.load();

  console.dir(content, { depth: null });
};

start();

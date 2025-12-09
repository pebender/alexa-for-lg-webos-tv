const bridge = require("./dist");

bridge.startBridge().catch((error) => {
  console.log(error);
});

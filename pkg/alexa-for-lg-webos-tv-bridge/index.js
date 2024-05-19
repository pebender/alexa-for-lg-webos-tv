const bridge = require("./lib/bridge");

bridge.startBridge().catch((error) => {
  console.log(error);
});

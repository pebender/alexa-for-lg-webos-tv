const bridge = require('./lib/gateway')

bridge.startBridge()
  .catch((error) => {
    console.log(error)
  })

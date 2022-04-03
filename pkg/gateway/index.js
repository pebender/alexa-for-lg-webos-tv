const gateway = require('./lib/gateway')

gateway.startGateway()
  .catch((error) => {
    console.log(error)
  })

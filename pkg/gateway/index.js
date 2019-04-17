// eslint-disable-next-line @typescript-eslint/no-var-requires
const gateway = require("./lib/gateway");

gateway.startGateway().
    catch((error) => {
        console.log(error);
    });
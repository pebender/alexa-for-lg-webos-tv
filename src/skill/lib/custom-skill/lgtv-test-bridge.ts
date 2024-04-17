import * as Common from "../../../common";
import { HandlerInput as ASKHandlerInput } from "ask-sdk-core/dist/dispatcher/request/handler/HandlerInput";
import * as ASKRequestEnvelope from "ask-sdk-core/dist/util/RequestEnvelopeUtils";
import * as ASKModel from "ask-sdk-model";
import * as Database from "../database";
import * as net from "node:net";
import * as tls from "node:tls";

function getEndpointAndAccessToken(
  handlerInput: ASKHandlerInput,
): Promise<{ endpoint: string; accessToken: string }> {
  return new Promise((resolve, reject): void => {
    const endpoint = handlerInput.requestEnvelope.context.System.apiEndpoint;
    if (typeof endpoint === "undefined") {
      reject(new Error());
    }
    const accessToken =
      handlerInput.requestEnvelope.context.System.apiAccessToken;
    if (typeof accessToken === "undefined") {
      reject(new Error());
    }
    resolve({ endpoint, accessToken: accessToken as string });
  });
}

function getEmail(endpoint: string, accessToken: string): Promise<string> {
  return new Promise((resolve, reject): void => {
    Common.Profile.CS.getUserEmail(endpoint, accessToken)
      .then(resolve)
      .catch(() => reject(new Error()));
  });
}

async function getBridgeHostnameAndToken(
  email: string,
): Promise<Database.BridgeInformation | null> {
  try {
    return await Database.getBridgeInformationUsingEmail(email);
  } catch (error) {
    throw new Error();
  }
}

function testTcp(hostname: string, port: number): Promise<void> {
  return new Promise((resolve, reject): void => {
    const client = net.connect(port, hostname);
    client
      .on("connect", (): void => {
        client.end();
      })
      .on("close", (): void => {
        resolve();
      })
      .on("error", (error): void => {
        reject(error);
      });
  });
}

function testTls(hostname: string, port: number): Promise<void> {
  return new Promise((resolve, reject): void => {
    const client = tls.connect(port, hostname, { rejectUnauthorized: false });
    client
      .on("secureConnect", (): void => {
        client.end();
      })
      .on("close", (): void => {
        resolve();
      })
      .on("error", (error): void => {
        reject(error);
      });
  });
}

function testTlsTestCertificate(hostname: string, port: number): Promise<void> {
  return new Promise((resolve, reject): void => {
    const client = tls.connect(port, hostname);
    client
      .on("secureConnect", (): void => {
        client.end();
      })
      .on("close", (): void => {
        resolve();
      })
      .on("error", (error): void => {
        reject(error);
      });
  });
}

function testTlsTestHostname(hostname: string, port: number): Promise<void> {
  return new Promise((resolve, reject): void => {
    const client = tls.connect(port, hostname, { servername: hostname });
    client
      .on("secureConnect", (): void => {
        client.end();
      })
      .on("close", (): void => {
        resolve();
      })
      .on("error", (error): void => {
        reject(error);
      });
  });
}

async function testBridgeConnection(
  hostname: string,
  port: number,
  bridgeToken: string,
): Promise<void> {
  const requestOptions: Common.HTTPSRequest.RequestOptions = {
    hostname,
    path: Common.constants.bridge.path.test,
    port,
    method: "GET",
    headers: {},
  };
  return new Promise((resolve, reject): void => {
    Common.HTTPSRequest.request(requestOptions, bridgeToken)
      .then(resolve)
      .catch(reject);
  });
}

async function test(handlerInput: ASKHandlerInput): Promise<string> {
  const { endpoint, accessToken } =
    await getEndpointAndAccessToken(handlerInput);
  let email;
  try {
    email = await getEmail(endpoint, accessToken);
  } catch {
    const speechOutput =
      "There appears to have been a problem with account linking. " +
      "Relink your account and reconfigure your bridge.";
    throw speechOutput;
  }
  let bridgeHostnameAndToken;
  try {
    bridgeHostnameAndToken = await getBridgeHostnameAndToken(email);
  } catch {
    const speechOutput =
      "There was a problem access the database. " + "Test your bridge again.";
    throw speechOutput;
  }
  if (!bridgeHostnameAndToken) {
    const speechOutput = "Your bridge had not been configured.";
    throw speechOutput;
  }
  const { hostname, bridgeToken } = bridgeHostnameAndToken;
  const port = Common.constants.bridge.port.https;
  try {
    await testTcp(hostname, Common.constants.bridge.port.https);
  } catch {
    const speechOutput =
      `Could not connect to ${hostname} on port ${port}. ` +
      "Be sure the port is forwarded to your reverse proxy and your reverse proxy is properly configured";
    throw speechOutput;
  }
  try {
    await testTls(hostname, port);
  } catch {
    const speechOutput =
      `Could not securely connect to ${hostname} on port ${port}. ` +
      "Be sure your reverse proxy is properly configured";
    throw speechOutput;
  }
  try {
    await testTlsTestCertificate(hostname, port);
  } catch {
    const speechOutput =
      "Could not authenticate your TLS certificate against any trusted certificate authorities. " +
      "Be sure your TLS certificate has been signed by a trusted certificate authority.";
    throw speechOutput;
  }
  try {
    await testTlsTestHostname(hostname, port);
  } catch {
    const speechOutput =
      `Your TLS certificate is not for ${hostname}. ` +
      "Either replace your TLS certificate or reconfigure your bridge.";
    throw speechOutput;
  }
  try {
    await testBridgeConnection(hostname, port, bridgeToken);
  } catch (error: any) {
    Common.Debug.debug("testBridgeConnection error:");
    Common.Debug.debug(error.name);
    switch (error.name) {
      case "BAD_GATEWAY": {
        const speechOutput =
          "Could not connect to your bridge. " +
          "Be sure your reverse proxy is forwarding requests to your bridge, and be sure your bridge is running.";
        throw speechOutput;
      }
      case "INVALID_AUTHORIZATION_CREDENTIAL": {
        const speechOutput =
          "Could not authenticate with your bridge. " +
          `Be sure your bridge allows your bridge hostname and user email to connect. " + After that, reconfigure your bridge.`;
        throw speechOutput;
      }
    }
    const speechOutput =
      "There was a problem connecting to your bridge. " +
      `Be sure your proxy and bridge are configured correctly.`;
    throw speechOutput;
  }
  const speechOutput = "Congratulations, your bridge is configured correctly.";
  return speechOutput;
}

const TestBridgeIntentHandler = {
  canHandle(handlerInput: ASKHandlerInput): boolean {
    return (
      ASKRequestEnvelope.getRequestType(handlerInput.requestEnvelope) ===
        "IntentRequest" &&
      ASKRequestEnvelope.getIntentName(handlerInput.requestEnvelope) ===
        "LGTV_TestBridgeIntent"
    );
  },
  async handle(handlerInput: ASKHandlerInput): Promise<ASKModel.Response> {
    Common.Debug.debugJSON(handlerInput.requestEnvelope);
    try {
      const speechOutput = await test(handlerInput);
      return handlerInput.responseBuilder
        .speak(speechOutput)
        .withShouldEndSession(true)
        .getResponse();
    } catch (error: any) {
      const speechOutput = error as string;
      return handlerInput.responseBuilder
        .speak(speechOutput)
        .withShouldEndSession(true)
        .getResponse();
    }
  },
};

const handlers = [TestBridgeIntentHandler];

export { handlers };

import type { HandlerInput as ASKHandlerInput } from "ask-sdk-core/dist/dispatcher/request/handler/HandlerInput";
import * as ASKRequestEnvelope from "ask-sdk-core/dist/util/RequestEnvelopeUtils";
import type * as ASKModel from "ask-sdk-model";
import * as Common from "../../../common";
import * as Link from "../link";

async function test(handlerInput: ASKHandlerInput): Promise<string> {
  const accessToken =
    handlerInput.requestEnvelope.context.System.user.accessToken;
  if (accessToken === undefined) {
    const speechOutput =
      "There appears to have been a problem with account linking. " +
      "Relink your account and reconfigure your bridge.";
    return speechOutput;
  }

  try {
    await Link.testConnection(accessToken);
  } catch (error) {
    Common.Debug.debugError(error);

    if (
      error instanceof Common.GeneralCommonError &&
      error.code === "unauthorized"
    ) {
      const speechOutput =
        "There appears to have been a problem with account linking. " +
        "Relink your account and reconfigure your bridge.";
      return speechOutput;
    }
    if (error instanceof Common.DatabaseCommonError) {
      const speechOutput =
        "There was a problem access the database. " + "Test your bridge again.";
      return speechOutput;
    }
    if (error instanceof Link.LinkCommonError) {
      switch (error.code) {
        case "bridgeHostnameNotFound": {
          const speechOutput = "Your bridge hostname has not been configured.";
          return speechOutput;
        }
        case "bridgeTokenNotFound": {
          const speechOutput = "Your bridge token has not been acquired.";
          return speechOutput;
        }
        case "tcpConnectionFailed": {
          const speechOutput =
            `Could not connect to {hostname} on port {port}. ` +
            "Be sure the port is forwarded to your reverse proxy and your reverse proxy is properly configured";
          return speechOutput;
        }
        case "tlsConnectionFailed": {
          const speechOutput =
            `Could not securely connect to {hostname} on port {port}. ` +
            "Be sure your reverse proxy is properly configured";
          return speechOutput;
        }
        case "tlsCertificateValidationFailed": {
          const speechOutput =
            "Could not authenticate your TLS certificate against any trusted certificate authorities. " +
            "Be sure your TLS certificate has been signed by a trusted certificate authority.";
          return speechOutput;
        }
        case "tlsCertificateHostnameValidationFailed": {
          const speechOutput =
            `Your TLS certificate is not for {hostname}. ` +
            "Either replace your TLS certificate or reconfigure your bridge.";
          return speechOutput;
        }
        case "httpConnectionFailed": {
          const speechOutput =
            "Could not connect to your bridge. " +
            "Be sure your reverse proxy is forwarding requests to your bridge, and be sure your bridge is running.";
          return speechOutput;
        }
        case "authorizationFailed": {
          const speechOutput =
            "Could not authenticate with your bridge. " +
            `Be sure your bridge allows your bridge hostname and user email to connect. " + After that, reconfigure your bridge.`;
          return speechOutput;
        }
      }
    }

    const speechOutput =
      "There was a problem connecting to your bridge. " +
      `Be sure your proxy and bridge are configured correctly.`;
    return speechOutput;
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
    const speechOutput = await test(handlerInput);
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .withShouldEndSession(true)
      .getResponse();
  },
};

const handlers = [TestBridgeIntentHandler];

export { handlers };

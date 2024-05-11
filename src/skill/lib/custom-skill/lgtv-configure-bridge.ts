import { HandlerInput as ASKHandlerInput } from "ask-sdk-core/dist/dispatcher/request/handler/HandlerInput";
import * as ASKRequestEnvelope from "ask-sdk-core/dist/util/RequestEnvelopeUtils";
import * as ASKModel from "ask-sdk-model";
import * as Common from "../../../common";
import * as Link from "../link";

async function createHostnamesSimpleCardContent(
  handlerInput: ASKHandlerInput,
): Promise<string> {
  const sessionAttributes =
    handlerInput.attributesManager.getSessionAttributes();
  const ipAddressA: number = Number(
    ASKRequestEnvelope.getSlotValue(handlerInput.requestEnvelope, "ipAddressA"),
  );
  const ipAddressB: number = Number(
    ASKRequestEnvelope.getSlotValue(handlerInput.requestEnvelope, "ipAddressB"),
  );
  const ipAddressC: number = Number(
    ASKRequestEnvelope.getSlotValue(handlerInput.requestEnvelope, "ipAddressC"),
  );
  const ipAddressD: number = Number(
    ASKRequestEnvelope.getSlotValue(handlerInput.requestEnvelope, "ipAddressD"),
  );
  sessionAttributes.ipAddress = `${ipAddressA}.${ipAddressB}.${ipAddressC}.${ipAddressD}`;
  Reflect.deleteProperty(sessionAttributes, "hostnames");
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
  try {
    sessionAttributes.hostnames = await Link.getHostnames(
      sessionAttributes.ipAddress,
    );
  } catch (error) {
    Common.Debug.debug(
      `LGTV_ConfigureBridgeIntent: cannot connect to IPv4 address '${sessionAttributes.ipAddress}'.`,
    );
    Common.Debug.debugError(error);
    throw new Error(
      "I had a problem connecting to the bridge's I.P.  address.",
    );
  }
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
  Common.Debug.debug(
    `LGTV_ConfigureBridgeIntent: bridge FQDNs: ${sessionAttributes.hostnames}`,
  );
  let cardContent: string = "";
  let index = 0;
  while (index < sessionAttributes.hostnames.length) {
    cardContent += `${index}: ${sessionAttributes.hostnames[index]}\n`;
    index += 1;
  }
  cardContent += `\n${index}: My bridge is not in the list of hostnames.`;
  index += 1;
  cardContent += `\n${index}: My IP address is not '${sessionAttributes.ipAddress}'.`;
  Common.Debug.debug(
    `LGTV_ConfigureBridgeIntent: bridge FQDN prompt: ${cardContent}`,
  );
  return cardContent;
}

async function setBridgeCredentials(
  handlerInput: ASKHandlerInput,
): Promise<void> {
  const accessToken =
    handlerInput.requestEnvelope.context.System.user.accessToken;
  if (typeof accessToken === "undefined") {
    throw new Error(
      "There was a problem with account linking. Please re-link the skill and try again.",
    );
  }

  const sessionAttributes =
    handlerInput.attributesManager.getSessionAttributes();
  const hostnameIndex: number = Number(
    ASKRequestEnvelope.getSlotValue(
      handlerInput.requestEnvelope,
      "hostnameIndex",
    ) as string,
  );
  const bridgeHostname: string = sessionAttributes.hostnames[
    hostnameIndex
  ] as string;

  let credentials: {
    bridgeHostname: string | null;
    bridgeToken: string | null;
  };
  try {
    credentials = await Link.getCredentials(accessToken, { bridgeHostname });
    Common.Debug.debug("LGTV_ConfigureBridgeIntent: getCredentials: success");
  } catch (error) {
    Common.Debug.debug("LGTV_ConfigureBridgeIntent: getCredentials: error:");
    Common.Debug.debugError(error);
    throw new Error(
      "I encountered a problem creating your bridge's token. So, I cannot configure your bridge.",
    );
  }
  if (typeof credentials.bridgeToken !== "string") {
    Common.Debug.debug("LGTV_ConfigureBridgeIntent: getCredentials: error");
    throw new Error(
      "I encountered a problem creating your bridge's token. So, I cannot configure your bridge.",
    );
  }
}

const ConfigureBridgeIntentHandler = {
  canHandle(handlerInput: ASKHandlerInput): boolean {
    return (
      ASKRequestEnvelope.getRequestType(handlerInput.requestEnvelope) ===
        "IntentRequest" &&
      ASKRequestEnvelope.getIntentName(handlerInput.requestEnvelope) ===
        "LGTV_ConfigureBridgeIntent"
    );
  },
  async handle(handlerInput: ASKHandlerInput): Promise<ASKModel.Response> {
    Common.Debug.debugJSON(handlerInput.requestEnvelope);

    const sessionAttributes =
      handlerInput.attributesManager.getSessionAttributes();
    const intentRequest = handlerInput.requestEnvelope
      .request as ASKModel.IntentRequest;
    const dialogState: ASKModel.DialogState = ASKRequestEnvelope.getDialogState(
      handlerInput.requestEnvelope,
    );
    Common.Debug.debug(`dialogState: ${dialogState}`);

    const ipAddressAString: string | undefined =
      ASKRequestEnvelope.getSlotValue(
        handlerInput.requestEnvelope,
        "ipAddressA",
      );
    const ipAddressBString: string | undefined =
      ASKRequestEnvelope.getSlotValue(
        handlerInput.requestEnvelope,
        "ipAddressB",
      );
    const ipAddressCString: string | undefined =
      ASKRequestEnvelope.getSlotValue(
        handlerInput.requestEnvelope,
        "ipAddressC",
      );
    const ipAddressDString: string | undefined =
      ASKRequestEnvelope.getSlotValue(
        handlerInput.requestEnvelope,
        "ipAddressD",
      );
    const ipAddressValidString: string | undefined =
      ASKRequestEnvelope.getSlotValue(
        handlerInput.requestEnvelope,
        "ipAddressValid",
      );
    const hostnameIndexString: string | undefined =
      ASKRequestEnvelope.getSlotValue(
        handlerInput.requestEnvelope,
        "hostnameIndex",
      );
    Common.Debug.debug(
      `(dirty) address: ${ipAddressAString}.${ipAddressBString}.${ipAddressCString}.${ipAddressDString}, hostnameIndex: ${hostnameIndexString}`,
    );

    const ipAddressA: number = Number(ipAddressAString);
    const ipAddressB: number = Number(ipAddressBString);
    const ipAddressC: number = Number(ipAddressCString);
    const ipAddressD: number = Number(ipAddressDString);
    const hostnameIndex: number = Number(hostnameIndexString);
    Common.Debug.debug(
      `(clean) address: ${ipAddressA}.${ipAddressB}.${ipAddressC}.${ipAddressD}, hostnameIndex: ${hostnameIndex}`,
    );

    if (dialogState === "STARTED") {
      Reflect.deleteProperty(sessionAttributes, "ipAddress");
      Reflect.deleteProperty(sessionAttributes, "hostnames");
      Reflect.deleteProperty(sessionAttributes, "hostnameIndex");

      handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

      if (
        typeof ipAddressAString === "undefined" &&
        typeof ipAddressBString === "undefined" &&
        typeof ipAddressCString === "undefined" &&
        typeof ipAddressDString === "undefined"
      ) {
        return handlerInput.responseBuilder
          .addDelegateDirective()
          .getResponse();
      }

      // Some but not all I.P. address octets have been filled.
      if (
        (typeof ipAddressAString !== "undefined" ||
          typeof ipAddressBString !== "undefined" ||
          typeof ipAddressCString !== "undefined" ||
          typeof ipAddressDString !== "undefined") &&
        (typeof ipAddressAString === "undefined" ||
          typeof ipAddressBString === "undefined" ||
          typeof ipAddressCString === "undefined" ||
          typeof ipAddressDString === "undefined")
      ) {
        const cardTitle = "Missing IPv4 Address Octet(s)";
        const cardContent =
          "I heard the I.P. Address:\n" +
          `Octet 1: ${ipAddressAString}\n` +
          `Octet 2: ${ipAddressBString}\n` +
          `Octet 3: ${ipAddressCString}\n` +
          `Octet 4: ${ipAddressDString}`;
        const speechOutput =
          "I missed some of the numbers in your bridge's I.P. address. Please start over.";
        return handlerInput.responseBuilder
          .withSimpleCard(cardTitle, cardContent)
          .speak(speechOutput)
          .withShouldEndSession(true)
          .getResponse();
      }

      if (!Number.isInteger(ipAddressA) || ipAddressA < 0 || ipAddressA > 255) {
        const speechOutput =
          "The first octet was out of range. It must be between 0 and 255. Please start over.";
        return handlerInput.responseBuilder
          .speak(speechOutput)
          .withShouldEndSession(true)
          .getResponse();
      }
      if (!Number.isInteger(ipAddressB) || ipAddressB < 0 || ipAddressB > 255) {
        const speechOutput =
          "The second octet was out of range. It must be between 0 and 255. Please start over.";
        return handlerInput.responseBuilder
          .speak(speechOutput)
          .withShouldEndSession(true)
          .getResponse();
      }
      if (!Number.isInteger(ipAddressC) || ipAddressC < 0 || ipAddressC > 255) {
        const speechOutput =
          "The third octet was out of range. It must be between 0 and 255. Please start over.";
        return handlerInput.responseBuilder
          .speak(speechOutput)
          .withShouldEndSession(true)
          .getResponse();
      }
      if (!Number.isInteger(ipAddressD) || ipAddressD < 0 || ipAddressD > 255) {
        const speechOutput =
          "The fourth octet was out of range. It must be between 0 and 255. Please start over.";
        return handlerInput.responseBuilder
          .speak(speechOutput)
          .withShouldEndSession(true)
          .getResponse();
      }

      return handlerInput.responseBuilder.addDelegateDirective().getResponse();
    }

    if (dialogState === "IN_PROGRESS") {
      if (typeof ipAddressAString === "undefined") {
        return handlerInput.responseBuilder
          .addDelegateDirective()
          .getResponse();
      }
      if (typeof ipAddressBString === "undefined") {
        return handlerInput.responseBuilder
          .addDelegateDirective()
          .getResponse();
      }
      if (typeof ipAddressCString === "undefined") {
        return handlerInput.responseBuilder
          .addDelegateDirective()
          .getResponse();
      }
      if (typeof ipAddressDString === "undefined") {
        return handlerInput.responseBuilder
          .addDelegateDirective()
          .getResponse();
      }
      if (typeof ipAddressValidString === "undefined") {
        return handlerInput.responseBuilder
          .addDelegateDirective()
          .getResponse();
      }

      if (ipAddressValidString === "no") {
        return handlerInput.responseBuilder
          .speak("Oops. Let's start over.")
          .withShouldEndSession(true)
          .getResponse();
      }

      if (typeof hostnameIndexString === "undefined") {
        let cardContent;
        try {
          cardContent = await createHostnamesSimpleCardContent(handlerInput);
        } catch (error) {
          return handlerInput.responseBuilder
            .speak(
              `${
                (error as Error).message
              } Please check your bridge installation and start over.`,
            )
            .withShouldEndSession(true)
            .getResponse();
        }

        const cardTitle = "Bridge  Hostname Configuration";
        Common.Debug.debug(
          `LGTV_ConfigureBridgeIntent: bridge FQDN prompt: ${cardContent}`,
        );
        return handlerInput.responseBuilder
          .withSimpleCard(cardTitle, cardContent)
          .addDelegateDirective()
          .getResponse();
      }

      const hostnameIndex: number = Number(hostnameIndexString);
      const hostnameCount: number = Number(sessionAttributes.hostnames.length);
      if (
        !Number.isInteger(hostnameIndex) ||
        hostnameIndex >= hostnameCount + 2 ||
        hostnameIndex < 0
      ) {
        const speechOutput =
          "I think I misheard you. " +
          `I heard ${hostnameIndexString}, which is not an index on the card.`;
        const reprompt = " Could you repeat your index?";
        return handlerInput.responseBuilder
          .speak(speechOutput)
          .reprompt(reprompt)
          .addElicitSlotDirective("hostnameIndex")
          .getResponse();
      }
      if (hostnameIndex === hostnameCount + 1) {
        return handlerInput.responseBuilder
          .speak(
            "I'm sorry. I misheard your bridge's I.P. address. Will we need to start over.",
          )
          .withShouldEndSession(true)
          .getResponse();
      }
      if (hostnameIndex === hostnameCount) {
        return handlerInput.responseBuilder
          .speak("I'm sorry. I could not discover your bridge's hostname.")
          .getResponse();
      }
      if (intentRequest.intent.confirmationStatus !== "CONFIRMED") {
        const hostnameIndex = ASKRequestEnvelope.getSlotValue(
          handlerInput.requestEnvelope,
          "hostnameIndex",
        );
        return handlerInput.responseBuilder
          .speak(
            `Is your bridge's hostname ${sessionAttributes.hostnames[hostnameIndex]}?`,
          )
          .addConfirmIntentDirective()
          .getResponse();
      }
      return handlerInput.responseBuilder
        .addDelegateDirective(intentRequest.intent)
        .getResponse();
    }

    if (dialogState === "COMPLETED") {
      if (intentRequest.intent.confirmationStatus === "CONFIRMED") {
        try {
          await setBridgeCredentials(handlerInput);
        } catch (error) {
          Reflect.deleteProperty(sessionAttributes, "ipAddress");
          Reflect.deleteProperty(sessionAttributes, "hostnames");
          handlerInput.attributesManager.setSessionAttributes(
            sessionAttributes,
          );
          return handlerInput.responseBuilder
            .speak((error as Error).message)
            .withShouldEndSession(true)
            .getResponse();
        }
        Reflect.deleteProperty(sessionAttributes, "ipAddress");
        Reflect.deleteProperty(sessionAttributes, "hostnames");
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        return handlerInput.responseBuilder
          .speak(
            "Congratulations. Bridge configuration is complete. You can now use the skill to control your TV.",
          )
          .withShouldEndSession(true)
          .getResponse();
      }
      if (intentRequest.intent.confirmationStatus === "DENIED") {
        Reflect.deleteProperty(sessionAttributes, "ipAddress");
        Reflect.deleteProperty(sessionAttributes, "hostnames");
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        return handlerInput.responseBuilder
          .speak("I have not configured you bridge.")
          .withShouldEndSession(true)
          .getResponse();
      }
      return handlerInput.responseBuilder
        .speak(
          "Not CONFIRMED or DENIED. How did I get here? I will start over.",
        )
        .withShouldEndSession(true)
        .getResponse();
    }
    return handlerInput.responseBuilder
      .speak(
        "Not STARTED, IN_PROGRESS or COMPLETED. How did I get here? I will start over.",
      )
      .withShouldEndSession(true)
      .getResponse();
  },
};

const handlers = [ConfigureBridgeIntentHandler];

export { handlers };

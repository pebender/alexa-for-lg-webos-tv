import type { HandlerInput as ASKHandlerInput } from "ask-sdk-core/dist/dispatcher/request/handler/HandlerInput";
import * as ASKRequestEnvelope from "ask-sdk-core/dist/util/RequestEnvelopeUtils";
import type * as ASKModel from "ask-sdk-model";
import * as Common from "../../../common";
import * as Link from "../link";

async function createHostnamesSimpleCardContent(
  handlerInput: ASKHandlerInput,
): Promise<string> {
  const sessionAttributes =
    handlerInput.attributesManager.getSessionAttributes();
  const ipAddressA = Number(
    ASKRequestEnvelope.getSlotValue(handlerInput.requestEnvelope, "ipAddressA"),
  );
  const ipAddressB = Number(
    ASKRequestEnvelope.getSlotValue(handlerInput.requestEnvelope, "ipAddressB"),
  );
  const ipAddressC = Number(
    ASKRequestEnvelope.getSlotValue(handlerInput.requestEnvelope, "ipAddressC"),
  );
  const ipAddressD = Number(
    ASKRequestEnvelope.getSlotValue(handlerInput.requestEnvelope, "ipAddressD"),
  );
  const ipAddress = `${ipAddressA.toString()}.${ipAddressB.toString()}.${ipAddressC.toString()}.${ipAddressD.toString()}`;
  sessionAttributes.ipAddress = ipAddress;
  Reflect.deleteProperty(sessionAttributes, "hostnames");
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
  try {
    sessionAttributes.hostnames = await Link.getHostnames(
      sessionAttributes.ipAddress as string,
    );
  } catch (error) {
    Common.Debug.debug(
      `LGTV_ConfigureBridgeIntent: cannot connect to IPv4 address '${ipAddress}'.`,
    );
    const commonError = new Link.LinkCommonError({
      message: "I had a problem connecting to the bridge's I.P.  address.",
      cause: error,
    });
    Common.Debug.debugError(commonError);
    throw commonError;
  }
  handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
  const hostnames: string[] = sessionAttributes.hostnames as string[];
  Common.Debug.debug(
    `LGTV_ConfigureBridgeIntent: bridge FQDNs: ${hostnames.toString()}`,
  );
  const hostnameCount = Number(hostnames.length);
  let cardContent = "";
  let index = 0;
  while (index < hostnameCount) {
    cardContent += `${index.toString()}: ${hostnameCount.toString()}\n`;
    index += 1;
  }
  cardContent += `\n${index.toString()}: My bridge is not in the list of hostnames.`;
  index += 1;
  cardContent += `\n${index.toString()}: My IP address is not '${ipAddress}'.`;
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
  if (accessToken === undefined) {
    throw new Common.GeneralCommonError({
      message:
        "There was a problem with account linking. Please re-link the skill and try again.",
    });
  }

  const sessionAttributes =
    handlerInput.attributesManager.getSessionAttributes();
  const hostnames: string[] = sessionAttributes.hostnames as string[];
  const hostnameIndex = Number(
    ASKRequestEnvelope.getSlotValue(
      handlerInput.requestEnvelope,
      "hostnameIndex",
    ),
  );
  const bridgeHostname: string = hostnames[hostnameIndex];

  let credentials: {
    bridgeHostname: string | null;
    bridgeToken: string | null;
  };
  try {
    credentials = await Link.getCredentials(accessToken, { bridgeHostname });
    Common.Debug.debug("LGTV_ConfigureBridgeIntent: getCredentials: success");
  } catch (error) {
    Common.Debug.debug("LGTV_ConfigureBridgeIntent: getCredentials: error:");
    const commonError = new Link.LinkCommonError({
      message:
        "I encountered a problem creating your bridge's token. So, I cannot configure your bridge.",
      cause: error,
    });
    Common.Debug.debugError(commonError);
    throw commonError;
  }
  if (typeof credentials.bridgeToken !== "string") {
    Common.Debug.debug("LGTV_ConfigureBridgeIntent: getCredentials: error");
    throw new Common.GeneralCommonError({
      message:
        "I encountered a problem creating your bridge's token. So, I cannot configure your bridge.",
    });
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

    const ipAddressA = Number(ipAddressAString);
    const ipAddressB = Number(ipAddressBString);
    const ipAddressC = Number(ipAddressCString);
    const ipAddressD = Number(ipAddressDString);
    const hostnameIndex = Number(hostnameIndexString);
    Common.Debug.debug(
      `(clean) address: ${ipAddressA.toString()}.${ipAddressB.toString()}.${ipAddressC.toString()}.${ipAddressD.toString()}, hostnameIndex: ${hostnameIndex.toString()}`,
    );

    switch (dialogState) {
      case "STARTED": {
        Reflect.deleteProperty(sessionAttributes, "ipAddress");
        Reflect.deleteProperty(sessionAttributes, "hostnames");
        Reflect.deleteProperty(sessionAttributes, "hostnameIndex");

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        if (
          ipAddressAString === undefined &&
          ipAddressBString === undefined &&
          ipAddressCString === undefined &&
          ipAddressDString === undefined
        ) {
          return handlerInput.responseBuilder
            .addDelegateDirective()
            .getResponse();
        }

        // Some but not all I.P. address octets have been filled.
        if (
          (ipAddressAString !== undefined ||
            ipAddressBString !== undefined ||
            ipAddressCString !== undefined ||
            ipAddressDString !== undefined) &&
          (ipAddressAString === undefined ||
            ipAddressBString === undefined ||
            ipAddressCString === undefined ||
            ipAddressDString === undefined)
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

        if (
          !Number.isInteger(ipAddressA) ||
          ipAddressA < 0 ||
          ipAddressA > 255
        ) {
          const speechOutput =
            "The first octet was out of range. It must be between 0 and 255. Please start over.";
          return handlerInput.responseBuilder
            .speak(speechOutput)
            .withShouldEndSession(true)
            .getResponse();
        }
        if (
          !Number.isInteger(ipAddressB) ||
          ipAddressB < 0 ||
          ipAddressB > 255
        ) {
          const speechOutput =
            "The second octet was out of range. It must be between 0 and 255. Please start over.";
          return handlerInput.responseBuilder
            .speak(speechOutput)
            .withShouldEndSession(true)
            .getResponse();
        }
        if (
          !Number.isInteger(ipAddressC) ||
          ipAddressC < 0 ||
          ipAddressC > 255
        ) {
          const speechOutput =
            "The third octet was out of range. It must be between 0 and 255. Please start over.";
          return handlerInput.responseBuilder
            .speak(speechOutput)
            .withShouldEndSession(true)
            .getResponse();
        }
        if (
          !Number.isInteger(ipAddressD) ||
          ipAddressD < 0 ||
          ipAddressD > 255
        ) {
          const speechOutput =
            "The fourth octet was out of range. It must be between 0 and 255. Please start over.";
          return handlerInput.responseBuilder
            .speak(speechOutput)
            .withShouldEndSession(true)
            .getResponse();
        }

        return handlerInput.responseBuilder
          .addDelegateDirective()
          .getResponse();
      }
      case "IN_PROGRESS": {
        if (ipAddressAString === undefined) {
          return handlerInput.responseBuilder
            .addDelegateDirective()
            .getResponse();
        }
        if (ipAddressBString === undefined) {
          return handlerInput.responseBuilder
            .addDelegateDirective()
            .getResponse();
        }
        if (ipAddressCString === undefined) {
          return handlerInput.responseBuilder
            .addDelegateDirective()
            .getResponse();
        }
        if (ipAddressDString === undefined) {
          return handlerInput.responseBuilder
            .addDelegateDirective()
            .getResponse();
        }
        if (ipAddressValidString === undefined) {
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

        if (hostnameIndexString === undefined) {
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

        const hostnames: string[] = sessionAttributes.hostnames as string[];
        const hostnameIndex = Number(hostnameIndexString);
        const hostnameCount = Number(hostnames);
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
          const hostnameIndex = Number(
            ASKRequestEnvelope.getSlotValue(
              handlerInput.requestEnvelope,
              "hostnameIndex",
            ),
          );
          return handlerInput.responseBuilder
            .speak(`Is your bridge's hostname ${hostnames[hostnameIndex]}?`)
            .addConfirmIntentDirective()
            .getResponse();
        }
        return handlerInput.responseBuilder
          .addDelegateDirective(intentRequest.intent)
          .getResponse();
      }
      case "COMPLETED": {
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
          handlerInput.attributesManager.setSessionAttributes(
            sessionAttributes,
          );
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
          handlerInput.attributesManager.setSessionAttributes(
            sessionAttributes,
          );
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
      default: {
        return handlerInput.responseBuilder
          .speak(
            "Not STARTED, IN_PROGRESS or COMPLETED. How did I get here? I will start over.",
          )
          .withShouldEndSession(true)
          .getResponse();
      }
    }
  },
};

const handlers = [ConfigureBridgeIntentHandler];

export { handlers };

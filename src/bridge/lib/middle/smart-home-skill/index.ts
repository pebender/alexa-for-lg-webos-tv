import * as Common from "../../../../common";
import * as alexa from "./alexa";
import * as alexaAuthorization from "./authorization";
import * as alexaChannelController from "./channel-controller";
import * as alexaDiscovery from "./discovery";
import * as alexaInputController from "./input-controller";
import * as alexaLauncher from "./launcher";
import * as alexaPlaybackController from "./playback-controller";
import * as alexaPowerController from "./power-controller";
import * as alexaSpeaker from "./speaker";
import { Backend, BackendControl } from "../../backend";
import { Authorization as DirectiveAuthorization } from "../authorization";
import LGTV from "lgtv2";

interface HandlerFunction {
  (
    alexaRequest: Common.SHS.Request,
    backendControl: BackendControl,
  ): Promise<Common.SHS.ResponseWrapper>;
}

const handlers: {
  [x: string]: HandlerFunction;
} = {
  Alexa: alexa.handler,
  "Alexa.ChannelController": alexaChannelController.handler,
  "Alexa.InputController": alexaInputController.handler,
  "Alexa.Launcher": alexaLauncher.handler,
  "Alexa.PlaybackController": alexaPlaybackController.handler,
  "Alexa.PowerController": alexaPowerController.handler,
  "Alexa.Speaker": alexaSpeaker.handler,
};

function capabilities(
  backendControl: BackendControl,
): Promise<Common.SHS.Event.Payload.Endpoint.Capability>[] {
  return [
    ...alexa.capabilities(backendControl),
    ...alexaPowerController.capabilities(backendControl),
    ...alexaSpeaker.capabilities(backendControl),
    ...alexaChannelController.capabilities(backendControl),
    ...alexaInputController.capabilities(backendControl),
    ...alexaLauncher.capabilities(backendControl),
    ...alexaPlaybackController.capabilities(backendControl),
  ];
}

function states(
  backendControl: BackendControl,
): Promise<Common.SHS.Context.Property>[] {
  return [
    ...alexa.states(backendControl),
    ...alexaPowerController.states(backendControl),
    ...alexaSpeaker.states(backendControl),
    ...alexaChannelController.states(backendControl),
    ...alexaInputController.states(backendControl),
    ...alexaLauncher.states(backendControl),
    ...alexaPlaybackController.states(backendControl),
  ];
}

async function addStates(
  alexaResponseWrapper: Common.SHS.ResponseWrapper,
  backendControl: BackendControl,
): Promise<Common.SHS.ResponseWrapper> {
  try {
    (await Promise.all(states(backendControl))).forEach((state): void => {
      if (
        typeof state === "undefined" ||
        state === null ||
        typeof state.value === "undefined" ||
        state.value === null
      ) {
        return;
      }
      alexaResponseWrapper.addContextProperty(state);
    });
    return alexaResponseWrapper;
  } catch (error) {
    return alexaResponseWrapper;
  }
}

async function handler(
  event: Common.SHS.Request,
  authorization: DirectiveAuthorization,
  backend: Backend,
): Promise<Common.SHS.ResponseWrapper> {
  const alexaRequest = new Common.SHS.Request(event);

  switch (alexaRequest.directive.header.namespace) {
    case "Alexa.Authorization":
      return await alexaAuthorization.handler(alexaRequest, backend);
    case "Alexa.Discovery":
      return await alexaDiscovery.handler(alexaRequest, backend);
    default: {
      const udn = alexaRequest.getEndpointId();
      if (typeof udn === "undefined") {
        return Common.SHS.ResponseWrapper.buildAlexaErrorResponse(
          alexaRequest,
          "NO_SUCH_ENDPOINT",
          "",
        );
      }

      const backendControl = backend.control(udn);
      if (typeof backendControl === "undefined") {
        return Common.SHS.ResponseWrapper.buildAlexaErrorResponse(
          alexaRequest,
          "NO_SUCH_ENDPOINT",
          "",
        );
      }

      if (!(alexaRequest.directive.header.namespace in handlers)) {
        return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidDirectiveNamespace(
          alexaRequest,
        );
      }

      const controllerHandler =
        handlers[alexaRequest.directive.header.namespace];
      let handlerResponseWrapper: Common.SHS.ResponseWrapper;
      try {
        handlerResponseWrapper = await controllerHandler(
          alexaRequest,
          backendControl,
        );
      } catch (error) {
        if (error instanceof Common.SHS.ResponseWrapper) {
          handlerResponseWrapper = error;
        } else {
          handlerResponseWrapper =
            Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInternalError(
              alexaRequest,
              200,
              error,
            );
        }
      }
      if (
        !(
          handlerResponseWrapper.response.event.header.namespace === "Alexa" &&
          handlerResponseWrapper.response.event.header.name === "ErrorResponse"
        )
      ) {
        try {
          return await addStates(handlerResponseWrapper, backendControl);
        } catch (error) {
          if (error instanceof Common.SHS.ResponseWrapper) {
            handlerResponseWrapper = error;
          } else {
            handlerResponseWrapper =
              Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInternalError(
                alexaRequest,
                200,
                error,
              );
          }
        }
      }
      return handlerResponseWrapper;
    }
  }
}

function callback(
  uri: string,
  error: Error,
  response: LGTV.Response,
  udn: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  authorization: DirectiveAuthorization,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  backend: Backend,
) {
  Common.Debug.debug(`udn='${udn}', ${uri}:`);
  if (error) {
    Common.Debug.debugError(error);
  } else {
    Common.Debug.debugJSON(response);
  }
}

export { capabilities, states, handler, callback };

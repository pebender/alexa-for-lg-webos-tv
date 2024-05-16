import type LGTV from "lgtv2";
import * as Common from "../../../../common";
import type { Backend, BackendControl } from "../../backend";
import type { Authorization as DirectiveAuthorization } from "../authorization";
import * as alexa from "./alexa";
import * as alexaAuthorization from "./authorization";
import * as alexaChannelController from "./channel-controller";
import * as alexaDiscovery from "./discovery";
import * as alexaInputController from "./input-controller";
import * as alexaLauncher from "./launcher";
import * as alexaPlaybackController from "./playback-controller";
import * as alexaPowerController from "./power-controller";
import * as alexaSpeaker from "./speaker";

type HandlerFunction = (
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
) => Promise<Common.SHS.Response>;

const handlers: Record<string, HandlerFunction> = {
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
): Array<Promise<Common.SHS.EventPayloadEndpointCapability>> {
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
): Array<Promise<Common.SHS.ContextProperty | null>> {
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
  alexaResponse: Common.SHS.Response,
  backendControl: BackendControl,
): Promise<Common.SHS.Response> {
  try {
    for (const state of await Promise.all(states(backendControl))) {
      if (state === null) {
        continue;
      }
      alexaResponse.addContextProperty(state);
    }
    return alexaResponse;
  } catch (error) {
    Common.Debug.debugError(error);
    return alexaResponse;
  }
}

async function handler(
  event: Common.SHS.Request,
  authorization: DirectiveAuthorization,
  backend: Backend,
): Promise<Common.SHS.Response> {
  const alexaRequest = new Common.SHS.Request(event);

  switch (alexaRequest.directive.header.namespace) {
    case "Alexa.Authorization": {
      return alexaAuthorization.handler(alexaRequest, backend);
    }
    case "Alexa.Discovery": {
      return await alexaDiscovery.handler(alexaRequest, backend);
    }
    default: {
      const udn = alexaRequest.getEndpointId();
      if (udn === undefined) {
        return Common.SHS.Response.buildAlexaErrorResponse(
          alexaRequest,
          "NO_SUCH_ENDPOINT",
          "",
        );
      }

      const backendControl = backend.control(udn);
      if (backendControl === undefined) {
        return Common.SHS.Response.buildAlexaErrorResponse(
          alexaRequest,
          "NO_SUCH_ENDPOINT",
          "",
        );
      }

      if (!(alexaRequest.directive.header.namespace in handlers)) {
        return Common.SHS.Response.buildAlexaErrorResponseForInvalidDirectiveNamespace(
          alexaRequest,
        );
      }

      const controllerHandler =
        handlers[alexaRequest.directive.header.namespace];
      let handlerResponse: Common.SHS.Response;
      try {
        handlerResponse = await controllerHandler(alexaRequest, backendControl);
      } catch (error) {
        handlerResponse =
          error instanceof Common.SHS.Response
            ? error
            : Common.SHS.Response.buildAlexaErrorResponseForInternalError(
                alexaRequest,
                error,
              );
      }
      if (
        !(
          handlerResponse.event.header.namespace === "Alexa" &&
          handlerResponse.event.header.name === "ErrorResponse"
        )
      ) {
        try {
          return await addStates(handlerResponse, backendControl);
        } catch (error) {
          handlerResponse =
            error instanceof Common.SHS.Response
              ? error
              : Common.SHS.Response.buildAlexaErrorResponseForInternalError(
                  alexaRequest,
                  error,
                );
        }
      }
      return handlerResponse;
    }
  }
}

function callback(
  uri: string,
  error: Error | null,
  response: LGTV.Response | null,
  udn: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  authorization: DirectiveAuthorization,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  backend: Backend,
): void {
  Common.Debug.debug(`udn='${udn}', ${uri}:`);

  if (error !== null) {
    Common.Debug.debugError(error);
    return;
  }

  Common.Debug.debugJSON(response);
}

export { capabilities, states, handler, callback };

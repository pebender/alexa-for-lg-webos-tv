import type LGTV from "lgtv2";
import * as Common from "../../../../../common";
import type { TvManager, TvControl } from "../tv-manager";
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
  tvControl: TvControl,
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
  tvControl: TvControl,
): Array<Promise<Common.SHS.EventPayloadEndpointCapability>> {
  return [
    ...alexa.capabilities(tvControl),
    ...alexaPowerController.capabilities(tvControl),
    ...alexaSpeaker.capabilities(tvControl),
    ...alexaChannelController.capabilities(tvControl),
    ...alexaInputController.capabilities(tvControl),
    ...alexaLauncher.capabilities(tvControl),
    ...alexaPlaybackController.capabilities(tvControl),
  ];
}

function states(
  tvControl: TvControl,
): Array<Promise<Common.SHS.ContextProperty | null>> {
  return [
    ...alexa.states(tvControl),
    ...alexaPowerController.states(tvControl),
    ...alexaSpeaker.states(tvControl),
    ...alexaChannelController.states(tvControl),
    ...alexaInputController.states(tvControl),
    ...alexaLauncher.states(tvControl),
    ...alexaPlaybackController.states(tvControl),
  ];
}

async function addStates(
  alexaResponse: Common.SHS.Response,
  tvControl: TvControl,
): Promise<Common.SHS.Response> {
  try {
    for (const state of await Promise.all(states(tvControl))) {
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
  tvManager: TvManager,
): Promise<Common.SHS.Response> {
  const alexaRequest = new Common.SHS.Request(event);

  switch (alexaRequest.directive.header.namespace) {
    case "Alexa.Authorization": {
      return alexaAuthorization.handler(alexaRequest, tvManager);
    }
    case "Alexa.Discovery": {
      return await alexaDiscovery.handler(alexaRequest, tvManager);
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

      const tvControl = tvManager.control(udn);
      if (tvControl === undefined) {
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
        handlerResponse = await controllerHandler(alexaRequest, tvControl);
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
          return await addStates(handlerResponse, tvControl);
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
  authorization: DirectiveAuthorization,
  tvManager: TvManager,
): void {
  Common.Debug.debug(`udn='${udn}', ${uri}:`);

  if (error !== null) {
    Common.Debug.debugError(error);
    return;
  }

  Common.Debug.debugJSON(response);
}

export { capabilities, states, handler, callback };

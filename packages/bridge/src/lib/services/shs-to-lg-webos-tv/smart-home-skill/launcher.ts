import type LGTV from "lgtv2";
import * as Common from "@backinthirty/alexa-for-lg-webos-tv-common";
import { type TvControl, TvCommonError } from "../tv-manager";
//
// "launcher.json" contains a mapping between Smart Home Skill Alexa.Launcher
// launch target identifiers and LG webOS TV application ids. The list of Alexa
// target names and identifiers can be found at
// <https://developer.amazon.com/docs/video/launch-target-reference.html>. The
// list of LG webOS TV application titles and ids can be found by installing the
// applications and issuing the command
// "ssap://com.webos.applicationManager/listApps" or
// "ssap://com.webos.applicationManager/listLaunchPoints".
//
import launchMap from "./launcher.json";

interface LaunchMapItem {
  alexa: { name: string; identifier: string };
  lgtv: { title: string; id: string };
}
interface LaunchMap {
  map: LaunchMapItem[];
}
type AlexaToLGTV = Record<string, { id: string; title: string }>;
type LGTVToAlexa = Record<string, { identifier: string; name: string }>;

// Convert "launcher.json" into a collection of LG webOS TV application ids and
// titles indexed by Alexa.Launcher launch target identifiers.
function createAlexaToLGTV(): AlexaToLGTV {
  const _alexaToLGTV: AlexaToLGTV = {};

  const items = (launchMap as LaunchMap).map;
  for (const item of items) {
    _alexaToLGTV[item.alexa.identifier] = {
      id: item.lgtv.id,
      title: item.lgtv.title,
    };
  }

  return _alexaToLGTV;
}

// Convert "launcher.json" into a collection of Alexa.Launcher launch targets
// indexed by LG webOS TV application ids.
function createLGTVToAlexa(): LGTVToAlexa {
  const _lgtvToAlexa: LGTVToAlexa = {};

  const items = (launchMap as LaunchMap).map;
  for (const item of items) {
    _lgtvToAlexa[item.lgtv.id] = {
      identifier: item.alexa.identifier,
      name: item.alexa.name,
    };
  }

  return _lgtvToAlexa;
}

const alexaToLGTV: AlexaToLGTV = createAlexaToLGTV();
const lgtvToAlexa: LGTVToAlexa = createLGTVToAlexa();

function capabilities(
  tvControl: TvControl,
): Array<Promise<Common.SHS.EventPayloadEndpointCapability>> {
  return [
    Common.SHS.Response.buildPayloadEndpointCapability({
      namespace: "Alexa.Launcher",
      propertyNames: ["target"],
    }),
  ];
}

function states(
  tvControl: TvControl,
): Array<Promise<Common.SHS.ContextProperty | null>> {
  if (tvControl.getPowerState() === "OFF") {
    return [];
  }

  async function value(): Promise<{ identifier: string; name: string }> {
    const lgtvRequest: LGTV.Request = {
      uri: "ssap://com.webos.applicationManager/getForegroundAppInfo",
    };
    const lgtvResponse: LGTV.Response =
      await tvControl.lgtvCommand(lgtvRequest);
    if (typeof lgtvResponse.appId !== "string") {
      throw new TvCommonError({
        code: "responseInvalid",
        message: "TV response was invalid",
        tv: tvControl.tv,
        lgtvRequest,
        lgtvResponse,
      });
    }
    if (lgtvToAlexa[lgtvResponse.appId] === undefined) {
      throw new TvCommonError({
        code: "responseValueUnknown",
        message: `TV unknown foreground application '${lgtvResponse.appId}'`,
        tv: tvControl.tv,
        lgtvRequest,
        lgtvResponse,
      });
    }
    return lgtvToAlexa[lgtvResponse.appId];
  }

  const targetState = Common.SHS.Response.buildContextProperty({
    namespace: "Alexa.Launcher",
    name: "target",
    value,
  });
  return [targetState];
}

async function launchTargetHandler(
  alexaRequest: Common.SHS.Request,
  tvControl: TvControl,
): Promise<Common.SHS.Response> {
  if (
    typeof alexaRequest.directive.payload.identifier !== "string" ||
    alexaToLGTV[alexaRequest.directive.payload.identifier] === undefined
  ) {
    return await Promise.resolve(
      Common.SHS.Response.buildAlexaErrorResponseForInvalidValue(alexaRequest),
    );
  }
  const requestedApp = alexaToLGTV[alexaRequest.directive.payload.identifier];
  const lgtvRequest: LGTV.Request = {
    uri: "ssap://system.launcher/launch",
    payload: requestedApp,
  };
  try {
    await tvControl.lgtvCommand(lgtvRequest);
  } catch (launchError) {
    // Check whether or not the application failed to launch because the
    // application does not exist (is not installed).
    const lgtvRequest: LGTV.Request = {
      uri: "ssap://com.webos.applicationManager/listApps",
    };
    try {
      const response = (await tvControl.lgtvCommand(lgtvRequest)) as Record<
        string,
        unknown
      >;
      const apps = response.apps as Array<{
        id: string;
        [key: string]: unknown;
      }>;
      const index = apps.findIndex((app) => app.id === requestedApp.id);
      if (index === -1) {
        return Common.SHS.Response.buildAlexaErrorResponseForInvalidValue(
          alexaRequest,
        );
      }
    } catch (listAppsError) {
      return Common.SHS.Response.buildAlexaErrorResponseForInternalError(
        alexaRequest,
        listAppsError,
      );
    }
    return Common.SHS.Response.buildAlexaErrorResponseForInternalError(
      alexaRequest,
      launchError,
    );
  }
  return Common.SHS.Response.buildAlexaResponse(alexaRequest);
}

async function handler(
  alexaRequest: Common.SHS.Request,
  tvControl: TvControl,
): Promise<Common.SHS.Response> {
  if (tvControl.getPowerState() === "OFF") {
    return await Promise.resolve(
      Common.SHS.Response.buildAlexaErrorResponseForPowerOff(alexaRequest),
    );
  }
  switch (alexaRequest.directive.header.name) {
    case "LaunchTarget": {
      return await launchTargetHandler(alexaRequest, tvControl);
    }
    default: {
      return await Promise.resolve(
        Common.SHS.Response.buildAlexaErrorResponseForInvalidDirectiveName(
          alexaRequest,
        ),
      );
    }
  }
}

export { capabilities, states, handler };

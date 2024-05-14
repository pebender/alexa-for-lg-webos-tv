import LGTV from "lgtv2";
import * as Common from "../../../../common";
import { BackendControl } from "../../backend";
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
interface AlexaToLGTV {
  [alexaIdentifier: string]: { id: string; title: string };
}
interface LGTVToAlexa {
  [lgtvId: string]: { identifier: string; name: string };
}

// Convert "launcher.json" into a collection of LG webOS TV application ids and
// titles indexed by Alexa.Launcher launch target identifiers.
function createAlexaToLGTV(): AlexaToLGTV {
  const _alexaToLGTV: AlexaToLGTV = {};

  const items = (launchMap as LaunchMap).map;
  items.forEach((item) => {
    _alexaToLGTV[item.alexa.identifier] = {
      id: item.lgtv.id,
      title: item.lgtv.title,
    };
  });

  return _alexaToLGTV;
}

// Convert "launcher.json" into a collection of Alexa.Launcher launch targets
// indexed by LG webOS TV application ids.
function createLGTVToAlexa(): LGTVToAlexa {
  const _lgtvToAlexa: LGTVToAlexa = {};

  const items = (launchMap as LaunchMap).map;
  items.forEach((item) => {
    _lgtvToAlexa[item.lgtv.id] = {
      identifier: item.alexa.identifier,
      name: item.alexa.name,
    };
  });

  return _lgtvToAlexa;
}

const alexaToLGTV: AlexaToLGTV = createAlexaToLGTV();
const lgtvToAlexa: LGTVToAlexa = createLGTVToAlexa();

function capabilities(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  backendControl: BackendControl,
): Promise<Common.SHS.EventPayloadEndpointCapability>[] {
  return [
    Common.SHS.Response.buildPayloadEndpointCapability({
      namespace: "Alexa.Launcher",
      propertyNames: ["target"],
    }),
  ];
}

function states(
  backendControl: BackendControl,
): Promise<Common.SHS.ContextProperty | null>[] {
  if (backendControl.getPowerState() === "OFF") {
    return [];
  }

  async function value(): Promise<{ identifier: string; name: string }> {
    const lgtvRequest: LGTV.Request = {
      uri: "ssap://com.webos.applicationManager/getForegroundAppInfo",
    };
    const input: LGTV.Response = await backendControl.lgtvCommand(lgtvRequest);
    if (
      typeof input.appId !== "string" ||
      typeof lgtvToAlexa[input.appId] === "undefined"
    ) {
      throw Common.Error.create({
        message: "TV response was invalid",
        general: "tv",
        specific: "responseInvalid",
        cause: { lgtvResponse: input, lgtvToAlexa },
      });
    }
    return lgtvToAlexa[input.appId];
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
  backendControl: BackendControl,
): Promise<Common.SHS.ResponseWrapper> {
  if (
    typeof alexaRequest.directive.payload.identifier !== "string" ||
    typeof alexaToLGTV[alexaRequest.directive.payload.identifier] ===
      "undefined"
  ) {
    return Promise.resolve(
      Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidValue(
        alexaRequest,
      ),
    );
  }
  const requestedApp = alexaToLGTV[alexaRequest.directive.payload.identifier];
  const lgtvRequest: LGTV.Request = {
    uri: "ssap://system.launcher/launch",
    payload: requestedApp,
  };
  try {
    await backendControl.lgtvCommand(lgtvRequest);
  } catch (launchError) {
    // Check whether or not the application failed to launch because the
    // application does not exist (is not installed).
    const lgtvRequest: LGTV.Request = {
      uri: "ssap://com.webos.applicationManager/listApps",
    };
    try {
      const response = (await backendControl.lgtvCommand(lgtvRequest)) as {
        [key: string]: unknown;
      };
      const apps = response.apps as { id: string; [key: string]: unknown }[];
      const index = apps.findIndex((app) => app.id === requestedApp.id);
      if (index < 0) {
        return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidValue(
          alexaRequest,
        );
      }
    } catch (listAppsError) {
      return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInternalError(
        alexaRequest,
        listAppsError,
      );
    }
  }
  return Common.SHS.ResponseWrapper.buildAlexaResponse(alexaRequest);
}

function handler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Promise<Common.SHS.ResponseWrapper> {
  if (backendControl.getPowerState() === "OFF") {
    return Promise.resolve(
      Common.SHS.ResponseWrapper.buildAlexaErrorResponseForPowerOff(
        alexaRequest,
      ),
    );
  }
  switch (alexaRequest.directive.header.name) {
    case "LaunchTarget":
      return launchTargetHandler(alexaRequest, backendControl);
    default:
      return Promise.resolve(
        Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidDirectiveName(
          alexaRequest,
        ),
      );
  }
}

export { capabilities, states, handler };

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

type LaunchMapItem = {
  alexa: { name: string; identifier: string };
  lgtv: { title: string; id: string };
};
type LaunchMap = { map: LaunchMapItem[] };
type AlexaToLGTV = { [alexaIdentifier: string]: { id: string; title: string } };
type LGTVToAlexa = { [lgtvId: string]: { identifier: string; name: string } };

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
): Promise<Common.SHS.Event.Payload.Endpoint.Capability>[] {
  return [
    Common.SHS.Response.buildPayloadEndpointCapability({
      namespace: "Alexa.Launcher",
      propertyNames: ["target"],
    }),
  ];
}

function states(
  backendControl: BackendControl,
): Promise<Common.SHS.Context.Property>[] {
  if (backendControl.getPowerState() === "OFF") {
    return [];
  }

  async function value(): Promise<{ identifier: string; name: string } | null> {
    const lgtvRequest: LGTV.Request = {
      uri: "ssap://com.webos.applicationManager/getForegroundAppInfo",
    };
    let input: LGTV.Response;
    try {
      input = await backendControl.lgtvCommand(lgtvRequest);
    } catch {
      return null;
    }
    if (
      typeof input.appId !== "string" ||
      typeof lgtvToAlexa[input.appId] === "undefined"
    ) {
      return null;
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
    typeof alexaToLGTV[alexaRequest.directive.payload.identifier as string] ===
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
  } catch {
    // Check whether or not the application failed to launch because the
    // application does not exist (is not installed).
    const lgtvRequest: LGTV.Request = {
      uri: "ssap://com.webos.applicationManager/listApps",
    };
    try {
      const response = await backendControl.lgtvCommand(lgtvRequest);
      const apps: any[] = (response as any).apps;
      const index = apps.findIndex((app) => app.id === requestedApp.id);
      if (index < 0) {
        return Promise.resolve(
          Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidValue(
            alexaRequest,
          ),
        );
      }
    } catch (error) {
      return Promise.resolve(
        Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInternalError(
          alexaRequest,
          200,
          error,
        ),
      );
    }
  }
  return Promise.resolve(
    Common.SHS.ResponseWrapper.buildAlexaResponse(alexaRequest),
  );
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

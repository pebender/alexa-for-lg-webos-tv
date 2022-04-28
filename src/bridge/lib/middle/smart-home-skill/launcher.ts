import LGTV from "lgtv2";
import * as Common from "../../../../common";
import { BackendControl } from "../../backend";
import launchMap from "./launcher.json";

type LaunchMapItem = {
  alexa: { name: string; identifier: string };
  lgtv: { title: string; id: string };
};
type LaunchMap = { map: LaunchMapItem[] };
type AlexaToLGTV = { [alexaIdentifier: string]: { id: string; title: string } };
type LGTVToAlexa = { [lgtvId: string]: { identifier: string; name: string } };

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
  backendControl: BackendControl
): Promise<Common.SHS.Event.Payload.Endpoint.Capability>[] {
  return [
    Common.SHS.Response.buildPayloadEndpointCapability({
      namespace: "Alexa.Launcher",
      propertyNames: ["name", "identifier"],
    }),
  ];
}

function states(
  backendControl: BackendControl
): Promise<Common.SHS.Context.Property>[] {
  if (backendControl.getPowerState() === "OFF") {
    return [];
  }

  async function value(): Promise<{ identifier: string; name: string } | null> {
    const lgtvRequest: LGTV.Request = {
      uri: "ssap://com.webos.applicationManager/getForegroundAppInfo",
    };
    const input: LGTV.Response = await backendControl.lgtvCommand(lgtvRequest);
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

//
// A list of Alexa target identifiers can be found at
// <https://developer.amazon.com/docs/video/launch-target-reference.html>.
// A list of LG webOS TV target ids can be found by issuing the command
// "ssap://com.webos.applicationManager/listLaunchPoints".
//
async function launchTargetHandler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl
): Promise<Common.SHS.Response> {
  if (
    typeof alexaRequest.directive.payload.identifier !== "string" ||
    typeof alexaToLGTV[alexaRequest.directive.payload.identifier as string] ===
      "undefined"
  ) {
    throw Common.SHS.Error.errorResponse(
      alexaRequest,
      400,
      "INVALID_VALUE",
      `I do not know the Launcher target ${alexaRequest.directive.payload.identifier}`
    );
  }
  const lgtvRequest: LGTV.Request = {
    uri: "ssap://system.launcher/launch",
    payload: alexaToLGTV[alexaRequest.directive.payload.identifier],
  };
  await backendControl.lgtvCommand(lgtvRequest);
  /*
  const lgtvRequest: LGTV.Request = {
    uri: 'ssap://com.webos.applicationManager/listApps'
  }
  type appType = { [x: string]: undefined | null | string | number | object; };
  const response = await backendControl.lgtvCommand(lgtvRequest)
  const apps: appType[] = (response as any).apps
  apps.forEach((app) => {
    const output = {
      title: app.title,
      id: app.id
    }
    Debug.debugJSON(output)
  })
  */
  return new Common.SHS.Response({
    namespace: "Alexa",
    name: "Response",
    correlationToken: alexaRequest.getCorrelationToken(),
    endpointId: alexaRequest.getEndpointId(),
  });
}

function handler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl
): Promise<Common.SHS.Response> {
  if (alexaRequest.directive.header.namespace !== "Alexa.Launcher") {
    throw Common.SHS.Error.errorResponseForWrongDirectiveNamespace(
      alexaRequest,
      "Alexa.Launcher"
    );
  }
  switch (alexaRequest.directive.header.name) {
    case "LaunchTarget":
      return launchTargetHandler(alexaRequest, backendControl);
    default:
      throw Common.SHS.Error.errorResponseForInvalidDirectiveName(alexaRequest);
  }
}

export { capabilities, states, handler };

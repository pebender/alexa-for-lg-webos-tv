import * as Common from "../../../../common";
import { BackendControl } from "../../backend";
import LGTV from "lgtv2";

// The list of Alexa.InputController inputs are found at
// <https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-inputcontroller.html>.
// To determine mapping of LG webOS TV external inputs to these Alexa inputs.
// The software compares the Alexa input with LG webOS TV external input labels
// and ids. Before comparison, it converts the labels and ids to uppercase and
// replaces '_' with ' '. It does this because the Alexa inputs are uppercase
// and use ' ' no '_' to separate words. Therefore, doing this improves the
// chance of finding a match.
//
// The software starts with an empty map of Alexa inputs to LG webOS TV inputs. If a
// label of an LG webOS TV input matches an Alexa input, then the software adds it to the
// map. After the software has finished matching against labels, it does matching against ids.
// If an id of LG webOS TV input
// not already in the map matches an Alexa input, then the software adds it to the map.
// If there are duplicate labels or labels that match ids, the software will ignore some of these inputs in order to ensure the bi-directional mapping is unique.
const alexaInputList: string[] = [
  "AUX 1",
  "AUX 2",
  "AUX 3",
  "AUX 4",
  "AUX 5",
  "AUX 6",
  "AUX 7",
  "BLURAY",
  "CABLE",
  "CD",
  "COAX 1",
  "COAX 2",
  "COMPOSITE 1",
  "DVD",
  "GAME",
  "HD RADIO",
  "HDMI 1",
  "HDMI 2",
  "HDMI 3",
  "HDMI 4",
  "HDMI 5",
  "HDMI 6",
  "HDMI 7",
  "HDMI 8",
  "HDMI 9",
  "HDMI 10",
  "HDMI ARC",
  "INPUT 1",
  "INPUT 2",
  "INPUT 3",
  "INPUT 4",
  "INPUT 5",
  "INPUT 6",
  "INPUT 7",
  "INPUT 8",
  "INPUT 9",
  "INPUT 10",
  "IPOD",
  "LINE 1",
  "LINE 2",
  "LINE 3",
  "LINE 4",
  "LINE 5",
  "LINE 6",
  "LINE 7",
  "MEDIA PLAYER",
  "OPTICAL 1",
  "OPTICAL 2",
  "PHONO",
  "PLAYSTATION",
  "PLAYSTATION 3",
  "PLAYSTATION 4",
  "SATELLITE",
  "SMARTCAST",
  "TUNER",
  "TV",
  "USB DAC",
  "VIDEO 1",
  "VIDEO 2",
  "VIDEO 3",
  "XBOX",
];

// Non-trivial mappings between Alexa inputs and LGTV webOS TV ids.
const lgtvExternalInputRenameList: { [key: string]: string } = {
  "AV 1": "VIDEO 1",
  "AV 2": "VIDEO 2",
  "AV 3": "VIDEO 3",
};

type ExternalInput = {
  id: string;
  label: string;
  appId: string;
  device: LGTV.ResponseExternalInputListDevice;
};

type ExternalInputMap = {
  [input: string]: ExternalInput;
};

async function getAlexaToLGTV(
  backendControl: BackendControl,
): Promise<ExternalInputMap> {
  if (backendControl.getPowerState() === "OFF") {
    return {};
  }

  const externalInputList: ExternalInput[] = [];
  const lgtvResponse: LGTV.Response = await backendControl.lgtvCommand({
    uri: "ssap://tv/getExternalInputList",
  });
  const devices = (lgtvResponse as LGTV.ResponseExternalInputList).devices;
  devices.forEach((device) => {
    const id = device.id.toUpperCase().replace(/_/g, " ");
    const label = device.label.toUpperCase().replace(/_/g, " ");
    const appId = device.appId;
    externalInputList.push({
      id,
      label,
      appId,
      device,
    });
  });

  const alexaInputMap: ExternalInputMap = {};

  //
  // First map Alexa inputs that are a match for external input labels.
  //
  const externalInputLabelMap: ExternalInputMap = {};
  // Create an external input map using the label as the key.
  externalInputList.forEach((input) => {
    if (typeof externalInputLabelMap[input.label] === "undefined") {
      externalInputLabelMap[input.label] = input;
    }
  });
  //
  alexaInputList.forEach((input) => {
    if (typeof externalInputLabelMap[input] !== "undefined") {
      alexaInputMap[input] = externalInputLabelMap[input];
    }
  });

  //
  // Second map Alexa inputs that re a match for external input ids.
  // Skip any external inputs that have already been mapped by label.
  //
  const externalInputIdlMap: ExternalInputMap = {};
  // Create an external input map using the id as the key.
  externalInputList.forEach((input) => {
    if (typeof externalInputIdlMap[input.id] === "undefined") {
      externalInputIdlMap[input.id] = input;
    }
  });
  // Add to the external input map using the renamed id as the key.
  externalInputList.forEach((input) => {
    const idRenamed = lgtvExternalInputRenameList[input.id];
    if (
      typeof idRenamed !== "undefined" &&
      typeof externalInputIdlMap[idRenamed] === "undefined"
    ) {
      externalInputIdlMap[idRenamed] = input;
    }
  });

  // Delete from external input map any that were already in the Alexa map using their label.
  Object.keys(alexaInputMap).forEach((key) => {
    const id = alexaInputMap[key].id;
    if (typeof externalInputIdlMap[id] !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete externalInputIdlMap[id];
    }
    const idRenamed = lgtvExternalInputRenameList[id];
    if (typeof externalInputIdlMap[idRenamed] !== "undefined") {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete externalInputIdlMap[idRenamed];
    }
  });

  //
  alexaInputList.forEach((input) => {
    if (
      typeof alexaInputMap[input] === "undefined" &&
      typeof externalInputIdlMap[input] !== "undefined"
    ) {
      alexaInputMap[input] = externalInputIdlMap[input];
    }
  });

  return alexaInputMap;
}

function capabilities(
  backendControl: BackendControl,
): Promise<Common.SHS.Event.Payload.Endpoint.Capability>[] {
  async function getInputCapability(
    backendControl: BackendControl,
  ): Promise<Common.SHS.Event.Payload.Endpoint.Capability> {
    const inputs: { name: string; friendlyNames: string[] }[] = [];
    const alexaToLGTV = await getAlexaToLGTV(backendControl);
    Object.keys(alexaToLGTV).forEach((alexaInput) => {
      // Add friendly names as long as they are no too close to the actual names.
      const friendlyNames: string[] = [];
      if (alexaInput === alexaToLGTV[alexaInput].label) {
        if (
          alexaInput !== alexaToLGTV[alexaInput].id &&
          alexaInput.replace(/ /g, "") !==
            alexaToLGTV[alexaInput].id.replace(/ /g, "")
        ) {
          friendlyNames.push(alexaToLGTV[alexaInput].id);
        }
      } else {
        if (
          alexaInput !== alexaToLGTV[alexaInput].label &&
          alexaInput.replace(/ /g, "") !==
            alexaToLGTV[alexaInput].label.replace(/ /g, "")
        ) {
          friendlyNames.push(alexaToLGTV[alexaInput].label);
        }
      }
      inputs.push({
        name: alexaInput,
        friendlyNames,
      });
    });
    const capability = await Common.SHS.Response.buildPayloadEndpointCapability(
      {
        namespace: "Alexa.InputController",
        propertyNames: ["input"],
      },
    );
    capability.inputs = inputs;
    return capability;
  }

  return [getInputCapability(backendControl)];
}

function states(
  backendControl: BackendControl,
): Promise<Common.SHS.Context.Property | null>[] {
  async function value(): Promise<string> {
    const alexaToLGTV = await getAlexaToLGTV(backendControl);
    async function getInput(): Promise<string> {
      if (backendControl.getPowerState() === "OFF") {
        throw Common.Error.create("TV is off", {
          general: "tv",
          specific: "off",
        });
      }
      const lgtvRequest: LGTV.Request = {
        uri: "ssap://com.webos.applicationManager/getForegroundAppInfo",
      };
      const lgtvResponse: LGTV.ResponseForegroundAppInfo =
        (await backendControl.lgtvCommand(
          lgtvRequest,
        )) as LGTV.ResponseForegroundAppInfo;
      if (typeof lgtvResponse.appId === "undefined") {
        throw Common.Error.create("TV response was invalid", {
          general: "tv",
          specific: "responseInvalid",
        });
      }
      return lgtvResponse.appId;
    }
    const appId = await getInput();
    const alexaInput = Object.keys(alexaToLGTV).find(
      (item) => alexaToLGTV[item].appId === appId,
    );
    if (typeof alexaInput === "undefined") {
      throw Common.Error.create("TV input was unknown", {
        general: "tv",
        specific: "responseInvalid",
      });
    }
    return alexaInput;
  }

  const inputState = Common.SHS.Response.buildContextProperty({
    namespace: "Alexa.InputController",
    name: "input",
    value,
  });
  return [inputState];
}

async function selectInputHandler(
  alexaRequest: Common.SHS.Request,
  backendControl: BackendControl,
): Promise<Common.SHS.ResponseWrapper> {
  function getInput(): string {
    if (typeof alexaRequest.directive.payload.input !== "string") {
      return "";
    }
    return alexaRequest.directive.payload.input.toUpperCase();
  }

  async function setExternalInput(
    input: string | null,
  ): Promise<Common.SHS.ResponseWrapper> {
    if (input === null) {
      return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidValue(
        alexaRequest,
      );
    }

    const lgtvRequest: LGTV.Request = {
      uri: "ssap://tv/switchInput",
      payload: { inputId: input },
    };
    await backendControl.lgtvCommand(lgtvRequest);
    return Common.SHS.ResponseWrapper.buildAlexaResponse(alexaRequest);
  }

  const alexaToLGTV = await getAlexaToLGTV(backendControl);
  const alexaInput = getInput();
  let lgtvId: string | null;
  if (typeof alexaToLGTV[alexaInput] === "undefined") {
    lgtvId = null;
  } else {
    lgtvId = alexaToLGTV[alexaInput].device.id;
  }
  return setExternalInput(lgtvId);
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
    case "SelectInput":
      return selectInputHandler(alexaRequest, backendControl);
    default:
      return Promise.resolve(
        Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidDirectiveName(
          alexaRequest,
        ),
      );
  }
}

export { capabilities, states, handler };

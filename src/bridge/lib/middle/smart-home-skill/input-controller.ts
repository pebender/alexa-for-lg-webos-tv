import * as Common from "../../../../common";
import { BackendControl } from "../../backend";
import LGTV from "lgtv2";

// The list if Alexa.InputController inputs from
// <https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-inputcontroller.html>.
// To determine mapping, the software compares these values with LG webOS TV
// external input ids and labels. It uses uppercase values for the comparison.
// It does the comparisons with and without spaces replaced with '_'. In
// addition, it repeats the same comparisons after applying the renaming of
// Alexa inputs using 'alexaInputRenameList'. If it fails to find any match,
// then the software uses LGTV webOS TV external input id and label as Alexa
// inputs.
//
// The software does not check to be sure that
//   - there are no duplicate LG webOS TV external input ids.
//   - there are no duplicate LG webOS TV external input labels.
//   - there are no duplicates between the LG webOS TV ids and inputs.
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
  backendControl: BackendControl
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
      delete externalInputIdlMap[id];
    }
    const idRenamed = lgtvExternalInputRenameList[id];
    if (typeof externalInputIdlMap[idRenamed] !== "undefined") {
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
  backendControl: BackendControl
): Promise<Common.SHS.Event.Payload.Endpoint.Capability>[] {
  async function getInputCapability(
    backendControl: BackendControl
  ): Promise<Common.SHS.Event.Payload.Endpoint.Capability> {
    const inputs: { name: string; friendlyNames: string[] }[] = [];
    const alexaToLGTV = await getAlexaToLGTV(backendControl);
    Object.keys(alexaToLGTV).forEach((alexaInput) => {
      if (alexaToLGTV[alexaInput].label === alexaInput) {
        inputs.push({
          name: alexaInput,
          friendlyNames: [],
        });
      } else {
        inputs.push({
          name: alexaInput,
          friendlyNames: [alexaToLGTV[alexaInput].label],
        });
      }
    });
    const capability = await Common.SHS.Response.buildPayloadEndpointCapability(
      {
        namespace: "Alexa.InputController",
        propertyNames: ["input"],
      }
    );
    capability.inputs = inputs;
    return capability;
  }

  return [getInputCapability(backendControl)];
}

function states(
  backendControl: BackendControl
): Promise<Common.SHS.Context.Property>[] {
  async function value(): Promise<string | null> {
    const alexaToLGTV = await getAlexaToLGTV(backendControl);
    async function getInput(): Promise<string | null> {
      if (backendControl.getPowerState() === "OFF") {
        return null;
      }
      const lgtvRequest: LGTV.Request = {
        uri: "ssap://com.webos.applicationManager/getForegroundAppInfo",
      };
      const lgtvResponse: LGTV.ResponseForgroundAppInfo =
        (await backendControl.lgtvCommand(
          lgtvRequest
        )) as LGTV.ResponseForgroundAppInfo;
      if (typeof lgtvResponse.appId === "undefined") {
        throw new Error("invalid LGTVResponse message");
      }
      return lgtvResponse.appId;
    }
    const appId = await getInput();
    if (appId === null) {
      return null;
    }
    const alexaInput = Object.keys(alexaToLGTV).find(
      (item) => alexaToLGTV[item].appId === appId
    );
    if (typeof alexaInput === "undefined") {
      return null;
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
  backendControl: BackendControl
): Promise<Common.SHS.ResponseWrapper> {
  function getInput(): string {
    if (typeof alexaRequest.directive.payload.input !== "string") {
      return "";
    }
    return alexaRequest.directive.payload.input.toUpperCase();
  }

  async function setExternalInput(
    input: string | null
  ): Promise<Common.SHS.ResponseWrapper> {
    if (input === null) {
      return Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidValue(
        alexaRequest
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
  const alexaInput = await getInput();
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
  backendControl: BackendControl
): Promise<Common.SHS.ResponseWrapper> {
  if (backendControl.getPowerState() === "OFF") {
    return Promise.resolve(
      Common.SHS.ResponseWrapper.buildAlexaErrorResponseForPowerOff(
        alexaRequest
      )
    );
  }
  switch (alexaRequest.directive.header.name) {
    case "SelectInput":
      return selectInputHandler(alexaRequest, backendControl);
    default:
      return Promise.resolve(
        Common.SHS.ResponseWrapper.buildAlexaErrorResponseForInvalidDirectiveName(
          alexaRequest
        )
      );
  }
}

export { capabilities, states, handler };

import * as Common from "../../../../common";
import { Backend, BackendControl } from "../../backend";
import { capabilities as alexaSmartHomeCapabilities } from "./index";
import { constants } from "../../../../common/constants";

async function handler(
  alexaRequest: Common.SHS.Request,
  backend: Backend
): Promise<Common.SHS.ResponseWrapper> {
  //
  // This looks strange at first. However, once it is explained, this
  // convolution of promises and async/awaits should make sense. The goal is
  // to (1) convert an array of functions into an array of their corresponding
  // values, and then (2) use this array in a function that maps a different
  // array.
  //
  // In our case, 'buildEndpoint' accomplishes (1) and 'buildEndpointList'
  // accomplishes (2).
  //
  // To create the array of function values in parallel. To process them in
  // parallel, we use 'Promise.resolve' to convert the functions to promises
  // (even if they are already promises) and then use 'Promise.all' to process
  // the resulting promises in parallel. After that, we use await to convert
  // the array of promises into an array corresponding array of function
  // values. If the function returns a promise, then the value is the
  // resolution of the promise.
  //
  // In our case, each function's value is an Array of capabilities of the
  // corresponding Alexa control. Since we want the final array to be one
  // dimensional so we flatten it.
  //
  // Using await means an async function. Under the hood, async/await uses
  // promises. Because 'buildEndpoint' is an async function, it is wrapped
  // in a promise behind the scenes. This promise may be pending until it
  // must be resolved in order to use the resolved value. Since there is no
  // reason for Array's 'map' method to resolve the pending promises, we use
  // 'Promise.all' to ensure the array of promises is resolve. After that, we
  // use 'await' to ensure we have the values from the resolved promises.
  //
  async function buildEndpoint(
    backendControl: BackendControl
  ): Promise<Common.SHS.Event.Payload.Endpoint> {
    let capabilities: Common.SHS.Event.Payload.Endpoint.Capability[] = [];
    try {
      // Determine capabilities in parallel.
      capabilities = await Promise.all(
        alexaSmartHomeCapabilities(backendControl)
      );
    } catch (error) {
      capabilities = [];
    }
    const endpoint: Common.SHS.Event.Payload.Endpoint = {
      endpointId: backendControl.tv.udn,
      friendlyName: backendControl.tv.name,
      description: constants.application.name.pretty,
      manufacturerName: constants.application.vendor,
      displayCategories: ["TV"],
      capabilities: [],
    };
    capabilities.forEach((capability): void => {
      if (typeof capability === "undefined" || capability === null) {
        return;
      }
      endpoint.capabilities.push(capability);
    });
    return endpoint;
  }

  function buildEndpoints(
    backendControls: BackendControl[]
  ): Promise<Common.SHS.Event.Payload.Endpoint[]> {
    return Promise.all(backendControls.map(buildEndpoint));
  }

  function buildResponse(
    endpoints: Common.SHS.Event.Payload.Endpoint[]
  ): Common.SHS.Response {
    const alexaResponse = new Common.SHS.Response({
      namespace: "Alexa.Discovery",
      name: "Discover.Response",
    });
    endpoints.forEach((endpoint: Common.SHS.Event.Payload.Endpoint): void => {
      if (endpoint !== null) {
        alexaResponse.addPayloadEndpoint(endpoint);
      }
    });
    return alexaResponse;
  }

  const backendControls = await backend.controls();
  const endpoints = await buildEndpoints(backendControls);
  const response = await buildResponse(endpoints);
  return new Common.SHS.ResponseWrapper(alexaRequest, response);
}

export { handler };

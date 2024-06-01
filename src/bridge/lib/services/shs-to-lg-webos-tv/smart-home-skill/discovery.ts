import * as Common from "../../../../../common";
import type { TvManager, TvControl } from "../tv-manager";
import { capabilities as alexaSmartHomeCapabilities } from "./index";

async function handler(
  alexaRequest: Common.SHS.Request,
  tvManager: TvManager,
): Promise<Common.SHS.Response> {
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
    tvControl: TvControl,
  ): Promise<Common.SHS.EventPayloadEndpoint> {
    let capabilities: Common.SHS.EventPayloadEndpointCapability[] = [];
    try {
      // Determine capabilities in parallel.
      capabilities = await Promise.all(alexaSmartHomeCapabilities(tvControl));
    } catch (error) {
      Common.Debug.debugError(error);
      capabilities = [];
    }
    const endpoint: Common.SHS.EventPayloadEndpoint = {
      endpointId: tvControl.tv.udn,
      friendlyName: tvControl.tv.name,
      description: Common.constants.application.name.pretty,
      manufacturerName: Common.constants.application.vendor,
      displayCategories: ["TV"],
      capabilities: [],
    };
    for (const capability of capabilities) {
      endpoint.capabilities.push(capability);
    }
    return endpoint;
  }

  async function buildEndpoints(
    tvControls: TvControl[],
  ): Promise<Common.SHS.EventPayloadEndpoint[]> {
    return await Promise.all(
      tvControls.map(
        async (tvControl: TvControl) => await buildEndpoint(tvControl),
      ),
    );
  }

  function buildResponse(
    endpoints: Common.SHS.EventPayloadEndpoint[],
  ): Common.SHS.Response {
    const alexaResponse = new Common.SHS.Response({
      namespace: "Alexa.Discovery",
      name: "Discover.Response",
    });
    for (const endpoint of endpoints) {
      alexaResponse.addPayloadEndpoint(endpoint);
    }
    return alexaResponse;
  }

  const tvControls = tvManager.controls();
  const endpoints = await buildEndpoints(tvControls);
  const response = buildResponse(endpoints);
  return response;
}

export { handler };

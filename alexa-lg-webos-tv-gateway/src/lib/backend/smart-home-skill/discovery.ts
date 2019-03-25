import * as alexa from "./alexa";
import * as alexaChannelController from "./channel-controller";
import * as alexaInputController from "./input-controller";
import * as alexaLauncher from "./launcher";
import * as alexaPlaybackController from "./playback-controller";
import * as alexaPowerController from "./power-controller";
import * as alexaSpeaker from "./speaker";
import {AlexaRequest,
    AlexaResponse,
    AlexaResponseEventPayloadEndpoint,
    namespaceErrorResponse} from "alexa-lg-webos-tv-common";
import {Backend} from "../../backend";
import {UDN} from "../../common";

async function handler(backend: Backend, alexaRequest: AlexaRequest): Promise<AlexaResponse> {

    /*
     * This looks strange at first. However, once it is explained, this
     * convolution of promises and async/awaits should make sense. The goal is
     * to (1) convert an array of functions into an array of their corresponding
     * values, and then (2) use this array in a function that maps a different
     * array.
     *
     * In our case, 'buildEndpoint' accomplishes (1) and 'buildEndpointList'
     * accoplishes (2).
     *
     * To create the array of function values in parallel. To process them in
     * parallel, we use 'Promise.resolve' to convert the functions to promises
     * (even if they are already promises) and then use 'Promise.all' to process
     * the resulting promises in parallel. After that, we use await to convert
     * the array of promises into an array corresponding array of function
     * values. If the function returns a promise, then the value is the
     * resolution of the promise.
     *
     * In our case, each function's value is an Array of capabilities of the
     * corresponding Alexa control. Since we want the final array to be one
     * dimensional so we flatten it.
     *
     * Using await means an async function. Under the hood, async/await uses
     * promises. Because 'buildEndpoint' is an async function, it is wrapped
     * in a promise behind the scenes. This promise may be pending until it
     * must be resolved in order to use the resolved value. Since there is no
     * reason for Array's 'map' method to resolve the pending promises, we use
     * 'Promise.all' to ensure the array of promises is resolve. After that, we
     * use 'await' to ensure we have the values from the resolved promises.
     */
    async function buildEndpoint(udn: UDN): Promise<AlexaResponseEventPayloadEndpoint> {
        try {
            // Determine capabilities in parallel.
            const capabilitiesList = await Promise.all([
                alexa.capabilities(backend, alexaRequest, udn),
                alexaPowerController.capabilities(backend, alexaRequest, udn),
                alexaSpeaker.capabilities(backend, alexaRequest, udn),
                alexaChannelController.capabilities(backend, alexaRequest, udn),
                alexaInputController.capabilities(backend, alexaRequest, udn),
                alexaLauncher.capabilities(backend, alexaRequest, udn),
                alexaPlaybackController.capabilities(backend, alexaRequest, udn)
            ].map((value) => Promise.resolve(value)));
            // Convert from a two dimensional array to a one dimensional array.
            const capabilities = [].concat(...capabilitiesList);

            if (capabilities.length === 0) {
                return null;
            }
            const {name} = backend.tv(udn);
            const endpoint: AlexaResponseEventPayloadEndpoint = AlexaResponse.createPayloadEndpoint({
                "endpointId": udn,
                "friendlyName": name,
                "description": "LG webOS TV",
                "manufacturerName": "LG Electronics",
                "displayCategories": ["TV"],
                "capabilities": capabilities
            });
            return endpoint;
        } catch (error) {
            return null;
        }
    }

    async function buildEndpointList(udns: UDN[]): Promise<AlexaResponseEventPayloadEndpoint[]> {

        const endpoints = await Promise.all(udns.map(buildEndpoint));
        return endpoints;
    }

    function buildResponse(endpoints: AlexaResponseEventPayloadEndpoint[]): AlexaResponse {
        const alexaResponse = new AlexaResponse({
            "namespace": "Alexa.Discovery",
            "name": "Discover.Response"
        });
        endpoints.forEach((endpoint: AlexaResponseEventPayloadEndpoint) => {
            if (endpoint !== null) {
                alexaResponse.addPayloadEndpoint(endpoint);
            }
        });
        return alexaResponse;
    }

    if (alexaRequest.directive.header.namespace !== "Alexa.Discovery") {
        return namespaceErrorResponse(alexaRequest, "Alexa.Discovery");
    }

    const udnList = await backend.getUDNList();
    const endpointList = await buildEndpointList(udnList);
    const response = await buildResponse(endpointList);
    return response;
}

export {handler};
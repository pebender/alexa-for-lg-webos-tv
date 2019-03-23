import {namespaceErrorResponse, AlexaResponseEventPayloadEndpoint} from "alexa-lg-webos-tv-common";
import {AlexaRequest, AlexaResponse} from "alexa-lg-webos-tv-common";
import {UDN} from "../../common";
import {BackendController} from "../../backend";
const alexa = require("./alexa");
const alexaPowerController = require("./power-controller");
const alexaSpeaker = require("./speaker");
const alexaChannelController = require("./channel-controller");
const alexaInputController = require("./input-controller");
const alexaLauncher = require("./launcher");
const alexaPlaybackController = require("./playback-controller");

async function handler(lgtv: BackendController, alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    if (alexaRequest.directive.header.namespace !== "Alexa.Discovery") {
        return namespaceErrorResponse(alexaRequest, "Alexa.Discovery");
    }

    const udnList = await lgtv.getUDNList();
    const endpointList = await buildEndpointList(udnList);
    const response = await buildResponse(endpointList);
    return response;

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
    async function buildEndpointList(udns: UDN[]): Promise<AlexaResponseEventPayloadEndpoint[]> {

        const endpoints = await Promise.all(udns.map(buildEndpoint));
        return endpoints;
    }

    async function buildEndpoint(udn: UDN): Promise<AlexaResponseEventPayloadEndpoint> {
        try {
            // Determine capabilities in parallel.
            const capabilitiesList = await Promise.all([
                alexa.capabilities(lgtv, alexaRequest, udn),
                alexaPowerController.capabilities(lgtv, alexaRequest, udn),
                alexaSpeaker.capabilities(lgtv, alexaRequest, udn),
                alexaChannelController.capabilities(lgtv, alexaRequest, udn),
                alexaInputController.capabilities(lgtv, alexaRequest, udn),
                alexaLauncher.capabilities(lgtv, alexaRequest, udn),
                alexaPlaybackController.capabilities(lgtv, alexaRequest, udn),
            ].map((value) => Promise.resolve(value)));
            // Convert from a two dimensional array to a one dimensional array.
            const capabilities = [].concat(...capabilitiesList);

            if (capabilities.length === 0) {
                return null;
            }
            const {name} = lgtv.tv(udn);
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

    function buildResponse(endpoints: any): AlexaResponse {
        const alexaResponse = new AlexaResponse({
            "namespace": "Alexa.Discovery",
            "name": "Discover.Response"
        });
        endpoints.forEach((endpoint: any) => {
            if (endpoint !== null) {
                alexaResponse.addPayloadEndpoint(endpoint);
            }
        });
        return alexaResponse;
    }
}

export {handler};
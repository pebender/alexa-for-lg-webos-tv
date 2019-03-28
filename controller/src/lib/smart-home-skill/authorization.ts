import {AlexaRequest,
    AlexaResponse} from "../common";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handler(_alexaRequest: AlexaRequest): Promise<AlexaResponse> {
    return Promise.resolve(null);
}

export {handler};
import * as ASH from "../../../common/alexa";

function handler(alexaRequest: ASH.Request): Promise<ASH.Response> {
    return Promise.resolve(ASH.errorResponse(alexaRequest, "INTERNAL_ERROR", "'Alexa.Authorization' is not supported."));
}

export {handler};
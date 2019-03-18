const {errorResponse} = require("alexa-lg-webos-tv-common");
import {AlexaRequest} from "alexa-lg-webos-tv-common";
import {UDN} from "../../common";
import {BackendController} from "../../backend";

function handler(_lgtv: BackendController, _udn: UDN, event: AlexaRequest) {
    return errorResponse(event, "INTERNAL_ERROR", "");
}

export {handler};
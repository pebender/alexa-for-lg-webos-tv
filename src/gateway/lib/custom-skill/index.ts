import {Backend} from "../backend";
import LGTV from "lgtv2";

/*
 *******************************************************************************
 * I found the 'ssap://*' LG webOS TV commands in
 * <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
 * These commands may be incomplete/inaccurate as the LG Connect SDK team
 * <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
 * since the 1.6.0 release on 09 September 2015.
 */
export async function handler(event: {udn: string; lgtvRequest: LGTV.Request}, backend: Backend): Promise<LGTV.Response> {
    try {
        const commandResponse = await backend.control(event.udn).lgtvCommand(event.lgtvRequest);
        return commandResponse;
    } catch (error) {
        const body: LGTV.Response = {
            "returnValue": false,
            "error": {
                "name": error.name,
                "message": error.message
            }
        };
        return body;
    }
}

export class CustomSkill {
    private backend: Backend;
    public constructor(backend: Backend) {
        this.backend = backend;
    }

    public handler(event: {udn: string; lgtvRequest: LGTV.Request}): Promise<LGTV.Response> {
        return handler(event, this.backend);
    }
}
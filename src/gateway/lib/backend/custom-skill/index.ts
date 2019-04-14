import {LGTVRequest,
    LGTVResponse} from "../../../../common";
import {Backend} from "../../backend";

/*
 *******************************************************************************
 * I found the 'ssap://*' LG webOS TV commands in
 * <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
 * These commands may be incomplete/inaccurate as the LG Connect SDK team
 * <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
 * since the 1.6.0 release on 09 September 2015.
 */
export async function handler(backend: Backend, event: {udn: string; lgtvRequest: LGTVRequest}): Promise<LGTVResponse> {
    try {
        const commandResponse = await backend.control(event.udn).lgtvCommand(event.lgtvRequest);
        return commandResponse;
    } catch (error) {
        const body: LGTVResponse = {
            "returnValue": false,
            "error": {
                "name": error.name,
                "message": error.message
            }
        };
        return body;
    }
}
/*
 *******************************************************************************
 * I found the 'ssap://*' LG webOS TV commands in
 * <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
 * These commands may be incomplete/inaccurate as the LG Connect SDK team
 * <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
 * since the 1.6.0 release on 09 September 2015.
 */
function handler(lgtv, event) {
    const udn = event.body.television;
    const controllerMessage = event.body.command;

    const lgtvMessage = {
        "uri": null,
        "payload": null
    };
    switch (controllerMessage.name) {
    case "launchApplication":
        lgtvMessage.wol = true;
        lgtvMessage.uri = "ssap://system.launcher/launch";
        switch (controllerMessage.value) {
        case "amazon":
            lgtvMessage.payload = {"id": "amazon"};
            break;
        case "netflix":
            lgtvMessage.payload = {"id": "netflix"};
            break;
        case "plex":
            lgtvMessage.payload = {"id": "cdp-30"};
            break;
        case "youtube":
            lgtvMessage.payload = {"id": "youtube.leanback.v4"};
            break;
        default:
            lgtvMessage.wol = false;
            lgtvMessage.uri = null;
            break;
        }
        break;
    case "closeApplication":
        lgtvMessage.uri = "ssap://system.launcher/close";
        switch (controllerMessage.value) {
        case "amazon":
            lgtvMessage.payload = {"id": "amazon"};
            break;
        case "netflix":
            lgtvMessage.payload = {"id": "netflix"};
            break;
        case "plex":
            lgtvMessage.payload = {"id": "cdp-30"};
            break;
        case "youtube":
            lgtvMessage.payload = {"id": "youtube.leanback.v4"};
            break;
        default:
            lgtvMessage.wol = false;
            lgtvMessage.uri = null;
            break;
        }
        break;
    case "showMessage":
        lgtvMessage.uri = "ssap://system.notifications/createToast";
        lgtvMessage.payload = {"message": controllerMessage.value};
        break;
    default:
        break;
    }
    try {
        const commandResponse = lgtv.lgtvCommand(udn, lgtvMessage);
        return commandResponse;
    } catch (error) {
        const body = {
            "error": {
                "name": error.name,
                "message": error.message
            }
        };
        return body;
    }
}

module.exports = {
    "handler": handler
};
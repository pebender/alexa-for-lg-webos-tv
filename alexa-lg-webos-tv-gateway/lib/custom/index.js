/*
 *******************************************************************************
 * I found the 'ssap://*' LG webOS TV commands in
 * <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
 * These commands may be incomplete/inaccurate as the LG Connect SDK team
 * <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
 * since the 1.6.0 release on 09 September 2015.
 */
function handler(lgtvController, event) {
    return eventToCommand().then((command) => lgtvController.lgtvCommand(event.television, command));

    function eventToCommand() {
        return new Promise((resolve) => {
            const command = {
                "uri": null,
                "payload": null
            };
            switch (event.command.name) {
            case "launchApplication":
                command.wol = true;
                command.uri = "ssap://system.launcher/launch";
                switch (event.command.value) {
                case "amazon":
                command.payload = {"id": "amazon"};
                    break;
                case "netflix":
                command.payload = {"id": "netflix"};
                    break;
                case "plex":
                command.payload = {"id": "cdp-30"};
                    break;
                case "youtube":
                command.payload = {"id": "youtube.leanback.v4"};
                    break;
                default:
                command.wol = false;
                command.uri = null;
                    break;
                }
                break;
            case "closeApplication":
                command.uri = "ssap://system.launcher/close";
                switch (event.command.value) {
                case "amazon":
                    command.payload = {"id": "amazon"};
                    break;
                case "netflix":
                    command.payload = {"id": "netflix"};
                    break;
                case "plex":
                    command.payload = {"id": "cdp-30"};
                    break;
                case "youtube":
                    command.payload = {"id": "youtube.leanback.v4"};
                    break;
                default:
                    command.wol = false;
                    command.uri = null;
                    break;
                }
                break;
            case "showMessage":
                command.uri = "ssap://system.notifications/createToast";
                command.payload = {"message": event.command.value};
                break;
            default:
                break;
            }
            resolve(command);
        });
    }
}

module.exports = {"handler": handler};
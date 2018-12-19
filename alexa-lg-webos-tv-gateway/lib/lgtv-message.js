/*
 *******************************************************************************
 * I found the 'ssap://*' LG webOS TV commands in
 * <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
 * These commands may be incomplete/inaccurate as the LG Connect SDK team
 * <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
 * since the 1.6.0 release on 09 September 2015.
 */
class LGTVMessage {
    static translate(controllerMessage) {
        const lgtvMessage = {
            'wol': false,
            'uri': null,
            'payload': null
        };
        switch (controllerMessage.name) {
        case 'wol':
            lgtvMessage.wol = true;
            break;
        case 'turnOff':
            lgtvMessage.uri = 'ssap://system/turnOff';
            break;
        case 'decreaseVolume':
            lgtvMessage.uri = 'ssap://audio/volumeDown';
            break;
        case 'increaseVolume':
            lgtvMessage.uri = 'ssap://audio/volumeUp';
            break;
        case 'setVolume':
            if (controllerMessage.value >= 0 && controllerMessage.value <= 99) {
                lgtvMessage.uri = 'ssap://audio/setVolume';
                lgtvMessage.payload = {'volume': controllerMessage.value};
            }
            break;
        case 'setMute':
            lgtvMessage.uri = 'ssap://audio/setMute';
            switch (controllerMessage.value) {
            case 'on':
                lgtvMessage.payload = {'mute': true};
                break;
            case 'off':
                lgtvMessage.payload = {'mute': false};
                break;
            default:
                lgtvMessage.uri = null;
                break;
            }
            break;
        case 'selectInput':
            lgtvMessage.wol = true;
            lgtvMessage.uri = 'ssap://tv/switchInput';
            switch (controllerMessage.value) {
            case 'TV':
                lgtvMessage.payload = {'inputId': 'TV'};
                break;
            case 'HDMI_1':
                lgtvMessage.payload = {'inputId': 'HDMI_1'};
                break;
            case 'HDMI_2':
                lgtvMessage.payload = {'inputId': 'HDMI_2'};
                break;
            case 'HDMI_3':
                lgtvMessage.payload = {'inputId': 'HDMI_3'};
                break;
            case 'HDMI_4':
                lgtvMessage.payload = {'inputId': 'HDMI_4'};
                break;
            default:
                lgtvMessage.wol = false;
                lgtvMessage.uri = null;
                break;
            }
            break;
        case 'launchApplication':
            lgtvMessage.wol = true;
            lgtvMessage.uri = 'ssap://system.launcher/launch';
            switch (controllerMessage.value) {
            case 'amazon':
            lgtvMessage.payload = {'id': 'amazon'};
                break;
            case 'netflix':
            lgtvMessage.payload = {'id': 'netflix'};
                break;
            case 'plex':
            lgtvMessage.payload = {'id': 'cdp-30'};
                break;
            case 'youtube':
            lgtvMessage.payload = {'id': 'youtube.leanback.v4'};
                break;
            default:
            lgtvMessage.wol = false;
            lgtvMessage.uri = null;
                break;
            }
            break;
        case 'closeApplication':
            lgtvMessage.uri = 'ssap://system.launcher/close';
            switch (controllerMessage.value) {
            case 'amazon':
                lgtvMessage.payload = {'id': 'amazon'};
                break;
            case 'netflix':
                lgtvMessage.payload = {'id': 'netflix'};
                break;
            case 'plex':
                lgtvMessage.payload = {'id': 'cdp-30'};
                break;
            case 'youtube':
                lgtvMessage.payload = {'id': 'youtube.leanback.v4'};
                break;
            default:
                lgtvMessage.wol = false;
                lgtvMessage.uri = null;
                break;
            }
            break;
        case 'showMessage':
            lgtvMessage.uri = 'ssap://system.notifications/createToast';
            lgtvMessage.payload = {'message': controllerMessage.value};
            break;
        default:
            break;
        }
        return lgtvMessage;
    }
}

module.exports = LGTVMessage;
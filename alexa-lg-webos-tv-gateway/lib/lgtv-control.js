'use strict';

////////////////////////////////////////////////////////////////////////////////
// I found the 'ssap://*' LG webOS TV commands in
// <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
// These commands may be incomplete/inaccurate as the LG Connect SDK team
// <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
// since the 1.6.0 release on 09 September 2015.

const lgtv = require('lgtv2');
const SSDPClient = require('node-ssdp').Client;
const wol = require('wol');
const EventEmitter = require('events');

class LGTVControl extends EventEmitter {
    constructor (db) {

        super();

        this.private = {};
        this.private.controls = [];
        if (typeof db === 'undefined' || db === null) {
            return;
        }
        this.private.db = db;
    }

    dbLoad() {
        const that = this;
        this.private.db.find({}, (error, docs) => {
            if (error) {
                that.emit('error', error);
                return;
            }
            if (docs != []) {
                let index;
                for (index = 0; index < docs.length; index += 1) {
                    if (!that.private.controls.hasOwnProperty(docs[index].udn)) {
                        that.private.controls[docs[index].udn] = new LGTVControlOne(that.private.db, docs[index]);
                        eventsAdd(docs[index].udn);
                    }
                }
            }
        });
        function eventsAdd(udn) {
            that.private.controls[udn].on('error', (error) => {
                that.emit('error', error, udn);
            });
        }
    }

    tvUpsert(tv) {
        const that = this;
        that.private.db.findOne({'$and': [
            {'udn': tv.udn},
            {'name': tv.name},
            {'ip': tv.ip},
            {'url': tv.url},
            {'mac': tv.mac}]}, (error, doc) => {
            if (error) {
                that.emit('error', error, tv.udn);
                return;
            }
            if (doc === null) {
                if (that.private.controls.hasOwnProperty(tv.udn)) {
                    delete that.private.controls[tv.udn];
                }
                that.private.db.update({'udn': tv.udn}, tv, {'upsert': true},
                    (err, numAffectedDocs, affectedDocs, upsert) => {
                        if (error) {
                            that.emit('error', error, tv.udn);
                            return;
                        }
                        if (!that.private.controls.hasOwnProperty(tv.udn)) {
                            that.private.controls[tv.udn] = new LGTVControlOne(that.private.db, tv);
                            eventsAdd(tv.udn);

                        }
                        return;
                    });
            } else {
                if (!that.private.controls.hasOwnProperty(doc.udn)) {
                    that.private.controls[doc.udn] = new LGTVControlOne(that.private.db, tv);
                    eventsAdd(doc.udn);
                }
                return;
            }
        });
        function eventsAdd(udn) {
            that.private.controls[udn].on('error', (error) => {
                that.emit('error', error, udn);
            });
        }
    }

    tvCommand(udn, command, callback) {
        if (this.private.controls.hasOwnProperty(udn)) {
            this.private.controls[udn].command(command, (error, response) => {
                callback(error, response);
                return;
            });
            return;
        } else {
            callback(new Error(''), null);
            return;
        }
    }
}

class LGTVControlOne extends EventEmitter {
    constructor(db, tv) {

        super();

        this.private = {};
        this.private.db = db;
        this.private.connecting = false;
        this.private.tv = {};
        this.private.tv.udn = tv.udn;
        this.private.tv.name = tv.name;
        this.private.tv.ip = tv.ip;
        this.private.tv.url = tv.url;
        this.private.tv.mac = tv.mac;

        const saveKey = (key, callback) => {
            this.private.db.update({'udn': this.private.tv.udn}, {'$set': {'key': key}},
                (error, num, upsert) => {
                    if (error) {
                        callback(error);
                        return;
                    }
                });
        };
        this.private.connection = new lgtv({
            'url': this.private.tv.url,
            'timeout': 10000,
            'reconnect': 0,
            'clientKey': tv.key,
            'saveKey': saveKey
        });
        this.private.connection.on('error', (error) => {
            this.private.connecting = false;
            if (error) {
                if (error.code != 'EHOSTUNREACH') {
                    this.emit('error', error);
                    return;
                }
            }
        });
        this.private.connection.on('connecting', (host) => {
            this.private.connecting = true;
        });
        this.private.connection.on('connect', () => {
            this.private.connecting = false;
        });
        this.private.connection.on('close', () => { 
            this.private.connecting = false;
        });
        this.private.ssdp = new SSDPClient({'sourcePort': '1900'});
        this.private.ssdp.start();
        this.private.ssdp.on('advertise-alive', (headers, rinfo) => {
            if (headers.USN.startsWith(`${this.private.udn}::`) &&
                headers.NT == 'urn:lge-com:service:webos-second-screen:1') {
                if (this.private.connecting == false) {
                    this.private.connection.connect(this.private.tv.url);
                }
            }
        });
        this.private.ssdp.on('advertise-bye', (headers, rinfo) => {
            if (headers.USN.startsWith(`${this.private.tv.udn}::`) &&
                headers.NT == 'urn:lge-com:service:webos-second-screen:1') {
                this.private.connection.disconnect();
            }
        });
    }

    command(command, callback) {
        const translation = LGTVControlOne.commandTranslate(command);
        if (translation.powerOn === true) {
            wol.wake(this.tv.mac, (error, response) => {
                if (error) {
                    callback(error, null);
                    return error;
                }
                if (translation.uri === null) {
                    callback(null, null);
                    return;
                }
            });
        }
        if (translation.uri !== null) {
            if (translation.payload === null) {
                this.private.connection.request(translation.uri,
                    (error, response) => {
                        callback(error, response);
                        return;
                    }
                );
            } else {
                this.private.connection.request(translation.uri,
                    translation.payload,
                    (error, response) => {
                        callback(error, response);
                        return;
                    }
                );
            }
        }
    }

    static CommandTranslate(command) {
        let powerOn = false;
        let uri = null;
        let payload = null;
        switch(command.name)
        {
        case 'powerOn': powerOn = true; break;
        case 'powerOff': uri = 'ssap://system/turnOff'; break;
        case 'volumeDown': uri = 'ssap://audio/volumeDown'; break;
        case 'volumeUp': uri = 'ssap://audio/volumeUp'; break;
        case 'volumeSet':
            if (command.value >= 0 && command.value <= 99) {
                uri = 'ssap://audio/setVolume';
                payload = {'volume': command.value};
            }
            break;
        case 'muteSet':
            uri = 'ssap://audio/setMute';
            switch(command.value)
            {
            case 'on': payload = {'mute': true}; break;
            case 'off': payload = {'mute': false}; break;
            default: uri = null; break;
            }
            break;
        case 'inputSet':
            powerOn = true;
            uri = 'ssap://tv/switchInput';
            switch(command.value)
            {
            case 'TV': payload = {'inputId': 'TV'}; break;
            case 'HDMI_1': payload = {'inputId': 'HDMI_1'}; break;
            case 'HDMI_2': payload = {'inputId': 'HDMI_2'}; break;
            case 'HDMI_3': payload = {'inputId': 'HDMI_3'}; break;
            case 'HDMI_4': payload = {'inputId': 'HDMI_4'}; break;
            default: powerOn = false; uri = null; break;
            }
            break;
        case 'applicationLaunch':
            powerOn = true;
            uri = 'ssap://system.launcher/launch';
            switch(command.value)
            {
            case 'amazon': payload = {'id': 'amazon'}; break;
            case 'netflix': payload = {'id': 'netflix'}; break;
            case 'plex': payload = {'id': 'cdp-30'}; break;
            case 'youtube': payload = {'id': 'youtube.leanback.v4'}; break;
            default: powerOn = false; uri = null; break;
            }
            break;
        case 'closeApp':
            uri = 'ssap://system.launcher/close';
            switch(command.value)
            {
            case 'amazon':  payload = {'id': 'amazon'}; break;
            case 'netflix': payload = {'id': 'netflix'}; break;
            case 'plex':    payload = {'id': 'cdp-30'}; break;
            case 'youtube': payload = {'id': 'youtube.leanback.v4'}; break;
            default: powerOn = false; uri = null; break;
            }
            break;
        case 'messageShow':
            uri = 'ssap://system.notifications/createToast';
            payload = {'message': command.value};
            break;
        default:
            break;
        }
        return {powerOn, uri, payload};
    }
}

module.exports = LGTVControl;

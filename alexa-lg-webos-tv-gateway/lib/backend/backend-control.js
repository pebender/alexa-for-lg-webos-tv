const LGTV = require("lgtv2");
const SSDPClient = require("node-ssdp").Client;
const wol = require("wol");
const EventEmitter = require("events");
const {Mutex} = require("async-mutex");
const {GenericError, UnititializedClassError} = require("alexa-lg-webos-tv-common");
const {callbackToPromise} = require("alexa-lg-webos-tv-common");

const mutex = new Mutex();

class BackendControl extends EventEmitter {
    constructor(db, tv) {
        super();

        this.private = {};
        this.private.initialized = false;
        this.private.db = db;
        this.private.connecting = false;
        this.private.powerOn = false;
        this.private.tv = {};
        this.private.tv.udn = tv.udn;
        this.private.tv.name = tv.name;
        this.private.tv.ip = tv.ip;
        this.private.tv.url = tv.url;
        this.private.tv.mac = tv.mac;
        this.private.tv.key = "";
        if (Reflect.has(tv, "key") && tv.key !== null) {
            this.private.tv.key = tv.key;
        }
        this.private.connection = null;
        this.private.ssdpNotify = null;

        this.private.throwIfNotInitialized = (methodName) => {
            if (this.private.initialized === false) {
                throw new UnititializedClassError("BackendControl", methodName);
            }
        };
    }

    initialize() {
        const that = this;
        return mutex.runExclusive(() => new Promise((resolve, reject) => {
            if (this.private.initialized === true) {
                resolve();
                return;
            }

            let clientKey = "";
            if (Reflect.has(this.private.tv, "key")) {
                clientKey = this.private.tv.key;
                Reflect.deleteProperty(this.private.tv, "key");
            } else {
                reject(new GenericError("error", "initial LGTV key not set"));
            }

            this.private.connection = new LGTV({
                "url": this.private.tv.url,
                "timeout": 10000,
                "reconnect": 0,
                "clientKey": clientKey,
                "saveKey": saveKey
            });
            this.private.connection.on("error", (error) => {
                this.private.connecting = false;
                if (error && error.code !== "EHOSTUNREACH") {
                    this.emit("error", error, this.private.tv.udn);
                }
            });
            // eslint-disable-next-line no-unused-vars
            this.private.connection.on("connecting", (_host) => {
                this.private.connecting = true;
            });
            this.private.connection.on("connect", () => {
                this.private.connecting = false;
                this.private.powerOn = true;
            });
            this.private.connection.on("close", () => {
                this.private.connecting = false;
            });
            this.private.ssdpNotify = new SSDPClient({"sourcePort": "1900"});
            this.private.ssdpNotify.on("advertise-alive", advertiseAliveHandler);
            this.private.ssdpNotify.on("advertise-bye", advertiseByeHandler);
            this.private.ssdpNotify.start();
            this.private.initialized = true;
        }));

        function saveKey(key, callback) {
            that.private.db.updateRecord(
                {"udn": that.private.tv.udn},
                {"$set": {"key": key}}
            ).
            catch((error) => {
                callback(error);
                // eslint-disable-next-line no-useless-return
                return;
            });
        }

        // eslint-disable-next-line no-unused-vars
        function advertiseAliveHandler(headers, _rinfo) {
            if (headers.USN === `${that.private.tv.udn}::urn:lge-com:service:webos-second-screen:1`) {
                that.private.powerOn = true;
                if (that.private.connecting === false) {
                    that.private.connection.connect(that.private.tv.url);
                }
            }
        }

        // eslint-disable-next-line no-unused-vars
        function advertiseByeHandler(headers, _rinfo) {
            if (headers.USN === `${that.private.tv.udn}::urn:lge-com:service:webos-second-screen:1`) {
                that.private.powerOn = false;
                that.private.connection.disconnect();
            }
        }
    }

    get tv() {
        this.private.throwIfNotInitialized("get+tv");
        const tv = {
            "udn": this.private.tv.udn,
            "name": this.private.tv.name,
            "ip": this.private.tv.ip,
            "url": this.private.tv.url,
            "mac": this.private.tv.mac
        };
        return tv;
    }

    async turnOff() {
        this.private.throwIfNotInitialized("turnOff");
        const command = {
            "uri": "ssap://system/turnOff"
        };
        await this.private.connection.request(command.uri);
        this.private.powerOn = false;
    }

    turnOn() {
        const that = this;
        this.private.throwIfNotInitialized("turnOn");

        let finished = false;
        let finishing = false;

        let ssdpNotify = new SSDPClient({"sourcePort": "1900"});
        ssdpNotify.on("advertise-alive", ssdpHandler);

        let ssdpResponse = new SSDPClient();
        ssdpResponse.on("response", ssdpHandler);

        ssdpNotify.start();
        setImmediate(wolHandler);
        setImmediate(searchHandler);
        setTimeout(finish, 5000);

        function wolHandler() {
            const {mac} = that.private.tv;
            // eslint-disable-next-line no-unused-vars
            wol.wake(mac, (error, response) => {
                if (finished === false) {
                    setTimeout(wolHandler, 250);
                }
            });
        }

        function searchHandler() {
            if (finished === false && ssdpResponse !== null) {
                ssdpResponse.search(that.private.tv.udn);
                setTimeout(searchHandler, 1000);
            }
        }

        // eslint-disable-next-line no-unused-vars
        function ssdpHandler(headers, rinfo) {
            if (headers.USN.startsWith(`${that.private.tv.udn}::`) === true &&
                (Reflect.has(headers, "NTS") === false || headers.NTS === "ssdp:alive")) {
                    that.private.powerOn = true;
                if (finished === false) {
                    finish();
                }
            }
        }

        function finish() {
            if (finishing === true) {
                return;
            }
            finishing = true;
            if (finished === true) {
                finishing = false;
                return;
            }

            if (ssdpNotify !== null) {
                ssdpNotify.removeAllListeners();
                ssdpNotify = null;
            }
            if (ssdpResponse !== null) {
                ssdpResponse.removeAllListeners();
                ssdpResponse = null;
            }

            if (finished === false) {
                finished = true;
                finishing = false;
            }
        }
    }

    getPowerState() {
        this.private.throwIfNotInitialized("getPowerState");
        return this.private.powerOn
            ? "ON"
            : "OFF";
    }

    async lgtvCommand(command) {
        this.private.throwIfNotInitialized("lgtvCommand");
        let lgtvResponse = null;
        if (command.payload === null) {
            lgtvResponse = await new Promise((resolve, reject) => {
                this.private.connection.request(
                    command.uri,
                    (error, response) => callbackToPromise(resolve, reject, error, response)
                );
            });
        } else {
            lgtvResponse = await new Promise((resolve, reject) => {
                this.private.connection.request(
                    command.uri,
                    command.payload,
                    (error, response) => callbackToPromise(resolve, reject, error, response)
                );
            });
        }
        if (Reflect.has(lgtvResponse, "returnValue") === false) {
            throw new GenericError("lgtvCommand:failed", "The LGTV response did not contain 'returnValue'.");
        }
        if (lgtvResponse.returnValue !== true) {
            throw new GenericError("lgtvCommand:failed", "The LGTV response value 'returnValue' is not true.");
        }
        Reflect.deleteProperty(lgtvResponse, "returnValue");
        return lgtvResponse;
    }
}

module.exports = BackendControl;
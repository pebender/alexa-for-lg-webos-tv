const LGTV = require("lgtv2");
const SSDPClient = require("node-ssdp").Client;
const wol = require("wol");
const EventEmitter = require("events");
const {Mutex} = require("async-mutex");
const uuid = require("uuid/v4");
const {GenericError, UnititializedClassError} = require("alexa-lg-webos-tv-common");

class BackendControl extends EventEmitter {
    constructor(db, tv) {
        super();

        this.private = {};
        this.private.initialized = false;
        this.private.initializeMutex = new Mutex();
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
        return that.private.initializeMutex.runExclusive(() => new Promise((resolve, reject) => {
            if (that.private.initialized === true) {
                resolve();
                return;
            }

            let clientKey = "";
            if (Reflect.has(that.private.tv, "key")) {
                clientKey = that.private.tv.key;
                Reflect.deleteProperty(that.private.tv, "key");
            } else {
                reject(new GenericError("error", "initial LGTV key not set"));
            }

            that.private.connection = new LGTV({
                "url": that.private.tv.url,
                "timeout": 10000,
                "reconnect": 0,
                "clientKey": clientKey,
                "saveKey": saveKey
            });
            that.private.connection.on("error", (error) => {
                that.private.connecting = false;
                if (error && error.code !== "EHOSTUNREACH") {
                    that.emit("error", error, that.private.tv.udn);
                }
            });
            // eslint-disable-next-line no-unused-vars
            that.private.connection.on("connecting", (_host) => {
                that.private.connecting = true;
            });
            that.private.connection.on("connect", () => {
                that.private.connecting = false;
                that.private.powerOn = true;
            });
            that.private.connection.on("close", () => {
                that.private.connecting = false;
            });
            that.private.ssdpNotify = new SSDPClient({"sourcePort": "1900"});
            that.private.ssdpNotify.on("advertise-alive", ssdpConnectHandler);
            that.private.ssdpNotify.on("advertise-bye", ssdpDisconnectHandler);
            that.private.ssdpNotify.start();
            that.private.ssdpResponse = new SSDPClient();
            that.private.ssdpResponse.on("response", ssdpConnectHandler);
            that.private.initialized = true;
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
        function ssdpConnectHandler(headers, _rinfo) {
            if (headers.USN === `${that.private.tv.udn}::urn:lge-com:service:webos-second-screen:1`) {
                if (that.private.connecting === false) {
                    that.private.connection.connect(that.private.tv.url);
                }
            }
        }

        // eslint-disable-next-line no-unused-vars
        function ssdpDisconnectHandler(headers, _rinfo) {
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

    turnOff() {
        this.private.throwIfNotInitialized("turnOff");
        const command = {
            "uri": "ssap://system/turnOff"
        };
        this.private.connection.request(command.uri);
        this.private.powerOn = false;
        return true;
    }

    /*
     * The method turns on the TV. It forces the BackendControl instance
     * to assume the TV is off. Then, it kicks the TV using Wake On Lan, forces
     * a search for the TV and waits for the BackendControl instance to
     * detect that the TV is on. Before it does any of this, it sets a timeout
     * of 7 seconds in an attempt to ensure that Alexa has the chance for a
     * response before its 8 second timeout.
     */
    turnOn() {
        this.private.throwIfNotInitialized("turnOn");
        const that = this;
        return new Promise((resolveTurnOn) => {
            that.private.powerOn = false;
            that.private.connection.disconnect();

            let finishTimeoutObject = setTimeout(finish, 7000, false);

            let monitorTimeoutObject = startInterval(100, () => {
                if (that.private.powerOn === true) {
                    finish(true);
                }
            });
            let wolTimeoutObject = startInterval(250, () => {
                wol.wake(that.private.tv.mac);
            });
            let searchTimeoutObject = startInterval(1000, () => {
                if (that.private.ssdpResponse !== null) {
                    that.private.ssdpResponse.search("urn:lge-com:service:webos-second-screen:1");
                }
            });
            function startInterval(milliseconds, handler, ...args) {
                handler(...args);
                return setInterval(handler, milliseconds, ...args);
            }

            /*
             * The function cleans up and resolves the function's promise. It
             * uses a mutex and a uuid to ensure that clean up and the
             * function's promise resolution is only performed once. The mutex
             * protecting the clean up phase ensures that clean up is called
             * only once. The uuid, which is set during the clean up phase,
             * ensures that the function's promise resolution is called only
             * once.
             */
            let finished = false;
            const finishMutex = new Mutex();
            let finishUUID = null;
            function finish(poweredOn) {
                if (finished === true) {
                    return Promise.resolve(true);
                }
                return finishMutex.runExclusive(() => new Promise((resolveFinish) => {
                    if (finished === true) {
                        resolveFinish(null);
                        return;
                    }

                    finishUUID = uuid();

                    if (wolTimeoutObject !== null) {
                        clearImmediate(wolTimeoutObject);
                        wolTimeoutObject = null;
                    }
                    if (searchTimeoutObject !== null) {
                        clearImmediate(searchTimeoutObject);
                        searchTimeoutObject = null;
                    }
                    if (monitorTimeoutObject !== null) {
                        clearImmediate(monitorTimeoutObject);
                        monitorTimeoutObject = null;
                    }
                    if (finishTimeoutObject !== null) {
                        clearImmediate(wolTimeoutObject);
                        finishTimeoutObject = null;
                    }
                    resolveFinish(finishUUID);
                })).
                then((currentUUID) => {
                    if (finished === false) {
                        if (currentUUID !== null && currentUUID === finishUUID) {
                            finishUUID = null;
                            finished = true;
                            resolveTurnOn(poweredOn);
                        }
                    }
                });
            }
        });
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
                    (error, response) => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve(response);
                    }
                );
            });
        } else {
            lgtvResponse = await new Promise((resolve, reject) => {
                this.private.connection.request(
                    command.uri,
                    command.payload,
                    (error, response) => {
                        if (error) {
                            reject(error);
                            return;
                        }
                        resolve(response);
                    }
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
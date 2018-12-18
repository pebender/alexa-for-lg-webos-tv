const LGTV = require('lgtv2');
const LGTVMessage = require('./lgtv-message.js');
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
            let index = 0;
            for (index = 0; index < docs.length; index += 1) {
                if (!(docs[index].udn in that.private.controls)) {
                    that.private.controls[docs[index].udn] = new LGTVControlOne(that.private.db, docs[index]);
                    eventsAdd(docs[index].udn);
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
            {'mac': tv.mac}
        ]}, (error, doc) => {
            if (error) {
                that.emit('error', error, tv.udn);
                return;
            }
            if (doc === null) {
                if (Reflect.has(that.private.controls, tv.udn)) {
                    Reflect.deleteProperty(that.private.controls, tv.udn);
                }
                that.private.db.update(
                    {'udn': tv.udn},
                    {
                        'udn': tv.udn,
                        'name': tv.name,
                        'ip': tv.ip,
                        'url': tv.url,
                        'mac': tv.mac,
                        'key': ''
                    },
                    {'upsert': true},
                    // eslint-disable-next-line no-unused-vars
                    (err, _numAffectedDocs, _affectedDocs, _upsert) => {
                        if (err) {
                            that.emit('error', err, tv.udn);
                            return;
                        }
                        if (!Reflect.has(that.private.controls, tv.udn)) {
                            that.private.controls[tv.udn] = new LGTVControlOne(that.private.db, tv);
                            eventsAdd(tv.udn);
                        }
                    }
                );
            } else {
                // eslint-disable-next-line no-lonely-if
                if (!Reflect.has(that.private.controls, doc.udn)) {
                    that.private.controls[doc.udn] = new LGTVControlOne(that.private.db, doc);
                    eventsAdd(doc.udn);
                }
            }
        });
        function eventsAdd(udn) {
            that.private.controls[udn].on('error', (error) => {
                that.emit('error', error, udn);
            });
        }
    }

    tvCommand(udn, command, callback) {
        if (udn in this.private.controls) {
            this.private.controls[udn].command(command, (error, response) => {
                callback(error, response);
                return null;
            });
        } else {
            callback(new Error('Requested TV not found.'), null);
            return null;
        }
        return null;
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
            this.private.db.update(
                {'udn': this.private.tv.udn},
                {'$set': {'key': key}},
                // eslint-disable-next-line no-unused-vars
                (err, _numAffected, _affectedDocuments, _upsert) => {
                    if (err) {
                        callback(err);
                        return null;
                    }
                    return null;
                }
            );
        };
        this.private.connection = new LGTV({
            'url': this.private.tv.url,
            'timeout': 10000,
            'reconnect': 0,
            'clientKey': tv.key,
            'saveKey': saveKey
        });
        this.private.connection.on('error', (error) => {
            this.private.connecting = false;
            if (error) {
                if (error.code !== 'EHOSTUNREACH') {
                    this.emit('error', error);
                }
            }
        });
        // eslint-disable-next-line no-unused-vars
        this.private.connection.on('connecting', (_host) => {
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
        // eslint-disable-next-line no-unused-vars
        this.private.ssdp.on('advertise-alive', (headers, _rinfo) => {
            if (headers.USN.startsWith(`${this.private.tv.udn}::`) &&
                headers.NT === 'urn:lge-com:service:webos-second-screen:1') {
                if (this.private.connecting === false) {
                    this.private.connection.connect(this.private.tv.url);
                }
            }
        });
        // eslint-disable-next-line no-unused-vars
        this.private.ssdp.on('advertise-bye', (headers, _rinfo) => {
            if (headers.USN.startsWith(`${this.private.tv.udn}::`) &&
                headers.NT === 'urn:lge-com:service:webos-second-screen:1') {
                this.private.connection.disconnect();
            }
        });
    }

    command(command, callback) {
        const translation = LGTVMessage.translate(command);
        if (translation.powerOn === true) {
            // eslint-disable-next-line no-unused-vars
            wol.wake(this.tv.mac, (error, _response) => {
                if (error) {
                    callback(error, null);
                    return error;
                }
                if (translation.uri === null) {
                    callback(null, null);
                    return null;
                }
                return null;
            });
        }
        if (translation.uri !== null) {
            if (translation.payload === null) {
                this.private.connection.request(
                    translation.uri,
                    (error, response) => {
                        callback(error, response);
                        return error;
                    }
                );
            } else {
                this.private.connection.request(
                    translation.uri,
                    translation.payload,
                    (error, response) => {
                        callback(error, response);
                        return null;
                    }
                );
            }
        }
    }
}

module.exports = LGTVControl;
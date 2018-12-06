const tls = require('tls');
const crypto = require('crypto');
const certnames = require('certnames');
const {constants} = require('alexa-lg-webos-tv-core');
const httpPost = require('./http-post.js');

const handlers = {
    'HTTPHostnameSetIntent': function () {
        const intentObject = this.event.request.intent;
        if (this.event.request.dialogState === 'STARTED') {
            Reflect.deleteProperty(this.attributes, 'tmp');
            Reflect.deleteProperty(this.attributes, 'hostname');
            this.attributes.tmp = {};
            this.attributes.tmp.ipAddress = {};
            this.attributes.tmp.ipAddress.confirmationStatus = 'NONE';
            this.attributes.tmp.hostname = {};
            this.attributes.tmp.hostname.confirmationStatus = 'NONE';
            const updatedIntent = intentObject;
            this.emit(':delegate', updatedIntent);
        } else if (this.event.request.dialogState !== 'COMPLETED') {
            if (!intentObject.slots.IPAddressA.value) {
                const speechOutput = 'What\'s the first number of your I.P. v five address?';
                const updatedIntent = intentObject;
                this.emit(':elicitSlot', 'IPAddressA', speechOutput, updatedIntent);
            } else if (intentObject.slots.IPAddressA.value &&
                (intentObject.slots.IPAddressA.value < 0 || intentObject.slots.IPAddressA.value > 255)) {
                const speechOutput = 'I think I misheard you.' +
                    ' I.P. v four address numbers need to be betwen 0 and 255.' +
                    ' Could you tell me the first number again?';
                const updatedIntent = intentObject;
                updatedIntent.slots.IPAddressA.confirmationStatus = 'DENIED';
                this.emit(':elicitSlot', 'IPAddressA', speechOutput, updatedIntent);
            } else if (!intentObject.slots.IPAddressB.value) {
                const speechOutput = 'And the second?';
                const updatedIntent = intentObject;
                this.emit(':elicitSlot', 'IPAddressB', speechOutput, updatedIntent);
            } else if (intentObject.slots.IPAddressB.value &&
                (intentObject.slots.IPAddressB.value < 0 || intentObject.slots.IPAddressB.value > 255)) {
                const speechOutput = 'I think I misheard you.' +
                    ' I.P. v four address numbers need to be betwen 0 and 255.' +
                    ' Could you tell me the second number again?';
                const updatedIntent = intentObject;
                updatedIntent.slots.IPAddressB.confirmationStatus = 'DENIED';
                this.emit(':elicitSlot', 'IPAddressC', speechOutput, updatedIntent);
            } else if (!intentObject.slots.IPAddressC.value) {
                const speechOutput = 'And the third?';
                const updatedIntent = intentObject;
                this.emit(':elicitSlot', 'IPAddressC', speechOutput, updatedIntent);
            } else if (intentObject.slots.IPAddressC.value &&
                (intentObject.slots.IPAddressC.value < 0 || intentObject.slots.IPAddressC.value > 255)) {
                const speechOutput = 'I think I misheard you.' +
                    ' I.P. v four address numbers need to be betwen 0 and 255.' +
                    ' Could you tell me the third number again?';
                const updatedIntent = intentObject;
                updatedIntent.slots.IPAddressC.confirmationStatus = 'DENIED';
                this.emit(':elicitSlot', 'IPAddressC', speechOutput, updatedIntent);
            } else if (!intentObject.slots.IPAddressD.value) {
                const speechOutput = 'And the fourth?';
                const updatedIntent = intentObject;
                this.emit(':elicitSlot', 'IPAddressD', speechOutput, updatedIntent);
            } else if (intentObject.slots.IPAddressD.value &&
                (intentObject.slots.IPAddressD.value < 0 || intentObject.slots.IPAddressD.value > 255)) {
                const speechOutput = 'I think I misheard you.' +
                    ' I.P. v four address numbers need to be betwen 0 and 255.' +
                    ' Could you tell me the fourth number again?';
                const updatedIntent = intentObject;
                updatedIntent.slots.IPAddressD.confirmationStatus = 'DENIED';
                this.emit(':elicitSlot', 'IPAddressD', speechOutput, updatedIntent);
            } else if (
                intentObject.slots.IPAddressA.value &&
                intentObject.slots.IPAddressB.value &&
                intentObject.slots.IPAddressC.value &&
                intentObject.slots.IPAddressD.value
            ) {
                if (!this.attributes.tmp.ipAddress.value) {
                    this.attributes.tmp.ipAddress.value =
                        `${intentObject.slots.IPAddressA.value}.` +
                        `${intentObject.slots.IPAddressB.value}.` +
                        `${intentObject.slots.IPAddressC.value}.` +
                        `${intentObject.slots.IPAddressD.value}`;
                    const speechOutput = `Is your I.P address ${this.attributes.tmp.ipAddress.value}`;
                    this.emit(':confirmIntent', speechOutput);
                } else if (this.attributes.tmp.ipAddress.confirmationStatus === 'NONE' && intentObject.confirmationStatus === 'DENIED') {
                    Reflect.deleteProperty(this.attributes, 'tmp');
                    const speechOutput = 'I\'m sorry I didn\'t hear your address correctly.' +
                        ' Maybe we could try again.';
                    this.emit(':tell', speechOutput);
                } else if (this.attributes.tmp.ipAddress.confirmationStatus === 'NONE' && intentObject.confirmationStatus === 'CONFIRMED') {
                    this.attributes.tmp.ipAddress.confirmationStatus = 'CONFIRMED';
                    intentObject.confirmationStatus = 'NONE';
                    const ipAddress = this.attributes.tmp.ipAddress.value;
                    const sock = tls.connect(25392, ipAddress, {'rejectUnauthorized': false});
                    sock.on('secureConnect', () => {
                        const cert = sock.getPeerCertificate().raw;
                        sock.on('close', () => {
                            const hostnames = certnames.getCommonNames(cert);
                            this.attributes.tmp.hostnames = hostnames;
                            this.attributes.tmp.hostname.value = this.attributes.tmp.hostnames.shift();
                            const speechOutput = `Is your hostname ${this.attributes.tmp.hostname.value}`;
                            this.emit(':confirmIntent', speechOutput);
                        });
                        sock.end();
                    });
                } else if (this.attributes.tmp.hostname.confirmationStatus === 'NONE' && intentObject.confirmationStatus === 'DENIED') {
                    if (this.attributes.tmp.hostnames.length > 0) {
                        this.attributes.tmp.hostname.confirmationStatus = 'NONE';
                        intentObject.confirmationStatus = 'DENIED';
                        this.attributes.tmp.hostname.value = this.attributes.tmp.hostnames.shift();
                        const speechOutput = `Is your hostname ${this.attributes.tmp.hostname.value}`;
                        this.emit(':confirmIntent', speechOutput);
                    } else {
                        Reflect.deleteProperty(this.attributes, 'tmp');
                        const speechOutput = 'The T.L.S. certificate from the server at your I.P. address provides no more hostnames.';
                        this.emit(':tell', speechOutput);
                    }
                } else if (this.attributes.tmp.hostname.confirmationStatus === 'NONE' && intentObject.confirmationStatus === 'DENIED') {
                    this.attributes.hostname.confirmationStatus = 'DENIED';
                    this.emit(':delegate');
                } else if (this.attributes.tmp.hostname.confirmationStatus === 'NONE' && intentObject.confirmationStatus === 'CONFIRMED') {
                    this.attributes.hostname.confirmationStatus = 'CONFIRMED';
                    this.emit(':delegate');
                } else {
                    this.emit(':delegate');
                }
            } else {
                this.emit(':delegate');
            }
        } else if (this.event.request.dialogState === 'COMPLETED') {
            if (this.event.request.intent.confirmationStatus === 'DENIED') {
                this.attributes.hostname = this.attributes.tmp.hostname.value;
                Reflect.deleteProperty(this.attributes, 'tmp');
                this.emit(':saveState');
                this.emit(':tell', 'We failed.');
            } else if (intentObject.confirmationStatus === 'CONFIRMED') {
                this.attributes.hostname = this.attributes.tmp.hostname.value;
                Reflect.deleteProperty(this.attributes, 'tmp');
                this.emit(':saveState');
                this.emit(':tell', 'We succeeded.');
            }
        }
    },
    'HTTPPasswordSetIntent': function () {
        const password = crypto.randomBytes(64).toString('hex');
        if (!Reflect.has(this.attributes, 'http') || !Reflect.has(this.attributes.http, 'hostname')) {
            this.emit(':tell', 'You need to set your L.G. web O.S. T.V. gateway hostname before you can set its password.');
        }
        const options = {
            'hostname': this.attributes.http.hostname,
            'path': '/HTTP',
            'username': 'HTTP',
            'password': constants.password
        };
        const request = {
            'command': {
                'name': 'passwordSet',
                'password': password,
                'deviceId': this.event.context.System.device.deviceId
            }
        };
        httpPost.post(options, request, (error, response) => {
            if (error) {
                const outputSpeech = error.message;
                this.emit(':tell', outputSpeech);
            } else if (response && Reflect.has(response, 'error')) {
                const outputSpeech = response.error.message;
                this.emit(':tell', outputSpeech);
            } else {
                this.attributes.http.password = password;
                this.emit(':tell', 'Your password has been set.');
            }
        });
    },
    'LGTVBindHandler': function () {
        if (this.event.request.dialogState === 'STARTED') {
            Reflect.deleteProperty(this.attributes, 'tmp');
            this.attributes.tmp = {};
            this.attributes.tmp.udn = {};
            this.attributes.tmp.udn.confirmationStatus = 'NONE';
            if (!Reflect.has(this.attributes, 'tvmap')) {
                this.attributes.tvmap = [];
            }
            if (!Reflect.has(this.attributes, 'hostname')) {
                this.emit(':tell', 'You have not configured the hostname of your L.G. web O.S. T.V. gateway.');
            }
            if (!Reflect.has(this.attributes, 'password')) {
                this.emit(':tell', 'You have not configured the password of your L.G. web O.S. T.V. gateway.');
            }
            const options = {
                'hostname': this.attributes.hostname,
                'path': '/LGTV/MAP',
                'username': 'LGTV',
                'password': this.attributes.password
            };
            const request = {'command': {'name': 'udnsGet'}};
            httpPost.post(options, request, (error, response) => {
                if (error) {
                    const outputSpeech = error.message;
                    this.emit(':tell', outputSpeech);
                } else if (response && Reflect.has(response, 'error')) {
                    const outputSpeech = response.error.message;
                    this.emit(':tell', outputSpeech);
                } else {
                    if (!Reflect.has(response, 'udns')) {
                        const outputSpeech = 'I could not find an L.G. web O.S. T.V.';
                        this.emit(':tell', outputSpeech);
                    }
                    if (response.udns.length === 0) {
                        const outputSpeech = 'I could not find an L.G. web O.S. T.V.';
                        this.emit(':tell', outputSpeech);
                    }
                    let index = 0;
                    this.attributes.tmp.udns = [];
                    for (index = 0; index < response.udns.length; index += 1) {
                        this.attributes.tmp.udns.push(response.udns[index]);
                    }
                    this.event.request.intent.confirmationStatus = 'DENIED';
                    const updatedIntent = this.event.request.intent;
                    this.emit(':delegate', updatedIntent);
                }
            });
        } else if (this.event.request.dialogState === 'IN_PROGRESS') {
            if (this.attributes.tmp.udn.confirmationStatus === 'NONE' && this.event.request.intent.confirmationStatus === 'DENIED') {
                if (this.attributes.tmp.udns.length > 0) {
                    this.attributes.tmp.udn.confirmationStatus = 'NONE';
                    this.event.request.intent.confirmationStatus = 'DENIED';
                    this.attributes.tmp.udn.value = this.attributes.tmp.udns.shift();
                    const speechOutput = 'Did you see the message on your T.V. screen?';
                    this.emit(':confirmIntent', speechOutput);
                } else {
                    Reflect.deleteProperty(this.attributes, 'tmp');
                    const speechOutput = 'That was the last L.G. web O.S. T.V. I found.';
                    this.emit(':tell', speechOutput);
                }
            } else if (this.attributes.tmp.udn.confirmationStatus === 'NONE' && this.event.request.intent.confirmationStatus === 'DENIED') {
                this.attributes.udn.confirmationStatus = 'DENIED';
                this.emit(':delegate');
            } else if (this.attributes.tmp.udn.confirmationStatus === 'NONE' && this.event.request.intent.confirmationStatus === 'CONFIRMED') {
                this.attributes.udn.confirmationStatus = 'CONFIRMED';
                this.emit(':delegate');
            } else {
                this.emit(':delegate');
            }
        } else if (this.event.request.dialogState === 'COMPLETED') {
            if (this.event.request.intent.confirmationStatus === 'DENIED') {
                Reflect.deleteProperty(this.attributes.tvmap, this.event.context.System.device.deviceId);
                Reflect.deleteProperty(this.attributes, 'tmp');
                this.emit(':saveState');
                this.emit(':tell', 'We failed.');
            } else if (this.event.request.intent.confirmationStatus === 'CONFIRMED') {
                this.attributes.tvmap[this.event.context.System.device.deviceId] = this.attributes.tmp.udn.value;
                Reflect.deleteProperty(this.attributes, 'tmp');
                this.emit(':saveState');
                this.emit(':tell', 'We succeeded.');
            }
        }
    }
};

module.exports = {'handlers': handlers};
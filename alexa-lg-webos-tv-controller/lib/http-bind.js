const crypto = require('crypto');
const {constants} = require('alexa-lg-webos-tv-core');
const httpPost = require('./http-post.js');

const handlers = {
    'HTTPHostnameSetIntent': function () {
        if (this.event.request.dialogState === 'STARTED') {
            Reflect.deleteProperty(this.attributes, 'tmp');
            Reflect.deleteProperty(this.attributes, 'hostname');
            this.attributes.tmp = {};
            this.emit(':delegate');
        } else if (this.event.request.dialogState === 'IN_PROGRESS') {
            const ipAddressA = this.event.request.intent.slots.ipAddressA.value;
            const ipAddressB = this.event.request.intent.slots.ipAddressB.value;
            const ipAddressC = this.event.request.intent.slots.ipAddressC.value;
            const ipAddressD = this.event.request.intent.slots.ipAddressD.value;
            if (!ipAddressA) {
                this.emit(':delegate');
            } else if (ipAddressA && (ipAddressA < 0 || ipAddressA > 255)) {
                const speechOutput = 'I think I misheard you.' +
                    ' I.P. v four address numbers need to be betwen 0 and 255.' +
                    ' Could you tell me the first number again?';
                this.emit(':elicitSlot', 'ipAddressA', speechOutput);
            } else if (!ipAddressB) {
                this.emit(':delegate');
            } else if (ipAddressB && (ipAddressB < 0 || ipAddressB > 255)) {
                const speechOutput = 'I think I misheard you.' +
                    ' I.P. v four address numbers need to be betwen 0 and 255.' +
                    ' Could you tell me the second number again?';
                this.emit(':elicitSlot', 'ipAddressB', speechOutput);
            } else if (!ipAddressC) {
                this.emit(':delegate');
            } else if (ipAddressC && (ipAddressC < 0 || ipAddressC > 255)) {
                const speechOutput = 'I think I misheard you.' +
                    ' I.P. v four address numbers need to be betwen 0 and 255.' +
                    ' Could you tell me the third number again?';
                this.emit(':elicitSlot', 'ipAddressC', speechOutput);
            } else if (!ipAddressD) {
                this.emit(':delegate');
            } else if (ipAddressD && (ipAddressD < 0 || ipAddressD > 255)) {
                const speechOutput = 'I think I misheard you.' +
                    ' I.P. v four address numbers need to be betwen 0 and 255.' +
                    ' Could you tell me the fourth number again?';
                this.emit(':elicitSlot', 'ipAddressD', speechOutput);
            } else if (this.event.request.intent.confirmationStatus === 'NONE') {
                const options = {
                    'hostname': `${ipAddressA}.${ipAddressB}.${ipAddressC}.${ipAddressD}`,
                    'path': '/HTTP',
                    'username': 'HTTP',
                    'password': constants.password,
                    'rejectUnauthorized': false
                };
                const request = {'command': {'name': 'hostnameGet'}};
                httpPost.post(options, request, (error, response) => {
                    if (error) {
                        this.response.speak(error.message);
                        this.emit(':responseReady');
                    } else if (response && Reflect.has(response, 'error')) {
                        this.response.speak(response.error.message);
                        this.emit(':responseReady');
                    } else {
                        this.emit(':confirmIntent', `Is your hostname ${this.attributes.tmp.hostname}?`);
                    }
                });
            } else {
                this.emit(':delegate');
            }
        } else if (this.event.request.dialogState === 'COMPLETED') {
            if (this.event.request.intent.confirmationStatus === 'DENIED') {
                Reflect.deleteProperty(this.attributes, 'tmp');
                this.response.speak('We failed.');
                this.emit(':responseReady');
            } else if (this.event.request.intent.confirmationStatus === 'CONFIRMED') {
                this.attributes.hostname = this.attributes.tmp.hostname;
                Reflect.deleteProperty(this.attributes, 'tmp');
                this.response.speak('We succeeded.');
                this.emit(':responseReady');
            }
        }
    },
    'HTTPPasswordSetIntent': function () {
        Reflect.deleteProperty(this.attributes, 'password');
        this.emit(':saveState');
        const password = crypto.randomBytes(64).toString('hex');
        if (!Reflect.has(this.attributes, 'hostname')) {
            this.response.speak('You need to set your L.G. web O.S. T.V. bridge hostname before you can set its password.');
            this.emit(':responseReady');
        }
        const options = {
            'hostname': this.attributes.hostname,
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
                this.emit(':saveState');
                this.response.speak(error.message);
                this.emit(':responseReady');
            } else if (response && Reflect.has(response, 'error')) {
                this.emit(':saveState');
                this.response.speak(response.error.message);
                this.emit(':responseReady');
            } else {
                this.attributes.password = password;
                this.emit(':saveState');
                this.response.speak('Your password has been set.');
                this.emit(':responseReady');
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
                this.response.speak('You have not configured the hostname of your L.G. web O.S. T.V. bridge.');
                this.emit(':responseReady');
            }
            if (!Reflect.has(this.attributes, 'password')) {
                this.response.speak('You have not configured the password of your L.G. web O.S. T.V. bridge.');
                this.emit(':responseReady');
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
                    this.response.speak(error.message);
                    this.emit(':responseReady');
                } else if (response && Reflect.has(response, 'error')) {
                    this.response.speak(response.error.message);
                    this.emit(':responseReady');
                } else {
                    if (!Reflect.has(response, 'udns')) {
                        this.response.speak('I could not find an L.G. web O.S. T.V.');
                        this.emit(':responseReady');
                    }
                    if (response.udns.length === 0) {
                        this.response.speak('I could not find an L.G. web O.S. T.V.');
                        this.emit(':responseReady');
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
            if (
                this.attributes.tmp.udn.confirmationStatus === 'NONE' &&
                this.event.request.intent.confirmationStatus === 'DENIED'
            ) {
                if (this.attributes.tmp.udns.length > 0) {
                    this.attributes.tmp.udn.confirmationStatus = 'NONE';
                    this.event.request.intent.confirmationStatus = 'DENIED';
                    this.attributes.tmp.udn.value = this.attributes.tmp.udns.shift();
                    const speechOutput = 'Did you see the message on your T.V. screen?';
                    this.emit(':confirmIntent', speechOutput);
                } else {
                    Reflect.deleteProperty(this.attributes, 'tmp');
                    this.response.speak('That was the last L.G. web O.S. T.V. I found.');
                    this.emit(':responseReady');
                }
            } else if (
                this.attributes.tmp.udn.confirmationStatus === 'NONE' &&
                this.event.request.intent.confirmationStatus === 'DENIED'
            ) {
                this.attributes.tmp.udn.confirmationStatus = 'DENIED';
                this.emit(':delegate');
            } else if (
                this.attributes.tmp.udn.confirmationStatus === 'NONE' &&
                this.event.request.intent.confirmationStatus === 'CONFIRMED'
            ) {
                this.attributes.tmp.udn.confirmationStatus = 'CONFIRMED';
                this.emit(':delegate');
            } else {
                this.emit(':delegate');
            }
        } else if (this.event.request.dialogState === 'COMPLETED') {
            if (this.event.request.intent.confirmationStatus === 'DENIED') {
                Reflect.deleteProperty(this.attributes.tvmap, this.event.context.System.device.deviceId);
                Reflect.deleteProperty(this.attributes, 'tmp');
                this.response.speak('We failed.');
                this.emit(':responseReady');
            } else if (this.event.request.intent.confirmationStatus === 'CONFIRMED') {
                this.attributes.tvmap[this.event.context.System.device.deviceId] = this.attributes.tmp.udn.value;
                Reflect.deleteProperty(this.attributes, 'tmp');
                this.response.speak('We succeeded.');
                this.emit(':responseReady');
            }
        }
    }
};

module.exports = {'handlers': handlers};
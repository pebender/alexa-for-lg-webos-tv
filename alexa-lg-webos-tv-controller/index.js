const Alexa = require('alexa-sdk');
const httpBind = require('./lib/http-bind.js');
const httpPost = require('./lib/http-post.js');

const handlers = {
    'AMAZON.HelpIntent': function () {
        this.response.speak('I cannot help you yet.')
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        const command = {'name': 'powerOff'};
        runLGTVCommand(this.attributes, this.events, command, (error) => {
            if (error) {
                this.response.speak(error.message);
                this.emit(':responseReady');
            } else {
                this.response.speak('You asked me to turn off idiot box.');
                this.emit(':responseReady');
            }
        });
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak('idiot box cannot cancel a command once it has started.');
        this.emit(':responseReady');
    },
    'PowerOffIntent': function () {
        if (checkSlotStatusCode(this.event.request.intent.slots.PowerOff)) {
            const command = {'name': 'powerOff'};
            runLGTVCommand(this.attributes, this.events, command, (error) => {
                if (error) {
                    this.response.speak(error.message);
                    this.emit(':responseReady');
                } else {
                    this.response.speak('You asked me to turn off idiot box.');
                    this.emit(':responseReady');
                }
            });
        } else {
            this.response.speak('You asked me to do what (Off)?');
            this.emit(':responseReady');
        }
    },
    'PowerOnIntent': function () {
        if (checkSlotStatusCode(this.event.request.intent.slots.PowerOn)) {
            const command = {'name': 'powerOn'};
            runLGTVCommand(this.attributes, this.events, command, (error) => {
                if (error) {
                    this.response.speak(error.message);
                    this.emit(':responseReady');
                } else {
                    this.emit(':responseReady');
                    this.response.speak('You asked me to turn on idiot box.');
                }
            });
        } else {
            this.response.speak('You asked me to do what (On)?');
            this.emit(':responseReady');
        }
    },
    'VolumeDownIntent': function () {
        if (checkSlotStatusCode(this.event.request.intent.slots.VolumeDown)) {
            const command = {'name': 'volumeDown'};
            runLGTVCommand(this.attributes, this.events, command, (error) => {
                if (error) {
                    this.response.speak(error.message);
                    this.emit(':responseReady');
                } else {
                    this.response.speak('You asked me to decrease the volume of idiot box.');
                    this.emit(':responseReady');
                }
            });
        } else {
            this.response.speak('You asked me to do what (Volume Decrease)?');
            this.emit(':responseReady');
        }
    },
    'VolumeUpIntent': function () {
        if (checkSlotStatusCode(this.event.request.intent.slots.VolumeUp)) {
            const command = {'name': 'volumeUp'};
            runLGTVCommand(this.attributes, this.events, command, (error) => {
                if (error) {
                    this.response.speak(error.message);
                    this.emit(':responseReady');
                } else {
                    this.response.speak('You asked me to increase the volume of idiot box.');
                    this.emit(':responseReady');
                }
            });
        } else {
            this.response.speak('You asked me to do what (Volume Increase)?');
            this.emit(':responseReady');
        }
    },
    'VolumeSetIntent': function () {
        if (checkSlotStatusCode(this.event.request.intent.slots.VolumeSet)) {
            const volume = this.event.request.intent.slots.Volume.value;
            if (volume && volume >= 0) {
                const command = {
                    'name': 'volumeSet',
                    'value': volume
                };
                runLGTVCommand(this.attributes, this.events, command, (error) => {
                    if (error) {
                        this.response.speak(error.message);
                        this.emit(':responseReady');
                    } else {
                        this.response.speak(`You asked me to set the volume to ${volume}.`);
                        this.emit(':responseReady');
                    }
                });
            } else {
                this.response.speak('You asked me to set the volume to what?');
                this.emit(':responseReady');
            }
        } else {
            this.response.speak('You asked me to do what (Volume Set)?');
            this.emit(':responseReady');
        }
    },
    'VolumeMuteIntent': function () {
        if (checkSlotStatusCode(this.event.request.intent.slots.VolumeMute)) {
            const command = {
                'name': 'muteSet',
                'value': 'on'
            };
            runLGTVCommand(this.attributes, this.events, command, (error) => {
                if (error) {
                    this.response.speak(error.message);
                    this.emit(':responseReady');
                } else {
                    this.response.speak('You asked me to mute the volume of idiot box.');
                    this.emit(':responseReady');
                }
            });
        } else {
            this.response.speak('You asked me to do what (Volume Mute)?');
            this.emit(':responseReady');
        }
    },
    'VolumeUnmuteIntent': function () {
        if (checkSlotStatusCode(this.event.request.intent.slots.VolumeUnmute)) {
            const command = {
                'name': 'muteSet',
                'value': 'off'
            };
            runLGTVCommand(this.attributes, this.events, command, (error) => {
                if (error) {
                    this.response.speak(error.message);
                    this.emit(':responseReady');
                } else {
                    this.response.speak('You asked me to unmute the volume of idiot box.');
                    this.emit(':responseReady');
                }
            });
        } else {
            this.response.speak('You asked me to do what (Volume Unmute)?');
            this.emit(':responseReady');
        }
    },
    'InputSetIntent': function () {
        if (checkSlotStatusCode(this.event.request.intent.slots.InputSet) &&
            checkSlotStatusCode(this.event.request.intent.slots.Input)) {
            const inputName = getSlotName(this.event.request.intent.slots.Input);
            const inputId = getSlotId(this.event.request.intent.slots.Input);
            if (inputName && inputId) {
                if (inputId.startsWith('HDMI_')) {
                    const command = {
                        'name': 'inputSet',
                        'value': inputId
                    };
                    runLGTVCommand(this.attributes, this.events, command, (error) => {
                        if (error) {
                            this.response.speak(error.message);
                            this.emit(':responseReady');
                        } else {
                            this.response.speak(`You asked me to set the input to ${inputName}.`);
                            this.emit(':responseReady');
                        }
                    });
                } else if (inputId.startsWith('APP_')) {
                    const applicationId = inputId.substr(4);
                    const command = {
                        'name': 'applicationLaunch',
                        'value': applicationId
                    };
                    runLGTVCommand(this.attributes, this.events, command, (error) => {
                        if (error) {
                            this.response.speak(error.message);
                            this.emit(':responseReady');
                        } else {
                            this.response.speak(`You asked me to set the input to ${inputName}.`);
                            this.emit(':responseReady');
                        }
                    });
                } else {
                    this.response.speak('Oh dear. I should not be here. You asked me for a valid input type I know nothing about.');
                    this.emit(':responseReady');
                }
            } else {
                this.response.speak('You asked me to set the input to what?');
                this.emit(':responseReady');
            }
        } else {
            this.response.speak('You asked me to do what (Input Set)?');
            this.emit(':responseReady');
        }
    },
    'MessageShowIntent': function () {
        if (checkSlotStatusCode(this.event.request.intent.slots.MessageShow)) {
            const message = this.event.request.intent.slots.Message.value;
            const command = {
                'name': 'messageShow',
                'value': message
            };
            runLGTVCommand(this.attributes, this.events, command, (error) => {
                if (error) {
                    this.response.speak(error.message);
                    this.emit(':responseReady');
                } else {
                    this.response.speak(`You asked me to show the message ${message}.`);
                    this.emit(':responseReady');
                }
            });
        } else {
            this.response.speak('You asked me to do what (Volume Set)?');
            this.emit(':responseReady');
        }
    },
    'Unhandled': function () {
        if (this.handler.state === '') {
            this.response.speak('Now the idiot box really feels like an idiot.');
            this.emit(':responseReady');
        } else {
            this.handler.state = '';
            this.emit(this.event.request.intent.name);
            this.emit(':responseReady');
        }
    }
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = 'amzn1.ask.skill.933ee8a1-2ae8-4a35-88b8-57281e0648e2';
    alexa.dynamoDBTableName = 'LGwebOSTVController';
    alexa.registerHandlers(handlers, httpBind.handlers);
    alexa.execute();
};

function checkSlotStatusCode(slot) {
    const match =
        slot &&
        slot.resolutions &&
        slot.resolutions.resolutionsPerAuthority &&
        slot.resolutions.resolutionsPerAuthority.length > 0 &&
        slot.resolutions.resolutionsPerAuthority[0].status.code === 'ER_SUCCESS_MATCH';
    return match;
}

function getSlotName(slot) {
    const name =
        slot &&
        slot.resolutions &&
        slot.resolutions.resolutionsPerAuthority &&
        slot.resolutions.resolutionsPerAuthority.length > 0 &&
        slot.resolutions.resolutionsPerAuthority[0] &&
        slot.resolutions.resolutionsPerAuthority[0].values &&
        slot.resolutions.resolutionsPerAuthority[0].values.length > 0 &&
        slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    return name;
}

function getSlotId(slot) {
    const id =
        slot &&
        slot.resolutions &&
        slot.resolutions.resolutionsPerAuthority &&
        slot.resolutions.resolutionsPerAuthority.length > 0 &&
        slot.resolutions.resolutionsPerAuthority[0] &&
        slot.resolutions.resolutionsPerAuthority[0].values &&
        slot.resolutions.resolutionsPerAuthority[0].values.length > 0 &&
        slot.resolutions.resolutionsPerAuthority[0].values[0].value.id;
    return id;
}

function runLGTVCommand(attributes, event, command, callback) {
    if (!Reflect.has(attributes, 'hostname')) {
        const error = new Error('You have not configured the hostname of your L.G. web O.S. T.V. gateway.');
        callback(error);
        return;
    }
    if (!Reflect.has(attributes, 'password')) {
        const error = new Error('You have not configured the password of your L.G. web O.S. T.V. gateway.');
        callback(error);
        return;
    }
    if (!Reflect.has(attributes, 'tvmap') || !Reflect.has(attributes.tvmap, event.context.System.device.deviceId)) {
        const error = new Error('You have not configured this Alexa to control an L.G. web O.S. T.V..');
        callback(error);
        return;
    }
    const options = {
        'hostname': attributes.hostname,
        'path': '/LGTV/RUN',
        'username': 'LGTV',
        'password': attributes.password
    };
    const request = {
        'television': attributes[event.context.System.device.deviceId],
        'command': command
    };
    /* eslint-disable-next-line no-unused-vars */
    httpPost.post(options, request, (error, response) => callback(error));
}
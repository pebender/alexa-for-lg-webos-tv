import {AlexaHeader, AlexaEndpoint} from './alexa-base';

export type AlexaRequest = {
    directive: {
        header: AlexaHeader,
        endpoint?: AlexaEndpoint,
        [x: string]: any
    };
};
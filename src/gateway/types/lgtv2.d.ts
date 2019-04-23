/* eslint-disable no-dupe-class-members */

// Type definitions for lgtv2 1.4.1
// Definitions by: Paul Bender

import EventEmitter from "events";

/*~ This is the module template file for class modules.
 *~ You should rename it to index.d.ts and place it in a folder with the same name as the module.
 *~ For example, if you were writing a file for "super-greeter", this
 *~ file should be 'super-greeter/index.d.ts'
 */

// Note that ES6 modules cannot directly export class objects.
// This file should be imported using the CommonJS-style:
//   import x = require('[~THE MODULE~]');
//
// Alternatively, if --allowSyntheticDefaultImports or
// --esModuleInterop is turned on, this file can also be
// imported as a default import:
//   import x from '[~THE MODULE~]';
//
// Refer to the TypeScript documentation at
// https://www.typescriptlang.org/docs/handbook/modules.html#export--and-import--require
// to understand common workarounds for this limitation of ES6 modules.
// import LGTV = require("lgtv2");

/*~ If this module is a UMD module that exposes a global variable 'myClassLib' when
 *~ loaded outside a module loader environment, declare that global here.
 *~ Otherwise, delete this declaration.
 */

/*~ This declaration specifies that the class constructor function
 *~ is the exported object from the file
 */

/*~ Write your module's methods and properties in this class */
declare class LGTV extends EventEmitter {
    public constructor (opts?: {
        "url"?: string;
        "timeout"?: number;
        "reconnect"?: number;
        "clientKey"?: string;
        "keyFile"?: string;
        "saveKey"?: (key: string, callback: (error: Error) => void) => void;
    });

    public register(): void;
    public request(uri: string): void;
    public request(uri: string, callback: (error: Error, response: LGTV.Response) => void): void;
    public request(uri: string, payload: LGTV.RequestPayload, callback: (error: Error, response: LGTV.Response) => void): void;
    public subscribe(uri: string, callback: (error: Error, response: LGTV.Response) => void): void;
    public subscribe(uri: string, payload: LGTV.RequestPayload, callback: (error: Error, response: LGTV.Response) => void): void;
    public getSocket(url: string, callback?: (error: Error, response: LGTV.Response) => void): void;
    public connect(host: string): void;
    public disconnect(): void;

    public on(event: "close", listener: (error: Error) => void): this;
    public on(event: "connect", listener: () => void): this;
    public on(event: "connecting", listener: (host: string) => void): this;
    public on(event: "error", listener: (error: Error) => void): this;
    public on(event: "prompt", listener: () => void): this;

//    once(event: "close", listener: (error: Error) => void): this;
//    once(event: "connect", listener: () => void): this;
//    once(event: "connecting", listener: (host: string) => void): this;
//    once(event: "error", listener: (error: Error) => void): this;
//    once(event: "prompt", listener: () => void): this;
//
//    emit(event: "close", error: Error): boolean;
//    emit(event: "connect"): boolean;
//    emit(event: "connecting", host: string): boolean;
//    emit(event: "error", error: Error): boolean;
//    emit(event: "prompt"): boolean;
}

declare namespace LGTV {
    interface RequestPayload {
        [x: string]: boolean | number | string |
        {
            [x: string]: boolean | number | string;
        };
    }

    interface Request {
        uri: string;
        payload?: LGTV.RequestPayload;
    }

    export interface Response {
        "returnValue": boolean;
        [x: string]: boolean | number | string | object;
    }

    export interface ResponseVolume extends Response {
        "scenario": string;
        "volume": number;
        "muted": boolean;
        "volumeMax": number;
    }

    export interface ResponseForgroundAppInfo extends Response {
        "appId": string;
        "windowId": string;
        "processId": string;
    }

    export interface ResponseExternalInputListDevice extends Response {
        "id": string;
        "label": string;
        "port": number;
        "appId": string;
        "icon": string;
        "modified": boolean;
        "subList": {
            [x: string]: boolean | number | string;
        }[];
        "subCount": number;
        "connected": boolean;
        "favorite": boolean;
    }

    export interface ResponseExternalInputList extends Response {
        "devices": ResponseExternalInputListDevice[];
    }
}

export = LGTV;
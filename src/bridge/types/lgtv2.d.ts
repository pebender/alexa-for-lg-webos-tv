/* eslint-disable no-dupe-class-members */

// Type definitions for lgtv2 1.4.1
// Definitions by: Paul Bender

import { EventEmitter } from "node:events";

/* ~ This is the module template file for class modules.
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

/* ~ If this module is a UMD module that exposes a global variable 'myClassLib' when
 *~ loaded outside a module loader environment, declare that global here.
 *~ Otherwise, delete this declaration.
 */

/* ~ This declaration specifies that the class constructor function
 *~ is the exported object from the file
 */

/* ~ Write your module's methods and properties in this class */
declare class LGTV extends EventEmitter {
  public constructor(opts?: {
    url?: string;
    timeout?: number;
    reconnect?: number;
    clientKey?: string;
    keyFile?: string;
    saveKey?: (key: string, callback: (error: Error) => void) => void;
  });

  public clientKey: string;

  public register(): void;
  public request(
    uri: string,
    callback?: (error: Error | null, response?: LGTV.Response) => void,
  ): void;

  public request(
    uri: string,
    payload: LGTV.RequestPayload,
    callback: (error: Error | null, response?: LGTV.Response) => void,
  ): void;

  public subscribe(
    uri: string,
    callback: (error: Error | null, response?: LGTV.Response) => void,
  ): void;

  public subscribe(
    uri: string,
    payload: LGTV.RequestPayload,
    callback: (error: Error | null, response?: LGTV.Response) => void,
  ): void;

  public getSocket(
    url: string,
    callback?: (error: Error | null, response?: LGTV.Response) => void,
  ): void;

  public connect(host: string): void;
  public disconnect(): void;

  public on(
    event: "close" | "error",
    listener: (error: Error | null) => void,
  ): this;
  public on(event: "connect" | "prompt", listener: () => void): this;
  public on(event: "connecting", listener: (host: string) => void): this;

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
  export interface RequestPayload {
    [x: string]:
      | boolean
      | number
      | string
      | {
          [x: string]: boolean | number | string;
        };
  }

  export interface Request {
    uri: string;
    payload?: LGTV.RequestPayload;
  }

  /*
   * Response to:
   * "ssap://audio/setMute" {"muted": boolean}
   */
  export interface Response {
    returnValue: boolean;
    [x: string]: boolean | number | string | object | undefined;
  }

  /*
   * Response to:
   * "ssap://audio/getVolume"
   */
  export interface ResponseVolume extends Response {
    scenario: string;
    volume: number;
    muted: boolean;
    volumeMax: number;
  }

  /*
   * Response to:
   * "ssap://com.webos.applicationManager/getForegroundAppInfo"
   */
  export interface ResponseForegroundAppInfo extends Response {
    appId: string;
    windowId: string;
    processId: string;
  }

  /*
   * Response to:
   * "ssap://tv/getExternalInputList"
   */
  export interface ResponseExternalInputListDevice extends Response {
    id: string;
    label: string;
    port: number;
    appId: string;
    icon: string;
    modified: boolean;
    spdProductDescription?: string;
    spdVendorName?: string;
    spdSourceDeviceInfo?: string;
    lastUniqueId: number;
    subList: {
      [x: string]: boolean | number | string;
    }[];
    oneDepth?: boolean;
    subCount: number;
    connected: boolean;
    favorite: boolean;
  }
  export interface ResponseExternalInputList extends Response {
    devices: ResponseExternalInputListDevice[];
  }
}

export = LGTV;

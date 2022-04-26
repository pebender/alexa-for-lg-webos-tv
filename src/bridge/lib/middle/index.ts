import * as Common from "../../../common";
import { Authorization } from "./authorization";
import { Backend } from "../backend";
import { BaseClass } from "../base-class";
import * as SHS from "./smart-home-skill";
import { Configuration } from "../configuration";

export class Middle extends BaseClass {
  private readonly _authorization: Authorization;
  private readonly _backend: Backend;
  public constructor(configuration: Configuration, backend: Backend) {
    super();

    this._authorization = new Authorization(configuration);
    this._backend = backend;
  }

  public initialize(): Promise<void> {
    const that = this;

    async function initializeFunction(): Promise<void> {
      await that._authorization.initialize();
    }
    return this.initializeHandler(initializeFunction);
  }

  public async handler(
    alexaRequest: Common.SHS.Request
  ): Promise<Common.SHS.Response> {
    return await SHS.handler(alexaRequest, this._authorization, this._backend);
  }
}

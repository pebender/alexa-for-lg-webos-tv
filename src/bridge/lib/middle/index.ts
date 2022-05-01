import * as Common from "../../../common";
import { Authorization } from "./authorization";
import { Backend } from "../backend";
import * as SHS from "./smart-home-skill";
import { Configuration } from "../configuration";

export class Middle {
  private readonly _authorization: Authorization;
  private readonly _backend: Backend;
  private constructor(_authorization: Authorization, _backend: Backend) {
    this._authorization = _authorization;
    this._backend = _backend;
  }

  public static async build(configuration: Configuration, backend: Backend) {
    const _authorization = await Authorization.build(configuration);

    const middle = new Middle(_authorization, backend);

    return middle;
  }

  public async handler(
    alexaRequest: Common.SHS.Request
  ): Promise<Common.SHS.ResponseWrapper> {
    return await SHS.handler(alexaRequest, this._authorization, this._backend);
  }
}

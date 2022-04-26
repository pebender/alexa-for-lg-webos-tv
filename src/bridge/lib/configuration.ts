import * as fs from "fs/promises";
import { BaseClass } from "./base-class";
import * as Common from "../../common";

const persistPath = require("persist-path");

export class Configuration extends BaseClass {
  private _configuration: {
    hostname: string;
    authorizedEmails: string[];
  };

  public constructor() {
    super();

    this._configuration = {
      hostname: "",
      authorizedEmails: [],
    };
  }

  public initialize(): Promise<void> {
    const that = this;

    async function initializeFunction(): Promise<void> {
      const configurationDir = persistPath(
        Common.constants.application.name.safe
      );
      // Should check whether or not file exists and is readable.
      const configurationFile = `${configurationDir}/config.json`;
      const raw = await fs.readFile(configurationFile);
      const configuration = JSON.parse(raw as any);

      if (typeof configuration.hostname === "undefined") {
        const error = new Error(
          `configuration file '${configurationFile}' is missing 'hostname'.`
        );
        Common.Debug.debugErrorWithStack(error);
        throw error;
      }
      if (typeof configuration.authorizedEmails === "undefined") {
        const error = new Error(
          `configuration file '${configurationFile}' is missing 'authorizedEmails'.`
        );
        Common.Debug.debugErrorWithStack(error);
        throw error;
      }

      that._configuration = configuration;
    }

    return this.initializeHandler(initializeFunction);
  }

  public async hostname(): Promise<string> {
    return this._configuration.hostname;
  }

  public async authorizedEmails(): Promise<string[]> {
    return this._configuration.authorizedEmails;
  }
}

import * as fs from "fs/promises";
import * as Common from "../../common";

const persistPath = require("persist-path");

export class Configuration {
  private _configuration: {
    hostname: string;
    authorizedServicesAndUsers: { service: string; users: string[] }[];
  };

  private constructor(_configuration: {
    hostname: string;
    authorizedServicesAndUsers: { service: string; users: string[] }[];
  }) {
    this._configuration = _configuration;
  }

  public static async build() {
    const cfgDir = persistPath(Common.constants.application.name.safe);
    // Should check whether or not file exists and is readable.
    const cfgFile = `${cfgDir}/config.json`;
    const raw = await fs.readFile(cfgFile);
    const cfg = JSON.parse(raw as any);

    if (typeof cfg.hostname === "undefined") {
      const error = new Error(
        `configuration file '${cfgFile}' is missing 'hostname'.`,
      );
      Common.Debug.debugErrorWithStack(error);
      throw error;
    }
    if (typeof cfg.authorizedServicesAndUsers === "undefined") {
      const error = new Error(
        `configuration file '${cfgFile}' is missing 'authorizedUsers'.`,
      );
      Common.Debug.debugErrorWithStack(error);
      throw error;
    }

    const configuration = new Configuration(cfg);

    return configuration;
  }

  public async hostname(): Promise<string> {
    return this._configuration.hostname;
  }

  public async authorizedServicesAndUsers(): Promise<
    { service: string; users: string[] }[]
  > {
    return this._configuration.authorizedServicesAndUsers;
  }
}

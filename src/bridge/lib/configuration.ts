import * as fs from "fs/promises";
import persistPath from "persist-path";
import * as Common from "../../common";

export class Configuration {
  private _configuration: {
    authorizedUsers: { bridgeHostname: string; emails: string[] }[];
  };

  private constructor(_configuration: {
    authorizedUsers: { bridgeHostname: string; emails: string[] }[];
  }) {
    this._configuration = _configuration;
  }

  public static async build() {
    const cfgDir = persistPath(Common.constants.application.name.safe);
    // Should check whether or not file exists and is readable.
    const cfgFile = `${cfgDir}/config.json`;
    const raw = await fs.readFile(cfgFile);
    const cfg = JSON.parse(raw as any);

    if (typeof cfg.authorizedUsers === "undefined") {
      const error = new Error(
        `configuration file '${cfgFile}' is missing 'authorizedUsers'.`,
      );
      Common.Debug.debugErrorWithStack(error);
      throw error;
    }
    (
      cfg.authorizedUsers as { bridgeHostname?: string; emails?: string[] }[]
    ).forEach((authorizedUser, index) => {
      if (typeof authorizedUser.bridgeHostname === "undefined") {
        const error = new Error(
          `configuration file '${cfgFile}' is missing 'authorizedUsers[${index}].hostname'.`,
        );
        Common.Debug.debugErrorWithStack(error);
        throw error;
      }
      if (typeof authorizedUser.emails === "undefined") {
        const error = new Error(
          `configuration file '${cfgFile}' is missing 'authorizedUsers[${index}].emails'.`,
        );
        Common.Debug.debugErrorWithStack(error);
        throw error;
      }
    });

    const configuration = new Configuration(cfg);

    return configuration;
  }

  public async authorizedUsers(): Promise<
    { bridgeHostname: string; emails: string[] }[]
  > {
    return this._configuration.authorizedUsers;
  }
}

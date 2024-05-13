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
    const raw: string = await fs.readFile(cfgFile, { encoding: "utf8" });

    const cfg = JSON.parse(raw) as {
      authorizedUsers: { bridgeHostname: string; emails: string[] }[];
    };
    if (typeof cfg.authorizedUsers === "undefined") {
      const error = Common.Error.create(
        `configuration file '${cfgFile}' is missing 'authorizedUsers'.`,
      );
      Common.Debug.debugErrorWithStack(error);
      throw error;
    }
    cfg.authorizedUsers.forEach((authorizedUser, index) => {
      if (typeof authorizedUser.bridgeHostname === "undefined") {
        const error = Common.Error.create(
          `configuration file '${cfgFile}' is missing 'authorizedUsers[${index.toString()}].hostname'.`,
        );
        Common.Debug.debugErrorWithStack(error);
        throw error;
      }
      if (typeof authorizedUser.emails === "undefined") {
        const error = Common.Error.create(
          `configuration file '${cfgFile}' is missing 'authorizedUsers[${index.toString()}].emails'.`,
        );
        Common.Debug.debugErrorWithStack(error);
        throw error;
      }
    });

    const configuration = new Configuration(cfg);

    return configuration;
  }

  public authorizedUsers(): { bridgeHostname: string; emails: string[] }[] {
    return this._configuration.authorizedUsers;
  }
}

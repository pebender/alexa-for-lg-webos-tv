import * as fs from "fs/promises";
import persistPath from "persist-path";
import * as Common from "../../common";

export class Configuration {
  private readonly _configuration: {
    authorizedUsers: Array<{ bridgeHostname: string; emails: string[] }>;
  };

  private constructor(_configuration: {
    authorizedUsers: Array<{ bridgeHostname: string; emails: string[] }>;
  }) {
    this._configuration = _configuration;
  }

  public static async build(): Promise<Configuration> {
    const cfgDir = persistPath(Common.constants.application.name.safe);
    // Should check whether or not file exists and is readable.
    const cfgFile = `${cfgDir}/config.json`;
    const raw: string = await fs.readFile(cfgFile, { encoding: "utf8" });

    const cfg = JSON.parse(raw) as {
      authorizedUsers: Array<{ bridgeHostname: string; emails: string[] }>;
    };
    if (cfg.authorizedUsers === undefined) {
      const error = Common.Error.create({
        message: `configuration file '${cfgFile}' is missing 'authorizedUsers'.`,
      });
      Common.Debug.debugError(error);
      throw error;
    }
    for (const [index, authorizedUser] of cfg.authorizedUsers.entries()) {
      if (authorizedUser.bridgeHostname === undefined) {
        const error = Common.Error.create({
          message: `configuration file '${cfgFile}' is missing 'authorizedUsers[${index.toString()}].hostname'.`,
        });
        Common.Debug.debugError(error);
        throw error;
      }
      if (authorizedUser.emails === undefined) {
        const error = Common.Error.create({
          message: `configuration file '${cfgFile}' is missing 'authorizedUsers[${index.toString()}].emails'.`,
        });
        Common.Debug.debugError(error);
        throw error;
      }
    }

    const configuration = new Configuration(cfg);

    return configuration;
  }

  public authorizedUsers(): Array<{
    bridgeHostname: string;
    emails: string[];
  }> {
    return this._configuration.authorizedUsers;
  }
}

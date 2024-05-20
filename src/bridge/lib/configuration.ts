import * as fs from "node:fs/promises";
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
    const configurationDirectory = persistPath(
      Common.constants.application.name.safe,
    );
    // Should check whether or not file exists and is readable.
    const configurationFile = `${configurationDirectory}/config.json`;
    const configurationData: string = await fs.readFile(configurationFile, {
      encoding: "utf8",
    });

    const configurationJson = JSON.parse(configurationData) as {
      authorizedUsers: Array<{ bridgeHostname: string; emails: string[] }>;
    };
    if (configurationJson.authorizedUsers === undefined) {
      const error = new Common.Error.GeneralCommonError({
        message: `configuration file '${configurationFile}' is missing 'authorizedUsers'.`,
      });
      Common.Debug.debugError(error);
      throw error;
    }
    for (const [
      index,
      authorizedUser,
    ] of configurationJson.authorizedUsers.entries()) {
      if (authorizedUser.bridgeHostname === undefined) {
        const error = new Common.Error.GeneralCommonError({
          message: `configuration file '${configurationFile}' is missing 'authorizedUsers[${index.toString()}].hostname'.`,
        });
        Common.Debug.debugError(error);
        throw error;
      }
      if (authorizedUser.emails === undefined) {
        const error = new Common.Error.GeneralCommonError({
          message: `configuration file '${configurationFile}' is missing 'authorizedUsers[${index.toString()}].emails'.`,
        });
        Common.Debug.debugError(error);
        throw error;
      }
    }

    const configuration = new Configuration(configurationJson);

    return configuration;
  }

  public authorizedUsers(): Array<{
    bridgeHostname: string;
    emails: string[];
  }> {
    return this._configuration.authorizedUsers;
  }
}

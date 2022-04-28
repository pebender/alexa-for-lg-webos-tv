import * as fs from "fs/promises";
import * as Common from "../../common";

const persistPath = require("persist-path");

export class Configuration {
  private _configuration: {
    hostname: string;
    authorizedEmails: string[];
  };

  private constructor(_configuration: {
    hostname: string;
    authorizedEmails: string[];
  }) {
    this._configuration = _configuration;
  }

  public static async build() {
    const _configuration = {
      hostname: "",
      authorizedEmails: [],
    };

    const configuration = new Configuration(_configuration);
    await configuration.initialize();

    return configuration;
  }

  private async initialize(): Promise<void> {
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

    return await initializeFunction();
  }

  public async hostname(): Promise<string> {
    return this._configuration.hostname;
  }

  public async authorizedEmails(): Promise<string[]> {
    return this._configuration.authorizedEmails;
  }
}

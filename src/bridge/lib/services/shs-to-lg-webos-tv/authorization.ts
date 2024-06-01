import { DatabaseTable } from "../../database";
import * as Common from "../../../../common";

/* This is a type because DatabaseTable needs it to be a type. */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type AuthorizationRecord = {
  skillToken: string;
  userId: string;
};

export type AuthorizationField = "skillToken" | "userId";

export class Authorization {
  private readonly _configurationDirectory: string;
  private readonly _database: DatabaseTable<AuthorizationRecord>;
  private constructor(
    _configurationDirectory: string,
    _database: DatabaseTable<AuthorizationRecord>,
  ) {
    this._configurationDirectory = _configurationDirectory;
    this._database = _database;
  }

  public static async build(
    configurationDirectory: string,
  ): Promise<Authorization> {
    const _database = await DatabaseTable.build<AuthorizationRecord>(
      configurationDirectory,
      "user",
      ["skillToken", "userId"],
    );

    const authorization = new Authorization(configurationDirectory, _database);

    return authorization;
  }

  public async authorizeSkillToken(skillToken: string): Promise<boolean> {
    let record = await this._database.getRecord({ skillToken });
    if (record === null) {
      const profile = await Common.Profile.getUserProfile(skillToken);
      const userId = profile.userId;
      await this._database.updateOrInsertRecord(
        { userId },
        { skillToken, userId },
      );
      record = await this._database.getRecord({ skillToken });
    }
    if (record === null) {
      return false;
    }
    return skillToken === record.skillToken;
  }
}

import { DatabaseTable } from "../database";
import * as Common from "../../../common";
import type { Configuration } from "../configuration";

export interface AuthorizationRecord {
  skillToken: string;
  userId: string;
}

export type AuthorizationField = "skillToken" | "userId";

export class Authorization {
  private readonly _configuration: Configuration;
  private readonly _database: DatabaseTable<AuthorizationRecord>;
  private constructor(
    _configuration: Configuration,
    _database: DatabaseTable<AuthorizationRecord>,
  ) {
    this._configuration = _configuration;
    this._database = _database;
  }

  public static async build(
    configuration: Configuration,
  ): Promise<Authorization> {
    const _database = await DatabaseTable.build<AuthorizationRecord>(
      "middle",
      ["skillToken", "userId"],
      "skillToken",
    );

    const authorization = new Authorization(configuration, _database);

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

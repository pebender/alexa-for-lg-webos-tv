import { DatabaseTable } from "../../database";
import * as Common from "../../../../common";
import type { Configuration } from "../../configuration";

export class Authorization {
  private readonly _configuration: Configuration;
  private readonly _db: DatabaseTable;
  private constructor(_configuration: Configuration, _db: DatabaseTable) {
    this._configuration = _configuration;
    this._db = _db;
  }

  public static async build(
    configuration: Configuration,
  ): Promise<Authorization> {
    const _db = await DatabaseTable.build(
      "middle",
      ["skillToken", "userId"],
      "skillToken",
    );

    const authorization = new Authorization(configuration, _db);

    return authorization;
  }

  public async authorizeSkillToken(skillToken: string): Promise<boolean> {
    let record = await this._db.getRecord({ skillToken });
    if (record === null) {
      const userId = (await Common.Profile.getUserProfile(skillToken)).userId;
      await this._db.updateOrInsertRecord({ userId }, { skillToken, userId });
      record = await this._db.getRecord({ skillToken });
    }
    if (record === null) {
      return false;
    }
    return skillToken === record.skillToken;
  }
}

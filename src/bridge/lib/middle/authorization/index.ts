import { DatabaseRecord, DatabaseTable } from "../../database";
import * as Common from "../../../../common";
import { Configuration } from "../../configuration";
export class Authorization {
  private readonly _configuration: Configuration;
  private readonly _db: DatabaseTable;
  private constructor(_configuration: Configuration, _db: DatabaseTable) {
    this._configuration = _configuration;
    this._db = _db;
  }

  public static async build(configuration: Configuration) {
    const _db = await DatabaseTable.build(
      "middle",
      ["email", "skillToken"],
      "email"
    );

    const authorization = new Authorization(configuration, _db);

    return authorization;
  }

  public async authorize(skillToken: string): Promise<boolean> {
    const record = await this._db.getRecord({ skillToken });

    if (record === null) {
      const profile = await Common.Profile.SHS.getUserProfile(skillToken);
      const userId = profile.user_id;
      const email = profile.email;

      const authorizedEmails = await this._configuration.authorizedEmails();
      const found = authorizedEmails.find(
        (authorizedEmail) => authorizedEmail === email
      );
      if (typeof found === "undefined") {
        return false;
      }

      await this._db.updateOrInsertRecord(
        { email },
        { email, userId, skillToken }
      );
    } else {
      // CHeck if the email is still authorized and delete the record if it is
      // not.
      const authorizedEmails = await this._configuration.authorizedEmails();
      const found = authorizedEmails.find(
        (authorizedEmail) =>
          authorizedEmail === (record as DatabaseRecord).email
      );
      if (typeof found === "undefined") {
        await this._db.deleteRecord({ skillToken });
        return false;
      }
    }

    return true;
  }
}

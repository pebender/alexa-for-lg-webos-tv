import { BaseClass } from "../../base-class";
import { DatabaseRecord, DatabaseTable } from "../../database";
import * as Common from "../../../../common";
export class Authorization extends BaseClass {
  private readonly _authorizedEmails: string[];

  private readonly _db: DatabaseTable;
  public constructor(authorizedEmails: string[], middleDb: DatabaseTable) {
    super();

    this._authorizedEmails = authorizedEmails;
    this._db = middleDb;
  }

  public initialize(): Promise<void> {
    return this.initializeHandler(() => Promise.resolve());
  }

  public async authorize(skillToken: string): Promise<boolean> {
    let record: DatabaseRecord | null;
    try {
      record = await this._db.getRecord({ skillToken });
    } catch (error) {
      throw Common.SHS.Error.errorResponseFromError(null, error);
    }
    if (record === null) {
      const profile = await Common.Profile.SHS.getUserProfile(skillToken);
      const userId = profile.user_id;
      const email = profile.email;

      const found = this._authorizedEmails.find((element) => element === email);
      if (typeof found === "undefined") {
        return false;
      }
      try {
        await this._db.updateOrInsertRecord(
          { email },
          { email, userId, skillToken }
        );
      } catch (error) {
        throw Common.SHS.Error.errorResponseFromError(null, error);
      }
    }

    return true;
  }
}

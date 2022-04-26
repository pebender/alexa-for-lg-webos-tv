import { BaseClass } from "../../base-class";
import { DatabaseRecord, DatabaseTable } from "../../database";
import * as Common from "../../../../common";
import { Configuration } from "../../configuration";
export class Authorization extends BaseClass {
  private readonly _configuration: Configuration;
  private readonly _db: DatabaseTable;
  public constructor(configuration: Configuration) {
    super();

    this._configuration = configuration;
    this._db = new DatabaseTable("middle", ["email", "skillToken"], "email");
  }

  public initialize(): Promise<void> {
    const that = this;

    async function initializeFunction(): Promise<void> {
      await that._db.initialize();
    }
    return this.initializeHandler(initializeFunction);
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

      try {
        const authorizedEmails = await this._configuration.authorizedEmails();
        const found = authorizedEmails.find(
          (authorizedEmail) => authorizedEmail === email
        );
        if (typeof found === "undefined") {
          return false;
        }
      } catch (error) {
        throw Common.SHS.Error.errorResponseFromError(null, error);
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

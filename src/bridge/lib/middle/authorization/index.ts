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
      ["skillToken", "email"],
      "skillToken",
    );

    const authorization = new Authorization(configuration, _db);

    return authorization;
  }

  public async authorize(
    authorizedEmail: string,
    skillToken: string,
  ): Promise<boolean> {
    const record = await this._db.getRecord({ skillToken });
    if (record === null) {
      const profile = await Common.Profile.SHS.getUserProfile(skillToken);
      const userId = profile.user_id;
      const email = profile.email;

      if (email !== authorizedEmail) {
        return false;
      }

      const authorizedServicesAndUsers =
        await this._configuration.authorizedServicesAndUsers();
      const authorizedService = authorizedServicesAndUsers.find(
        (authorizedService) =>
          Common.constants.bridge.path.service === authorizedService.service,
      );
      if (typeof authorizedService === "undefined") {
        return false;
      }
      const authorizedUsers = authorizedService.users;
      const authorizedUser = authorizedUsers.find(
        (authorizedUser) => email === authorizedUser,
      );
      if (typeof authorizedUser === "undefined") {
        return false;
      }

      await this._db.updateOrInsertRecord(
        { email },
        { skillToken, email, userId },
      );
    } else {
      const email = (record as DatabaseRecord).email;

      if (email !== authorizedEmail) {
        return false;
      }

      // CHeck if the email is still authorized and delete the record if it is
      // not.
      const authorizedServicesAndUsers =
        await this._configuration.authorizedServicesAndUsers();
      const authorizedService = authorizedServicesAndUsers.find(
        (authorizedService) =>
          Common.constants.bridge.path.service === authorizedService.service,
      );
      if (typeof authorizedService === "undefined") {
        await this._db.deleteRecord({ skillToken });
        return false;
      }
      const authorizedUsers = authorizedService.users;
      const authorizedUser = authorizedUsers.find(
        (authorizedUser) => email === authorizedUser,
      );
      if (typeof authorizedUser === "undefined") {
        await this._db.deleteRecord({ skillToken });
        return false;
      }
    }

    return true;
  }
}

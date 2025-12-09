import * as fs from "node:fs/promises";
import * as Common from "@backinthirty/alexa-for-lg-webos-tv-common";

export class UserAuth {
  private readonly _authorizedUsers: Record<string, string[]>;

  private constructor(_authorizedUsers: Record<string, string[]>) {
    this._authorizedUsers = _authorizedUsers;
  }

  public static async build(configurationDirectory: string): Promise<UserAuth> {
    // Should check whether or not file exists and is readable.
    const authorizedUsersFile = `${configurationDirectory}/authorized-users.json`;
    const authorizedUsersData: string = await fs.readFile(authorizedUsersFile, {
      encoding: "utf8",
    });

    // Should check the schema.
    const _authorizedUsers = JSON.parse(authorizedUsersData) as Record<
      string,
      string[]
    >;

    return new UserAuth(_authorizedUsers);
  }

  public authorizeUser(
    bridgeHostname: string | null,
    email: string | null,
  ): boolean {
    Common.Debug.debug("UserAuth.authorizeUser");
    Common.Debug.debugJSON({ bridgeHostname, email });
    if (bridgeHostname === null) {
      return false;
    }
    if (email === null) {
      return false;
    }

    const authorizedEmails: string[] = this._authorizedUsers[bridgeHostname];
    if (authorizedEmails === undefined) {
      Common.Debug.debug(`bridgeHostname="${bridgeHostname}" not found`);
      return false;
    }
    const authorizedEmail = authorizedEmails.find(
      (authorizedEmail) => email === authorizedEmail,
    );
    if (authorizedEmail === undefined) {
      Common.Debug.debug(
        `email="${email}" in bridgeHostname="${bridgeHostname}" not found`,
      );
      return false;
    }
    return true;
  }
}

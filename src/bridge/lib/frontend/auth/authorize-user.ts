import * as Common from "../../../../common";
import type { Configuration } from "../../configuration";

export function authorizeUser(
  configuration: Configuration,
  bridgeHostname: string | null,
  email: string | null,
): boolean {
  Common.Debug.debug("authorizeUser");
  Common.Debug.debugJSON({ bridgeHostname, email });
  if (bridgeHostname === null) {
    return false;
  }
  if (email === null) {
    return false;
  }

  const authorizedBridgeHostnamesAndEmails: Array<{
    bridgeHostname: string;
    emails: string[];
  }> = configuration.authorizedUsers();
  const authorizedBridgeHostnameAndEmails:
    | { bridgeHostname: string; emails: string[] }
    | undefined = authorizedBridgeHostnamesAndEmails.find(
    (authorizedBridgeHostnameAndEmails) =>
      bridgeHostname === authorizedBridgeHostnameAndEmails.bridgeHostname,
  );
  if (authorizedBridgeHostnameAndEmails === undefined) {
    Common.Debug.debug(`bridgeHostname="${bridgeHostname}" not found`);
    return false;
  }
  const authorizedEmails: string[] = authorizedBridgeHostnameAndEmails.emails;
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

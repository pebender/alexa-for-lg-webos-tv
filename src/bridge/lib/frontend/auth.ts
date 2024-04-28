import { Configuration } from "../configuration";

export type AuthorizationHandler = (
  configuration: Configuration,
  service: string | null,
  user: string | null,
) => Promise<boolean>;

export async function authorizeServiceAndUser(
  configuration: Configuration,
  service: string | null,
  user: string | null,
): Promise<boolean> {
  if (service === null) {
    return false;
  }
  if (user === null) {
    return false;
  }

  const authorizedServicesAndUsers =
    await configuration.authorizedServicesAndUsers();
  const authorizedService = authorizedServicesAndUsers.find(
    (authorizedService) => service === authorizedService.service,
  );
  if (typeof authorizedService === "undefined") {
    return false;
  }
  const authorizedUsers = authorizedService.users;
  const authorizedUser = authorizedUsers.find(
    (authorizedUser) => user === authorizedUser,
  );
  if (typeof authorizedUser === "undefined") {
    return false;
  }
  return true;
}

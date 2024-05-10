import * as HTTPSRequest from "./https-request";
import * as CommonError from "./error";

export type Profile = {
  user_id: string;
  email: string;
};

export async function getUserProfile(accessToken: string): Promise<Profile> {
  const requestOptions: HTTPSRequest.RequestOptions = {
    hostname: "api.amazon.com",
    port: 443,
    path: "/user/profile",
    method: "GET",
    headers: {},
  };
  let response;
  try {
    response = await HTTPSRequest.request(requestOptions, accessToken);
  } catch (cause: any) {
    const general = (cause as CommonError.AlexaForLGwebOSTVError).general;
    const specific = (cause as CommonError.AlexaForLGwebOSTVError).specific;
    switch (general) {
      case "http":
        switch (specific) {
          case "BAD_REQUEST":
            throw CommonError.create(
              "there was an authentication error while retrieving your profile",
              {
                general: "authorization",
                specific: "invalid_token",
                cause,
              },
            );
          case "UNAUTHORIZED":
            throw CommonError.create(
              "there was an authorization error while retrieving your profile",
              {
                general: "authorization",
                specific: "invalid_scope",
                cause,
              },
            );
          default:
            throw cause;
        }
      default:
        throw cause;
    }
  }

  if (typeof (response as Profile).user_id === "undefined") {
    throw CommonError.create("there was no 'user_id' field in your profile", {
      general: "authorization",
      specific: "missing_user_id",
    });
  }
  if (typeof (response as Profile).email === "undefined") {
    throw CommonError.create("there was no 'email' field in your profile", {
      general: "authorization",
      specific: "missing_email",
    });
  }

  return response as { user_id: string; email: string; [x: string]: string };
}

export async function getUserId(accessToken: string): Promise<string> {
  const userProfile = await getUserProfile(accessToken);
  return userProfile.user_id;
}

export async function getUserEmail(accessToken: string): Promise<string> {
  const userProfile = await getUserProfile(accessToken);
  return userProfile.email;
}

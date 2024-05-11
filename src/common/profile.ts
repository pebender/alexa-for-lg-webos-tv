import * as HTTPSRequest from "./https-request";
import * as CommonError from "./error";

export type UserProfile = {
  /** The user_id from the user's linked {@link https://developer.amazon.com/apps-and-games/login-with-amazon | Login with Amazon} account profile. */
  userId: string;
  /** The email from the user's linked {@link https://developer.amazon.com/apps-and-games/login-with-amazon | Login with Amazon} account profile. */
  email: string;
};

/**
 *
 * This function retrieves the user profile specified by accessToken from the
 * {@link https://developer.amazon.com/apps-and-games/login-with-amazon | Login with Amazon}.
 * If successful, it return the {@link UserProfile}. Otherwise, it throws a
 * {@link CommonError.CommonError} with
 * {@link CommonError.CommonErrorOptions.general | general}="authorization" for
 * any authorization related failures and
 * {@link CommonError.CommonErrorOptions.general | general}="http" for any
 * others.
 *
 * @param accessToken - access token from a skill message.
 * @returns - the profile returned by the
 * {@link https://developer.amazon.com/apps-and-games/login-with-amazon | Login with Amazon}
 * profile server in response to accessToken.
 *
 * @throws - a {@link CommonError.CommonError} with
 * {@link CommonError.CommonErrorOptions.general | general}="authorization" for
 * any authorization related failures and
 * {@link CommonError.CommonErrorOptions.general | general}="http" for any
 * others.
 */
export async function getUserProfile(
  accessToken: string,
): Promise<UserProfile> {
  const requestOptions: HTTPSRequest.RequestOptions = {
    hostname: "api.amazon.com",
    port: 443,
    path: "/user/profile",
    headers: {},
  };
  let response;
  try {
    response = await HTTPSRequest.request(requestOptions, accessToken);
  } catch (cause: any) {
    const general = (cause as CommonError.CommonError).general;
    const specific = (cause as CommonError.CommonError).specific;
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
    throw cause;
  }

  if (typeof (response as any).user_id === "undefined") {
    throw CommonError.create("there was no 'user_id' field in your profile", {
      general: "authorization",
      specific: "missing_user_id",
    });
  }
  if (typeof (response as any).email === "undefined") {
    throw CommonError.create("there was no 'email' field in your profile", {
      general: "authorization",
      specific: "missing_email",
    });
  }
  const userProfile: UserProfile = {
    userId: (response as any).user_id,
    email: (response as any).email,
  };
  return userProfile;
}

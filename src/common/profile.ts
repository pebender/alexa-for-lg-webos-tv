import * as HTTPSRequest from "./https-request";
import * as CommonError from "./error";

export interface UserProfile {
  /** The user_id from the user's linked {@link https://developer.amazon.com/apps-and-games/login-with-amazon | Login with Amazon} account profile. */
  userId: string;
  /** The email from the user's linked {@link https://developer.amazon.com/apps-and-games/login-with-amazon | Login with Amazon} account profile. */
  email: string;
}

/**
 *
 * This function retrieves the user profile specified by accessToken from the
 * {@link https://developer.amazon.com/apps-and-games/login-with-amazon | Login with Amazon}.
 * If successful, it return the {@link UserProfile}. Otherwise, it throws a
 * {@link CommonError.AuthorizationCommonError | AuthorizationCommonError} for
 * any authorization failures, or a
 * {@link CommonError.HttpCommonError | HttpCommonError} for any other errors.
 *
 * @param accessToken - access token from a skill message.
 * @returns - the profile returned by the
 * {@link https://developer.amazon.com/apps-and-games/login-with-amazon | Login with Amazon}
 * profile server in response to accessToken.
 *
 * @throws - a
 * {@link CommonError.AuthorizationCommonError | AuthorizationCommonError} for
 * any authorization failures, or a
 * {@link CommonError.HttpCommonError | HttpCommonError} for any other errors.
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
  let response: {
    user_id: unknown;
    email: unknown;
    [key: string]: unknown;
  };
  try {
    response = (await HTTPSRequest.request(requestOptions, accessToken)) as {
      user_id: unknown;
      email: unknown;
      [key: string]: unknown;
    };
  } catch (error) {
    if (error instanceof CommonError.HttpCommonError) {
      const code = error.code;
      switch (code) {
        case "badRequest": {
          throw new CommonError.AuthorizationCommonError({
            code: "userProfileInvalidToken",
            message:
              "there was an authentication error while retrieving your profile",
            cause: error,
          });
        }
        case "unauthorized": {
          throw new CommonError.AuthorizationCommonError({
            code: "userProfileInvalidScope",
            message:
              "there was an authorization error while retrieving your profile",
            cause: error,
          });
        }
        default: {
          throw error;
        }
      }
    }
    throw error;
  }

  if (typeof response.user_id !== "string") {
    throw new CommonError.AuthorizationCommonError({
      code: "userProfileUserIdNotFound",
      message: "there was no 'user_id' field in your profile",
    });
  }
  if (typeof response.email !== "string") {
    throw new CommonError.AuthorizationCommonError({
      code: "userProfileEmailNotFound",
      message: "there was no 'email' field in your profile",
    });
  }
  const userProfile: UserProfile = {
    userId: response.user_id,
    email: response.email,
  };
  return userProfile;
}

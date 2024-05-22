import * as CommonError from "./error";

export interface UserProfile {
  /** The user_id from the user's linked {@link https://developer.amazon.com/apps-and-games/login-with-amazon | Login with Amazon} account profile. */
  userId: string;
  /** The email from the user's linked {@link https://developer.amazon.com/apps-and-games/login-with-amazon | Login with Amazon} account profile. */
  email: string;
}

export type UserProfileCommonErrorCode =
  | "httpError"
  | "httpResponseInvalidBodyMissing"
  | "httpResponseInvalidBodyParseError"
  | "httpResponseInvalidContentTypeInvalid"
  | "httpResponseInvalidStatusCodeMissing";

export class UserProfileCommonError extends CommonError.CommonError {
  public readonly code: UserProfileCommonErrorCode;

  constructor(options: {
    code: UserProfileCommonErrorCode;
    message?: string;
    cause?: unknown;
  }) {
    super(options);
    this.name = "UserProfileCommonError";
    this.code = options.code;
  }
}

/**
 *
 * This function retrieves the user profile specified by accessToken from the
 * {@link https://developer.amazon.com/apps-and-games/login-with-amazon | Login with Amazon}.
 * If successful, it return the {@link UserProfile}. Otherwise, it throws a
 * {@link CommonError.AuthorizationCommonError | AuthorizationCommonError} for
 * any authorization failures, or a
 * {@link ProfileCommonError} for any other errors.
 *
 * @param accessToken - access token from a skill message.
 * @returns - the profile returned by the
 * {@link https://developer.amazon.com/apps-and-games/login-with-amazon | Login with Amazon}
 * profile server in response to accessToken.
 *
 * @throws - a
 * {@link CommonError.AuthorizationCommonError | AuthorizationCommonError} for
 * any authorization failures, or a
 * {@link ProfileCommonError} for any other errors.
 */
export async function getUserProfile(
  accessToken: string,
): Promise<UserProfile> {
  const url = "https://api.amazon.com/user/profile";
  const options = {
    headers: {
      authorization: `Bearer ${accessToken}`,
      accept: "application/json",
      "accept-language": "en-US",
    },
  };
  let response: Response | undefined;

  function createUserProfileError(
    code: UserProfileCommonErrorCode,
    cause?: unknown,
  ): UserProfileCommonError {
    return new UserProfileCommonError({
      code,
      cause,
    });
  }

  try {
    response = await fetch(url, options);
  } catch (error) {
    throw createUserProfileError("httpError", error);
  }

  let responseBody: object | undefined;

  /* Verify body's MIME type */
  let mimeType: string | undefined;
  const contentType: string | null = response.headers.get("content-type");
  if (contentType !== null) {
    mimeType = contentType
      .split(/\s*;\s*/)[0]
      .trim()
      .toLowerCase();
  }
  if (contentType !== null && mimeType !== "application/json") {
    throw createUserProfileError("httpResponseInvalidContentTypeInvalid");
  }

  /* If the body is JSON, then deserialize it */
  if (mimeType === "application/json") {
    let responseBodyUnknown: unknown;
    try {
      responseBodyUnknown = await response.json();
    } catch (error) {
      throw createUserProfileError("httpResponseInvalidBodyParseError", error);
    }
    if (
      typeof responseBodyUnknown === "object" &&
      responseBodyUnknown !== null
    ) {
      responseBody = responseBodyUnknown;
    }
  }

  /* The response was not ok. */
  if (!response.ok) {
    /* The response may contain an additional error code in the body */
    const responseBodyErrorCode =
      responseBody !== undefined &&
      "error" in responseBody &&
      typeof responseBody.error === "string"
        ? responseBody.error
        : undefined;
    const statusCode: number = response.status;
    if (statusCode === undefined) {
      throw createUserProfileError("httpResponseInvalidStatusCodeMissing");
    }
    switch (statusCode) {
      case 400: {
        if (responseBodyErrorCode === "invalid_request") {
          throw createUserProfileError("httpError");
        }
        if (responseBodyErrorCode === "invalid_token") {
          throw new CommonError.AuthorizationCommonError({
            code: "userProfileInvalidToken",
            message:
              "there was an authentication error while retrieving your profile",
          });
        }
        throw createUserProfileError("httpError");
      }
      case 401: {
        if (responseBodyErrorCode === "insufficient_scope") {
          throw new CommonError.AuthorizationCommonError({
            code: "userProfileInsufficientScope",
            message:
              "there was an authentication error while retrieving your profile",
          });
        }
        throw new CommonError.AuthorizationCommonError({
          code: "userProfileError",
          message:
            "there was an authentication error while retrieving your profile",
        });
      }
      case 500: {
        throw createUserProfileError("httpError");
      }
      default: {
        throw createUserProfileError("httpError");
      }
    }
  }

  if (responseBody === undefined) {
    throw createUserProfileError("httpResponseInvalidBodyMissing");
  }
  if (
    !("user_id" in responseBody) ||
    typeof responseBody.user_id !== "string"
  ) {
    throw new CommonError.AuthorizationCommonError({
      code: "userProfileUserIdNotFound",
      message: "there was no 'user_id' field in your profile",
    });
  }
  if (!("email" in responseBody) || typeof responseBody.email !== "string") {
    throw new CommonError.AuthorizationCommonError({
      code: "userProfileEmailNotFound",
      message: "there was no 'email' field in your profile",
    });
  }
  return {
    userId: responseBody.user_id,
    email: responseBody.email,
  };
}

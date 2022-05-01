import * as HTTPSRequest from "../https-request";

const responseErrorMessages = {
  CONNECTION_INTERRUPTED:
    "Sorry. I could not retrieve your profile. The connection to the server was interrupted.",
  STATUS_CODE_MISSING:
    "Sorry, I could not retrieve your profile. The response from the server was invalid.",
  INVALID_AUTHORIZATION_CREDENTIAL:
    "Sorry, I could not retrieve your profile. The server did not recognize the user",
  INTERNAL_ERROR: "Sorry, I could not retrieve your profile.",
  CONTENT_TYPE_MISSING:
    "Sorry, I could not retrieve your profile. The response from the server was invalid.",
  CONTENT_TYPE_INCORRECT:
    "Sorry, I could not retrieve your profile. The response from the server was invalid.",
  BODY_MISSING:
    "Sorry, I could not retrieve your profile. The response from the server was invalid.",
  BODY_INVALID_FORMAT:
    "Sorry, I could not retrieve your profile. The response from the server was invalid.",
  UNKNOWN_ERROR: "Sorry, I could not retrieve your profile.",
};

export async function getUserProfile(
  bearerToken: string
): Promise<{ user_id: string; email: string; [x: string]: string }> {
  const requestOptions: HTTPSRequest.RequestOptions = {
    hostname: "api.amazon.com",
    port: 443,
    path: "/user/profile",
    method: "GET",
    headers: {},
  };
  let response;
  try {
    response = await HTTPSRequest.request(requestOptions, bearerToken);
  } catch (err) {
    const requestError = err as HTTPSRequest.ResponseError;
    const error = new Error("Sorry. I could not retrieve your profile.");
    error.name = requestError.name;
    if (typeof responseErrorMessages[requestError.name] === "string") {
      error.message = responseErrorMessages[requestError.name];
    }
    if (typeof requestError.error?.stack !== "undefined") {
      error.stack = requestError.error.stack;
    } else if (typeof requestError.stack !== "undefined") {
      error.stack = requestError.stack;
    } else {
      Error.captureStackTrace(error);
    }
    throw error;
  }

  if (typeof response.user_id === "undefined") {
    const error = new Error("Sorry. I could not retrieve your profile.");
    error.name = "INTERNAL_ERROR";
    Error.captureStackTrace(error);
    throw error;
  }
  if (typeof response.email === "undefined") {
    const error = new Error("Sorry. I could not retrieve your profile.");
    error.name = "INTERNAL_ERROR";
    Error.captureStackTrace(error);
    throw error;
  }

  return response as { user_id: string; email: string; [x: string]: string };
}

export async function getUserEmail(bearerToken: string): Promise<string> {
  const userProfile = await getUserProfile(bearerToken);
  return userProfile.email;
}

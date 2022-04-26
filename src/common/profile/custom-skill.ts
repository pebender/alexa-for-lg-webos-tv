import { URL } from "url";
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

export async function getUserEmail(
  apiEndpoint: string,
  apiAccessToken: string
): Promise<string> {
  const url = new URL(apiEndpoint);
  const hostname = url.hostname;
  const port = url.port ? Number(url.port) : 443;
  const requestOptions: HTTPSRequest.RequestOptions = {
    hostname,
    port,
    path: "/v2/accounts/~current/settings/Profile.email",
    method: "GET",
    headers: {},
  };
  let response;
  try {
    response = await HTTPSRequest.request(requestOptions, apiAccessToken);
  } catch (error) {
    const requestError = error as HTTPSRequest.ResponseError;
    if (typeof responseErrorMessages[requestError.name] === "string") {
      throw new Error(responseErrorMessages[requestError.name]);
    } else {
      throw new Error("Sorry. I could not retrieve your profile.");
    }
  }
  return response as string;
}

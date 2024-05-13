[**alexa-for-lg-webos-tv**](../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/https-request](../README.md) / request

# Function: request()

> **request**(`requestOptions`, `bearerToken`, `requestBody`?): `Promise`\<`object`\>

This function makes the HTTPS request specified by requestOptions.
The HTTPS request authenticates itself to the receiver by including
bearerToken as the bearer token in the HTTP authorization header. If
requestBody is provided, then the request is made using the HTTP
request method "POST" and includes requestBody as "application/json".
Otherwise, the request is made using the HTTP request method "GET". If the
request is successful, this function returns the JSON formatted response
received. Otherwise, this function throws a [CommonError.CommonError](../../error/classes/CommonError.md).

## Parameters

• **requestOptions**: [`RequestOptions`](../interfaces/RequestOptions.md)

basic HTTP options.

• **bearerToken**: `string`

the bearer token for authorizing the request with the
receiver.

• **requestBody?**: `object`

a JSON object containing the request message to be sent.

## Returns

`Promise`\<`object`\>

a JSON object containing the response body.

## Throws

a [CommonError.CommonError](../../error/classes/CommonError.md) with general="http" and specific from
ResponseErrorNames.

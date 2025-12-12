[**Documentation**](../../../../../../README.md)

***

[Documentation](../../../../../../README.md) / [@backinthirty/alexa-for-lg-webos-tv-skill](../../../../README.md) / [lib/link/request](../README.md) / request

# Function: request()

> **request**(`requestOptions`, `bearerToken`, `requestBody?`): `Promise`\<`object`\>

This function makes the HTTPS request specified by `requestOptions`. The
HTTPS request authenticates itself to the receiver by including `bearerToken`
as the bearer token in the HTTP authorization header. If `requestBody` is
provided, then the request is made using the HTTP request method "POST" and
includes requestBody as "application/json". Otherwise, the request is made
using the HTTP request method "GET". If the request is successful, this
function returns the JSON formatted response received. Otherwise, this
function throws a [HttpCommonError](../../http-common-error/classes/HttpCommonError.md).

## Parameters

### requestOptions

[`RequestOptions`](../interfaces/RequestOptions.md)

basic HTTP options.

### bearerToken

`string`

the bearer token for authorizing the request with the
receiver.

### requestBody?

`object`

a JSON object containing the request message to be sent.

## Returns

`Promise`\<`object`\>

a JSON object containing the response body.

## Throws

a [HttpCommonError](../../http-common-error/classes/HttpCommonError.md) with codes from
[HttpCommonErrorCode](../../http-common-error/type-aliases/HttpCommonErrorCode.md).

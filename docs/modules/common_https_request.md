[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / common/https-request

# Module: common/https-request

## Table of contents

### Type Aliases

- [RequestOptions](common_https_request.md#requestoptions)
- [ResponseError](common_https_request.md#responseerror)
- [ResponseErrorNames](common_https_request.md#responseerrornames)

### Functions

- [request](common_https_request.md#request)

## Type Aliases

### RequestOptions

Ƭ **RequestOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `headers` | \{ `[x: string]`: `string`;  } |
| `hostname` | `string` |
| `method` | ``"GET"`` \| ``"POST"`` |
| `path` | `string` |
| `port` | `number` |

___

### ResponseError

Ƭ **ResponseError**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `body?` | `object` |
| `error?` | `Error` |
| `http?` | \{ `body?`: `string` \| `object` ; `contentType?`: `string` ; `statusCode?`: `number`  } |
| `http.body?` | `string` \| `object` |
| `http.contentType?` | `string` |
| `http.statusCode?` | `number` |
| `name` | [`ResponseErrorNames`](common_https_request.md#responseerrornames) |
| `stack?` | `string` |

___

### ResponseErrorNames

Ƭ **ResponseErrorNames**: ``"CONNECTION_INTERRUPTED"`` \| ``"STATUS_CODE_MISSING"`` \| ``"INVALID_AUTHORIZATION_CREDENTIAL"`` \| ``"INTERNAL_ERROR"`` \| ``"CONTENT_TYPE_MISSING"`` \| ``"CONTENT_TYPE_INCORRECT"`` \| ``"BODY_MISSING"`` \| ``"BODY_INVALID_FORMAT"`` \| ``"UNKNOWN_ERROR"`` \| ``"BAD_GATEWAY"``

## Functions

### request

▸ **request**(`requestOptions`, `bearerToken`, `requestBody?`): `Promise`\<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `requestOptions` | [`RequestOptions`](common_https_request.md#requestoptions) |
| `bearerToken` | `string` |
| `requestBody?` | `object` |

#### Returns

`Promise`\<`any`\>

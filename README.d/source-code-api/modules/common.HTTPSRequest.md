[alexa-for-lg-webos-tv](../README.md) / [common](common.md) / HTTPSRequest

# Namespace: HTTPSRequest

[common](common.md).HTTPSRequest

## Table of contents

### Type Aliases

- [RequestOptions](common.HTTPSRequest.md#requestoptions)
- [ResponseError](common.HTTPSRequest.md#responseerror)
- [ResponseErrorNames](common.HTTPSRequest.md#responseerrornames)

### Functions

- [request](common.HTTPSRequest.md#request)

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

#### Defined in

[common/https-request.ts:4](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/https-request.ts#L4)

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
| `name` | [`ResponseErrorNames`](common.HTTPSRequest.md#responseerrornames) |
| `stack?` | `string` |

#### Defined in

[common/https-request.ts:24](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/https-request.ts#L24)

___

### ResponseErrorNames

Ƭ **ResponseErrorNames**: ``"CONNECTION_INTERRUPTED"`` \| ``"STATUS_CODE_MISSING"`` \| ``"INVALID_AUTHORIZATION_CREDENTIAL"`` \| ``"INTERNAL_ERROR"`` \| ``"CONTENT_TYPE_MISSING"`` \| ``"CONTENT_TYPE_INCORRECT"`` \| ``"BODY_MISSING"`` \| ``"BODY_INVALID_FORMAT"`` \| ``"UNKNOWN_ERROR"`` \| ``"BAD_GATEWAY"``

#### Defined in

[common/https-request.ts:12](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/https-request.ts#L12)

## Functions

### request

▸ **request**(`requestOptions`, `bearerToken`, `requestBody?`): `Promise`\<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `requestOptions` | [`RequestOptions`](common.HTTPSRequest.md#requestoptions) |
| `bearerToken` | `string` |
| `requestBody?` | `object` |

#### Returns

`Promise`\<`any`\>

#### Defined in

[common/https-request.ts:36](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/https-request.ts#L36)

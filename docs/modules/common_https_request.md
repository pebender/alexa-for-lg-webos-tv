[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / common/https-request

# Module: common/https-request

## Table of contents

### Type Aliases

- [RequestOptions](common_https_request.md#requestoptions)

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

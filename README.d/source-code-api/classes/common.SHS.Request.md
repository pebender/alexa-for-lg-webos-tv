[alexa-for-lg-webos-tv](../README.md) / [common](../modules/common.md) / [SHS](../modules/common.SHS.md) / Request

# Class: Request

[common](../modules/common.md).[SHS](../modules/common.SHS.md).Request

## Indexable

▪ [x: `string`]: `object` \| `undefined`

## Table of contents

### Constructors

- [constructor](common.SHS.Request.md#constructor)

### Properties

- [directive](common.SHS.Request.md#directive)

### Methods

- [getBearerToken](common.SHS.Request.md#getbearertoken)
- [getCorrelationToken](common.SHS.Request.md#getcorrelationtoken)
- [getEndpointId](common.SHS.Request.md#getendpointid)
- [getUserEmail](common.SHS.Request.md#getuseremail)
- [getUserProfile](common.SHS.Request.md#getuserprofile)

## Constructors

### constructor

• **new Request**(`opts`): [`Request`](common.SHS.Request.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.directive` | `Object` |
| `opts.directive.endpoint?` | `object` |
| `opts.directive.header` | `Object` |
| `opts.directive.header.correlationToken?` | `string` |
| `opts.directive.header.instance?` | `string` |
| `opts.directive.header.messageId?` | `string` |
| `opts.directive.header.name?` | `string` |
| `opts.directive.header.namespace?` | [`Namespace`](../modules/common.SHS.Directive.Header.md#namespace) |
| `opts.directive.header.payloadVersion?` | ``"3"`` |
| `opts.directive.payload` | [`Payload`](../interfaces/common.SHS.Directive.Payload.md) |

#### Returns

[`Request`](common.SHS.Request.md)

#### Defined in

[common/smart-home-skill/request.ts:63](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/request.ts#L63)

## Properties

### directive

• **directive**: [`Directive`](../interfaces/common.SHS.Directive-1.md)

#### Defined in

[common/smart-home-skill/request.ts:61](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/request.ts#L61)

## Methods

### getBearerToken

▸ **getBearerToken**(): `string`

#### Returns

`string`

#### Defined in

[common/smart-home-skill/request.ts:88](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/request.ts#L88)

___

### getCorrelationToken

▸ **getCorrelationToken**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

#### Defined in

[common/smart-home-skill/request.ts:80](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/request.ts#L80)

___

### getEndpointId

▸ **getEndpointId**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

#### Defined in

[common/smart-home-skill/request.ts:84](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/request.ts#L84)

___

### getUserEmail

▸ **getUserEmail**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

#### Defined in

[common/smart-home-skill/request.ts:129](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/request.ts#L129)

___

### getUserProfile

▸ **getUserProfile**(): `Promise`\<\{ `[x: string]`: `string`; `email`: `string` ; `user_id`: `string`  }\>

#### Returns

`Promise`\<\{ `[x: string]`: `string`; `email`: `string` ; `user_id`: `string`  }\>

#### Defined in

[common/smart-home-skill/request.ts:112](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/request.ts#L112)

[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [common/smart-home-skill/request](../modules/common_smart_home_skill_request.md) / SHSRequest

# Class: SHSRequest

[common/smart-home-skill/request](../modules/common_smart_home_skill_request.md).SHSRequest

## Indexable

▪ [x: `string`]: `object` \| `undefined`

## Table of contents

### Constructors

- [constructor](common_smart_home_skill_request.SHSRequest.md#constructor)

### Properties

- [directive](common_smart_home_skill_request.SHSRequest.md#directive)

### Methods

- [getBearerToken](common_smart_home_skill_request.SHSRequest.md#getbearertoken)
- [getCorrelationToken](common_smart_home_skill_request.SHSRequest.md#getcorrelationtoken)
- [getEndpointId](common_smart_home_skill_request.SHSRequest.md#getendpointid)
- [getUserEmail](common_smart_home_skill_request.SHSRequest.md#getuseremail)
- [getUserProfile](common_smart_home_skill_request.SHSRequest.md#getuserprofile)

## Constructors

### constructor

• **new SHSRequest**(`opts`): [`SHSRequest`](common_smart_home_skill_request.SHSRequest.md)

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
| `opts.directive.header.namespace?` | [`Namespace`](../modules/common_smart_home_skill_request.SHSDirective.Header.md#namespace) |
| `opts.directive.header.payloadVersion?` | ``"3"`` |
| `opts.directive.payload` | [`Payload`](../interfaces/common_smart_home_skill_request.SHSDirective.Payload.md) |

#### Returns

[`SHSRequest`](common_smart_home_skill_request.SHSRequest.md)

## Properties

### directive

• **directive**: [`SHSDirective`](../interfaces/common_smart_home_skill_request.SHSDirective-1.md)

## Methods

### getBearerToken

▸ **getBearerToken**(): `string`

#### Returns

`string`

___

### getCorrelationToken

▸ **getCorrelationToken**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

___

### getEndpointId

▸ **getEndpointId**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

___

### getUserEmail

▸ **getUserEmail**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

___

### getUserProfile

▸ **getUserProfile**(): `Promise`\<\{ `[x: string]`: `string`; `email`: `string` ; `user_id`: `string`  }\>

#### Returns

`Promise`\<\{ `[x: string]`: `string`; `email`: `string` ; `user_id`: `string`  }\>

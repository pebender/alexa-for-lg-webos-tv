[alexa-for-lg-webos-tv](../README.md) / [common](../modules/common.md) / [SHS](../modules/common.SHS.md) / [Directive](../modules/common.SHS.Directive.md) / Payload

# Interface: Payload

[SHS](../modules/common.SHS.md).[Directive](../modules/common.SHS.Directive.md).Payload

## Indexable

▪ [x: `string`]: `boolean` \| `number` \| `string` \| [] \| `object` \| `undefined`

## Table of contents

### Properties

- [grant](common.SHS.Directive.Payload.md#grant)
- [grantee](common.SHS.Directive.Payload.md#grantee)
- [scope](common.SHS.Directive.Payload.md#scope)

## Properties

### grant

• `Optional` **grant**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `code` | `string` |
| `type` | ``"OAuth2.AuthorizationCode"`` |

#### Defined in

[common/smart-home-skill/request.ts:42](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/request.ts#L42)

___

### grantee

• `Optional` **grantee**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `token` | `string` |
| `type` | ``"BearerToken"`` |

#### Defined in

[common/smart-home-skill/request.ts:46](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/request.ts#L46)

___

### scope

• `Optional` **scope**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `token` | `string` |
| `type` | ``"BearerToken"`` |

#### Defined in

[common/smart-home-skill/request.ts:38](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/request.ts#L38)

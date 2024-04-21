[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [common/smart-home-skill/request](../modules/common_smart_home_skill_request.md) / [SHSDirective](../modules/common_smart_home_skill_request.SHSDirective.md) / Payload

# Interface: Payload

[common/smart-home-skill/request](../modules/common_smart_home_skill_request.md).[SHSDirective](../modules/common_smart_home_skill_request.SHSDirective.md).Payload

## Indexable

▪ [x: `string`]: `boolean` \| `number` \| `string` \| [] \| `object` \| `undefined`

## Table of contents

### Properties

- [grant](common_smart_home_skill_request.SHSDirective.Payload.md#grant)
- [grantee](common_smart_home_skill_request.SHSDirective.Payload.md#grantee)
- [scope](common_smart_home_skill_request.SHSDirective.Payload.md#scope)

## Properties

### grant

• `Optional` **grant**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `code` | `string` |
| `type` | ``"OAuth2.AuthorizationCode"`` |

___

### grantee

• `Optional` **grantee**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `token` | `string` |
| `type` | ``"BearerToken"`` |

___

### scope

• `Optional` **scope**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `token` | `string` |
| `type` | ``"BearerToken"`` |

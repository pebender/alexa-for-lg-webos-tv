[alexa-for-lg-webos-tv](../README.md) / [common](common.md) / [Profile](common.Profile.md) / SHS

# Namespace: SHS

[common](common.md).[Profile](common.Profile.md).SHS

## Table of contents

### Functions

- [getUserEmail](common.Profile.SHS.md#getuseremail)
- [getUserProfile](common.Profile.SHS.md#getuserprofile)

## Functions

### getUserEmail

▸ **getUserEmail**(`bearerToken`): `Promise`\<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `bearerToken` | `string` |

#### Returns

`Promise`\<`string`\>

#### Defined in

[common/profile/smart-home-skill.ts:69](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/profile/smart-home-skill.ts#L69)

___

### getUserProfile

▸ **getUserProfile**(`bearerToken`): `Promise`\<\{ `[x: string]`: `string`; `email`: `string` ; `user_id`: `string`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `bearerToken` | `string` |

#### Returns

`Promise`\<\{ `[x: string]`: `string`; `email`: `string` ; `user_id`: `string`  }\>

#### Defined in

[common/profile/smart-home-skill.ts:23](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/profile/smart-home-skill.ts#L23)

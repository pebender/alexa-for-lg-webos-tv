[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / skill/lib/database

# Module: skill/lib/database

## Table of contents

### Type Aliases

- [BridgeInformation](skill_lib_database.md#bridgeinformation)

### Functions

- [getBridgeInformation](skill_lib_database.md#getbridgeinformation)
- [getBridgeInformationUsingEmail](skill_lib_database.md#getbridgeinformationusingemail)
- [getEmail](skill_lib_database.md#getemail)
- [setBridgeInformation](skill_lib_database.md#setbridgeinformation)
- [setSkillToken](skill_lib_database.md#setskilltoken)

## Type Aliases

### BridgeInformation

Ƭ **BridgeInformation**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `bridgeToken` | `string` |
| `hostname` | `string` |

## Functions

### getBridgeInformation

▸ **getBridgeInformation**(`skillToken`): `Promise`\<[`BridgeInformation`](skill_lib_database.md#bridgeinformation) \| ``null``\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `skillToken` | `string` |

#### Returns

`Promise`\<[`BridgeInformation`](skill_lib_database.md#bridgeinformation) \| ``null``\>

___

### getBridgeInformationUsingEmail

▸ **getBridgeInformationUsingEmail**(`email`): `Promise`\<[`BridgeInformation`](skill_lib_database.md#bridgeinformation) \| ``null``\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `email` | `string` |

#### Returns

`Promise`\<[`BridgeInformation`](skill_lib_database.md#bridgeinformation) \| ``null``\>

___

### getEmail

▸ **getEmail**(`skillToken`): `Promise`\<`string` \| ``null``\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `skillToken` | `string` |

#### Returns

`Promise`\<`string` \| ``null``\>

___

### setBridgeInformation

▸ **setBridgeInformation**(`email`, `bridgeInformation`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `email` | `string` |
| `bridgeInformation` | [`BridgeInformation`](skill_lib_database.md#bridgeinformation) |

#### Returns

`Promise`\<`void`\>

___

### setSkillToken

▸ **setSkillToken**(`email`, `skillToken`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `email` | `string` |
| `skillToken` | `string` |

#### Returns

`Promise`\<`void`\>

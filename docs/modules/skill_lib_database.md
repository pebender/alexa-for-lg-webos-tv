[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / skill/lib/database

# Module: skill/lib/database

## Table of contents

### Type Aliases

- [BridgeInformation](skill_lib_database.md#bridgeinformation)
- [Field](skill_lib_database.md#field)
- [Record](skill_lib_database.md#record)

### Functions

- [getBridgeInformation](skill_lib_database.md#getbridgeinformation)
- [getBridgeInformationUsingEmail](skill_lib_database.md#getbridgeinformationusingemail)
- [getEmail](skill_lib_database.md#getemail)
- [getRecordUsingEmail](skill_lib_database.md#getrecordusingemail)
- [getRecordUsingSkillToken](skill_lib_database.md#getrecordusingskilltoken)
- [getRequiredRecordUsingEmail](skill_lib_database.md#getrequiredrecordusingemail)
- [getRequiredRecordUsingSkillToken](skill_lib_database.md#getrequiredrecordusingskilltoken)
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

___

### Field

Ƭ **Field**: ``"email"`` \| ``"skillToken"`` \| ``"hostname"`` \| ``"bridgeToken"``

___

### Record

Ƭ **Record**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `bridgeToken` | `string` \| ``null`` |
| `email` | `string` \| ``null`` |
| `hostname` | `string` \| ``null`` |
| `skillToken` | `string` \| ``null`` |

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

### getRecordUsingEmail

▸ **getRecordUsingEmail**(`email`, `options?`): `Promise`\<[`Record`](skill_lib_database.md#record) \| ``null``\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `email` | `string` |
| `options?` | `Object` |
| `options.required?` | `boolean` |
| `options.requiredFields?` | [`Field`](skill_lib_database.md#field)[] |

#### Returns

`Promise`\<[`Record`](skill_lib_database.md#record) \| ``null``\>

___

### getRecordUsingSkillToken

▸ **getRecordUsingSkillToken**(`skillToken`, `options?`): `Promise`\<[`Record`](skill_lib_database.md#record) \| ``null``\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `skillToken` | `string` |
| `options?` | `Object` |
| `options.required?` | `boolean` |
| `options.requiredFields?` | [`Field`](skill_lib_database.md#field)[] |

#### Returns

`Promise`\<[`Record`](skill_lib_database.md#record) \| ``null``\>

___

### getRequiredRecordUsingEmail

▸ **getRequiredRecordUsingEmail**(`email`, `options?`): `Promise`\<[`Record`](skill_lib_database.md#record)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `email` | `string` |
| `options?` | `Object` |
| `options.requiredFields?` | [`Field`](skill_lib_database.md#field)[] |

#### Returns

`Promise`\<[`Record`](skill_lib_database.md#record)\>

___

### getRequiredRecordUsingSkillToken

▸ **getRequiredRecordUsingSkillToken**(`skillToken`, `options?`): `Promise`\<[`Record`](skill_lib_database.md#record)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `skillToken` | `string` |
| `options?` | `Object` |
| `options.requiredFields?` | [`Field`](skill_lib_database.md#field)[] |

#### Returns

`Promise`\<[`Record`](skill_lib_database.md#record)\>

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

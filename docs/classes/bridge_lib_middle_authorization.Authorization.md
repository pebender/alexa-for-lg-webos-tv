[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/lib/middle/authorization](../modules/bridge_lib_middle_authorization.md) / Authorization

# Class: Authorization

[bridge/lib/middle/authorization](../modules/bridge_lib_middle_authorization.md).Authorization

## Table of contents

### Constructors

- [constructor](bridge_lib_middle_authorization.Authorization.md#constructor)

### Properties

- [\_configuration](bridge_lib_middle_authorization.Authorization.md#_configuration)
- [\_db](bridge_lib_middle_authorization.Authorization.md#_db)

### Methods

- [authorize](bridge_lib_middle_authorization.Authorization.md#authorize)
- [build](bridge_lib_middle_authorization.Authorization.md#build)

## Constructors

### constructor

• **new Authorization**(`_configuration`, `_db`): [`Authorization`](bridge_lib_middle_authorization.Authorization.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_configuration` | [`Configuration`](bridge_lib_configuration.Configuration.md) |
| `_db` | [`DatabaseTable`](bridge_lib_database.DatabaseTable.md) |

#### Returns

[`Authorization`](bridge_lib_middle_authorization.Authorization.md)

## Properties

### \_configuration

• `Private` `Readonly` **\_configuration**: [`Configuration`](bridge_lib_configuration.Configuration.md)

___

### \_db

• `Private` `Readonly` **\_db**: [`DatabaseTable`](bridge_lib_database.DatabaseTable.md)

## Methods

### authorize

▸ **authorize**(`skillToken`): `Promise`\<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `skillToken` | `string` |

#### Returns

`Promise`\<`boolean`\>

___

### build

▸ **build**(`configuration`): `Promise`\<[`Authorization`](bridge_lib_middle_authorization.Authorization.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [`Configuration`](bridge_lib_configuration.Configuration.md) |

#### Returns

`Promise`\<[`Authorization`](bridge_lib_middle_authorization.Authorization.md)\>

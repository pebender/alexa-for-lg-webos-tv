[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/lib/database](../modules/bridge_lib_database.md) / DatabaseTable

# Class: DatabaseTable

[bridge/lib/database](../modules/bridge_lib_database.md).DatabaseTable

## Table of contents

### Constructors

- [constructor](bridge_lib_database.DatabaseTable.md#constructor)

### Properties

- [\_db](bridge_lib_database.DatabaseTable.md#_db)
- [\_indexes](bridge_lib_database.DatabaseTable.md#_indexes)
- [\_key](bridge_lib_database.DatabaseTable.md#_key)

### Methods

- [clean](bridge_lib_database.DatabaseTable.md#clean)
- [deleteRecord](bridge_lib_database.DatabaseTable.md#deleterecord)
- [getRecord](bridge_lib_database.DatabaseTable.md#getrecord)
- [getRecords](bridge_lib_database.DatabaseTable.md#getrecords)
- [insertRecord](bridge_lib_database.DatabaseTable.md#insertrecord)
- [updateOrInsertRecord](bridge_lib_database.DatabaseTable.md#updateorinsertrecord)
- [updateRecord](bridge_lib_database.DatabaseTable.md#updaterecord)
- [build](bridge_lib_database.DatabaseTable.md#build)

## Constructors

### constructor

• **new DatabaseTable**(`indexes`, `key`, `db`): [`DatabaseTable`](bridge_lib_database.DatabaseTable.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `indexes` | `string`[] |
| `key` | `string` |
| `db` | `Nedb`\<`Record`\<`string`, `any`\>\> |

#### Returns

[`DatabaseTable`](bridge_lib_database.DatabaseTable.md)

## Properties

### \_db

• `Private` **\_db**: `Nedb`\<`Record`\<`string`, `any`\>\>

___

### \_indexes

• `Private` **\_indexes**: `string`[]

___

### \_key

• `Private` **\_key**: `string`

## Methods

### clean

▸ **clean**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

___

### deleteRecord

▸ **deleteRecord**(`query`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`DatabaseQuery`](../interfaces/bridge_lib_database.DatabaseQuery.md) |

#### Returns

`Promise`\<`void`\>

___

### getRecord

▸ **getRecord**(`query`): `Promise`\<``null`` \| [`DatabaseRecord`](../interfaces/bridge_lib_database.DatabaseRecord.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`DatabaseQuery`](../interfaces/bridge_lib_database.DatabaseQuery.md) |

#### Returns

`Promise`\<``null`` \| [`DatabaseRecord`](../interfaces/bridge_lib_database.DatabaseRecord.md)\>

___

### getRecords

▸ **getRecords**(`query`): `Promise`\<[`DatabaseRecord`](../interfaces/bridge_lib_database.DatabaseRecord.md)[]\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`DatabaseQuery`](../interfaces/bridge_lib_database.DatabaseQuery.md) |

#### Returns

`Promise`\<[`DatabaseRecord`](../interfaces/bridge_lib_database.DatabaseRecord.md)[]\>

___

### insertRecord

▸ **insertRecord**(`record`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `record` | [`DatabaseRecord`](../interfaces/bridge_lib_database.DatabaseRecord.md) |

#### Returns

`Promise`\<`void`\>

___

### updateOrInsertRecord

▸ **updateOrInsertRecord**(`query`, `update`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`DatabaseQuery`](../interfaces/bridge_lib_database.DatabaseQuery.md) |
| `update` | [`DatabaseUpdate`](../interfaces/bridge_lib_database.DatabaseUpdate.md) |

#### Returns

`Promise`\<`void`\>

___

### updateRecord

▸ **updateRecord**(`query`, `update`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `query` | [`DatabaseQuery`](../interfaces/bridge_lib_database.DatabaseQuery.md) |
| `update` | [`DatabaseUpdate`](../interfaces/bridge_lib_database.DatabaseUpdate.md) |

#### Returns

`Promise`\<`void`\>

___

### build

▸ **build**(`name`, `indexes`, `key`): `Promise`\<[`DatabaseTable`](bridge_lib_database.DatabaseTable.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` |
| `indexes` | `string`[] |
| `key` | `string` |

#### Returns

`Promise`\<[`DatabaseTable`](bridge_lib_database.DatabaseTable.md)\>

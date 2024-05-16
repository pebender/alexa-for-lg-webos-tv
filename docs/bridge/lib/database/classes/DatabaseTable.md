[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/lib/database](../README.md) / DatabaseTable

# Class: DatabaseTable

## Constructors

### new DatabaseTable()

> `private` **new DatabaseTable**(`indexes`, `key`, `db`): [`DatabaseTable`](DatabaseTable.md)

#### Parameters

• **indexes**: `string`[]

• **key**: `string`

• **db**: `Nedb`\<`Record`\<`string`, `any`\>\>

#### Returns

[`DatabaseTable`](DatabaseTable.md)

## Properties

### \_db

> `private` `readonly` **\_db**: `Nedb`\<`Record`\<`string`, `any`\>\>

***

### \_indexes

> `private` `readonly` **\_indexes**: `string`[]

***

### \_key

> `private` `readonly` **\_key**: `string`

## Methods

### clean()

> **clean**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### deleteRecord()

> **deleteRecord**(`query`): `Promise`\<`void`\>

#### Parameters

• **query**: [`DatabaseQuery`](../type-aliases/DatabaseQuery.md)

#### Returns

`Promise`\<`void`\>

***

### getRecord()

> **getRecord**(`query`): `Promise`\<`null` \| [`DatabaseRecord`](../type-aliases/DatabaseRecord.md)\>

#### Parameters

• **query**: [`DatabaseQuery`](../type-aliases/DatabaseQuery.md)

#### Returns

`Promise`\<`null` \| [`DatabaseRecord`](../type-aliases/DatabaseRecord.md)\>

***

### getRecords()

> **getRecords**(`query`): `Promise`\<[`DatabaseRecord`](../type-aliases/DatabaseRecord.md)[]\>

#### Parameters

• **query**: [`DatabaseQuery`](../type-aliases/DatabaseQuery.md)

#### Returns

`Promise`\<[`DatabaseRecord`](../type-aliases/DatabaseRecord.md)[]\>

***

### insertRecord()

> **insertRecord**(`record`): `Promise`\<`void`\>

#### Parameters

• **record**: [`DatabaseRecord`](../type-aliases/DatabaseRecord.md)

#### Returns

`Promise`\<`void`\>

***

### updateOrInsertRecord()

> **updateOrInsertRecord**(`query`, `update`): `Promise`\<`void`\>

#### Parameters

• **query**: [`DatabaseQuery`](../type-aliases/DatabaseQuery.md)

• **update**: [`DatabaseUpdate`](../type-aliases/DatabaseUpdate.md)

#### Returns

`Promise`\<`void`\>

***

### updateRecord()

> **updateRecord**(`query`, `update`): `Promise`\<`void`\>

#### Parameters

• **query**: [`DatabaseQuery`](../type-aliases/DatabaseQuery.md)

• **update**: [`DatabaseUpdate`](../type-aliases/DatabaseUpdate.md)

#### Returns

`Promise`\<`void`\>

***

### build()

> `static` **build**(`name`, `indexes`, `key`): `Promise`\<[`DatabaseTable`](DatabaseTable.md)\>

#### Parameters

• **name**: `string`

• **indexes**: `string`[]

• **key**: `string`

#### Returns

`Promise`\<[`DatabaseTable`](DatabaseTable.md)\>

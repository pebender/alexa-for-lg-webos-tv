[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/lib/database](../README.md) / DatabaseTable

# Class: DatabaseTable\<DatabaseRecord\>

## Type parameters

• **DatabaseRecord**

## Constructors

### new DatabaseTable()

> `private` **new DatabaseTable**\<`DatabaseRecord`\>(`indexes`, `key`, `database`): [`DatabaseTable`](DatabaseTable.md)\<`DatabaseRecord`\>

#### Parameters

• **indexes**: keyof `DatabaseRecord`[]

• **key**: keyof `DatabaseRecord`

• **database**: `Nedb`\<`Record`\<`string`, `any`\>\>

#### Returns

[`DatabaseTable`](DatabaseTable.md)\<`DatabaseRecord`\>

## Properties

### \_database

> `private` `readonly` **\_database**: `Nedb`\<`Record`\<`string`, `any`\>\>

***

### \_indexes

> `private` `readonly` **\_indexes**: keyof `DatabaseRecord`[]

***

### \_key

> `private` `readonly` **\_key**: keyof `DatabaseRecord`

## Methods

### clean()

> **clean**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### deleteRecord()

> **deleteRecord**(`query`): `Promise`\<`void`\>

#### Parameters

• **query**: [`OneOf`](../type-aliases/OneOf.md)\<`DatabaseRecord`, keyof `DatabaseRecord`\> \| [`OneOf`](../type-aliases/OneOf.md)\<`DatabaseRecord`, keyof `DatabaseRecord`\>[]

#### Returns

`Promise`\<`void`\>

***

### getRecord()

> **getRecord**(`query`): `Promise`\<`null` \| `DatabaseRecord`\>

#### Parameters

• **query**: [`OneOf`](../type-aliases/OneOf.md)\<`DatabaseRecord`, keyof `DatabaseRecord`\> \| [`OneOf`](../type-aliases/OneOf.md)\<`DatabaseRecord`, keyof `DatabaseRecord`\>[]

#### Returns

`Promise`\<`null` \| `DatabaseRecord`\>

***

### getRecords()

> **getRecords**(`query`): `Promise`\<`DatabaseRecord`[]\>

#### Parameters

• **query**: [`OneOf`](../type-aliases/OneOf.md)\<`DatabaseRecord`, keyof `DatabaseRecord`\> \| [`OneOf`](../type-aliases/OneOf.md)\<`DatabaseRecord`, keyof `DatabaseRecord`\>[]

#### Returns

`Promise`\<`DatabaseRecord`[]\>

***

### insertRecord()

> **insertRecord**(`record`): `Promise`\<`void`\>

#### Parameters

• **record**: `DatabaseRecord`

#### Returns

`Promise`\<`void`\>

***

### updateFields()

> **updateFields**(`query`, `fields`): `Promise`\<`void`\>

#### Parameters

• **query**: [`OneOf`](../type-aliases/OneOf.md)\<`DatabaseRecord`, keyof `DatabaseRecord`\> \| [`OneOf`](../type-aliases/OneOf.md)\<`DatabaseRecord`, keyof `DatabaseRecord`\>[]

• **fields**: [`OneOf`](../type-aliases/OneOf.md)\<`DatabaseRecord`, keyof `DatabaseRecord`\> \| [`OneOf`](../type-aliases/OneOf.md)\<`DatabaseRecord`, keyof `DatabaseRecord`\>[]

#### Returns

`Promise`\<`void`\>

***

### updateOrInsertRecord()

> **updateOrInsertRecord**(`query`, `record`): `Promise`\<`void`\>

#### Parameters

• **query**: [`OneOf`](../type-aliases/OneOf.md)\<`DatabaseRecord`, keyof `DatabaseRecord`\> \| [`OneOf`](../type-aliases/OneOf.md)\<`DatabaseRecord`, keyof `DatabaseRecord`\>[]

• **record**: `DatabaseRecord`

#### Returns

`Promise`\<`void`\>

***

### build()

> `static` **build**\<`DatabaseRecord`\>(`name`, `indexes`, `key`): `Promise`\<[`DatabaseTable`](DatabaseTable.md)\<`DatabaseRecord`\>\>

#### Type parameters

• **DatabaseRecord**

#### Parameters

• **name**: `string`

• **indexes**: keyof `DatabaseRecord`[]

• **key**: keyof `DatabaseRecord`

#### Returns

`Promise`\<[`DatabaseTable`](DatabaseTable.md)\<`DatabaseRecord`\>\>

[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/lib/database](../README.md) / DatabaseTable

# Class: DatabaseTable\<DatabaseRecord\>

This generic class provides typed basic access to an
[@seald-io/nedb](https://www.npmjs.com/package/@seald-io/nedb)
database. `DatabaseRecord` specifies the fields in a record. It must be a
`type` not an `interface` because it must have a signature so that we can
limit it using `extends`.  You can learn more about this difference between a
'type' and an 'interface' at
[https://github.com/microsoft/TypeScript/issues/15300](https://github.com/microsoft/TypeScript/issues/15300).

## Type Parameters

• **DatabaseRecord** *extends* `Record`\<`string`, `string` \| `number` \| `boolean` \| `Date` \| `null`\>

## Methods

### deleteRecords()

> **deleteRecords**(`query`): `Promise`\<`void`\>

#### Parameters

• **query**: [`OneOf`](../type-aliases/OneOf.md)\<`DatabaseRecord`, keyof `DatabaseRecord`\> \| [`OneOf`](../type-aliases/OneOf.md)\<`DatabaseRecord`, keyof `DatabaseRecord`\>[]

#### Returns

`Promise`\<`void`\>

***

### getRecord()

> **getRecord**(`query`): `Promise`\<`null` \| `DatabaseRecord`\>

#### Parameters

• **query**: [`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\> \| [`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\>[]

#### Returns

`Promise`\<`null` \| `DatabaseRecord`\>

***

### getRecords()

> **getRecords**(`query`?): `Promise`\<`DatabaseRecord`[]\>

#### Parameters

• **query?**: [`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\> \| [`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\>[]

#### Returns

`Promise`\<`DatabaseRecord`[]\>

***

### updateOrInsertFields()

> **updateOrInsertFields**(`query`, `fields`): `Promise`\<`void`\>

#### Parameters

• **query**: [`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\> \| [`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\>[]

• **fields**: [`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\> \| [`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\>[]

#### Returns

`Promise`\<`void`\>

***

### updateOrInsertRecord()

> **updateOrInsertRecord**(`query`, `record`): `Promise`\<`void`\>

#### Parameters

• **query**: [`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\> \| [`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\>[]

• **record**: `DatabaseRecord`

#### Returns

`Promise`\<`void`\>

***

### build()

> `static` **build**\<`DatabaseRecord`\>(`configurationDirectory`, `name`, `indexes`): `Promise`\<[`DatabaseTable`](DatabaseTable.md)\<`DatabaseRecord`\>\>

#### Type Parameters

• **DatabaseRecord** *extends* `Record`\<`string`, `null` \| `string` \| `number` \| `boolean` \| `Date`\>

#### Parameters

• **configurationDirectory**: `string`

• **name**: `string`

• **indexes**: keyof `DatabaseRecord`[]

#### Returns

`Promise`\<[`DatabaseTable`](DatabaseTable.md)\<`DatabaseRecord`\>\>

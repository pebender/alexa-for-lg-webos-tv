[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@backinthirty/alexa-for-lg-webos-tv-bridge](../../../README.md) / [lib/database](../README.md) / DatabaseTable

# Class: DatabaseTable\<DatabaseRecord\>

Defined in: [packages/bridge/src/lib/database.ts:31](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/database.ts#L31)

This generic class provides typed basic access to an
[@seald-io/nedb](https://www.npmjs.com/package/@seald-io/nedb)
database. `DatabaseRecord` specifies the fields in a record. It must be a
`type` not an `interface` because it must have a signature so that we can
limit it using `extends`.  You can learn more about this difference between a
'type' and an 'interface' at
[https://github.com/microsoft/TypeScript/issues/15300](https://github.com/microsoft/TypeScript/issues/15300).

## Type Parameters

### DatabaseRecord

`DatabaseRecord` *extends* `Record`\<`string`, `string` \| `number` \| `boolean` \| `Date` \| `null`\>

## Methods

### deleteRecords()

> **deleteRecords**(`query`): `Promise`\<`void`\>

Defined in: [packages/bridge/src/lib/database.ts:90](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/database.ts#L90)

#### Parameters

##### query

[`OneOf`](../type-aliases/OneOf.md)\<`DatabaseRecord`, keyof `DatabaseRecord`\> | [`OneOf`](../type-aliases/OneOf.md)\<`DatabaseRecord`, keyof `DatabaseRecord`\>[]

#### Returns

`Promise`\<`void`\>

***

### getRecord()

> **getRecord**(`query`): `Promise`\<`DatabaseRecord` \| `null`\>

Defined in: [packages/bridge/src/lib/database.ts:104](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/database.ts#L104)

#### Parameters

##### query

[`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\> | [`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\>[]

#### Returns

`Promise`\<`DatabaseRecord` \| `null`\>

***

### getRecords()

> **getRecords**(`query?`): `Promise`\<`DatabaseRecord`[]\>

Defined in: [packages/bridge/src/lib/database.ts:124](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/database.ts#L124)

#### Parameters

##### query?

[`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\> | [`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\>[]

#### Returns

`Promise`\<`DatabaseRecord`[]\>

***

### updateOrInsertFields()

> **updateOrInsertFields**(`query`, `fields`): `Promise`\<`void`\>

Defined in: [packages/bridge/src/lib/database.ts:163](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/database.ts#L163)

#### Parameters

##### query

[`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\> | [`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\>[]

##### fields

[`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\> | [`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\>[]

#### Returns

`Promise`\<`void`\>

***

### updateOrInsertRecord()

> **updateOrInsertRecord**(`query`, `record`): `Promise`\<`void`\>

Defined in: [packages/bridge/src/lib/database.ts:143](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/database.ts#L143)

#### Parameters

##### query

[`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\> | [`OneOf`](../type-aliases/OneOf.md)\<`Required`\<`DatabaseRecord`\>, keyof `DatabaseRecord`\>[]

##### record

`DatabaseRecord`

#### Returns

`Promise`\<`void`\>

***

### build()

> `static` **build**\<`DatabaseRecord`\>(`configurationDirectory`, `name`, `indexes`): `Promise`\<`DatabaseTable`\<`DatabaseRecord`\>\>

Defined in: [packages/bridge/src/lib/database.ts:47](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/database.ts#L47)

#### Type Parameters

##### DatabaseRecord

`DatabaseRecord` *extends* `Record`\<`string`, `string` \| `number` \| `boolean` \| `Date` \| `null`\>

#### Parameters

##### configurationDirectory

`string`

##### name

`string`

##### indexes

keyof `DatabaseRecord`[]

#### Returns

`Promise`\<`DatabaseTable`\<`DatabaseRecord`\>\>

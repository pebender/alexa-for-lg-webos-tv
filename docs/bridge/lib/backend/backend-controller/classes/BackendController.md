[**alexa-for-lg-webos-tv**](../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../modules.md) / [bridge/lib/backend/backend-controller](../README.md) / BackendController

# Class: BackendController

## Extends

- `EventEmitter`

## Constructors

### new BackendController()

> `private` **new BackendController**(`_db`, `_controls`): [`BackendController`](BackendController.md)

#### Parameters

• **\_db**: [`DatabaseTable`](../../../database/classes/DatabaseTable.md)

• **\_controls**: `Record`\<`string`, [`BackendControl`](../../backend-control/classes/BackendControl.md)\>

#### Returns

[`BackendController`](BackendController.md)

#### Overrides

`EventEmitter.constructor`

## Properties

### \_controls

> `private` `readonly` **\_controls**: `Record`\<`string`, [`BackendControl`](../../backend-control/classes/BackendControl.md)\>

***

### \_db

> `private` `readonly` **\_db**: [`DatabaseTable`](../../../database/classes/DatabaseTable.md)

## Methods

### control()

> **control**(`udn`): [`BackendControl`](../../backend-control/classes/BackendControl.md)

#### Parameters

• **udn**: `string`

#### Returns

[`BackendControl`](../../backend-control/classes/BackendControl.md)

***

### controls()

> **controls**(): [`BackendControl`](../../backend-control/classes/BackendControl.md)[]

#### Returns

[`BackendControl`](../../backend-control/classes/BackendControl.md)[]

***

### eventsAdd()

> `private` **eventsAdd**(`udn`): `void`

#### Parameters

• **udn**: `string`

#### Returns

`void`

***

### start()

> **start**(): `void`

#### Returns

`void`

***

### throwIfNotKnownTV()

> `private` **throwIfNotKnownTV**(`methodName`, `udn`): `void`

#### Parameters

• **methodName**: `string`

• **udn**: `string`

#### Returns

`void`

***

### tvUpsert()

> **tvUpsert**(`tv`): `Promise`\<`void`\>

#### Parameters

• **tv**: [`TV`](../../tv/interfaces/TV.md)

#### Returns

`Promise`\<`void`\>

***

### build()

> `static` **build**(): `Promise`\<[`BackendController`](BackendController.md)\>

#### Returns

`Promise`\<[`BackendController`](BackendController.md)\>

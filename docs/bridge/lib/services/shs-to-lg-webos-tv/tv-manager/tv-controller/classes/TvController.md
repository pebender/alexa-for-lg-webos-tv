[**alexa-for-lg-webos-tv**](../../../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../../../modules.md) / [bridge/lib/services/shs-to-lg-webos-tv/tv-manager/tv-controller](../README.md) / TvController

# Class: TvController

## Extends

- `EventEmitter`

## Methods

### control()

> **control**(`udn`): [`TvControl`](../../tv-control/classes/TvControl.md)

#### Parameters

• **udn**: `string`

#### Returns

[`TvControl`](../../tv-control/classes/TvControl.md)

***

### controls()

> **controls**(): [`TvControl`](../../tv-control/classes/TvControl.md)[]

#### Returns

[`TvControl`](../../tv-control/classes/TvControl.md)[]

***

### start()

> **start**(): `void`

#### Returns

`void`

***

### tvUpsert()

> **tvUpsert**(`tv`): `Promise`\<`void`\>

#### Parameters

• **tv**: [`TvRecord`](../../tv-record/type-aliases/TvRecord.md)

#### Returns

`Promise`\<`void`\>

***

### build()

> `static` **build**(`_configurationDirectory`): `Promise`\<[`TvController`](TvController.md)\>

#### Parameters

• **\_configurationDirectory**: `string`

#### Returns

`Promise`\<[`TvController`](TvController.md)\>

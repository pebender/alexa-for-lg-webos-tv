[**alexa-for-lg-webos-tv**](../../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../../modules.md) / [bridge/lib/services/shs-to-lg-webos-tv/tv-manager](../README.md) / TvManager

# Class: TvManager

## Extends

- `EventEmitter`

## Constructors

### new TvManager()

> `private` **new TvManager**(`_configurationDirectory`, `_controller`, `_searcher`): [`TvManager`](TvManager.md)

#### Parameters

• **\_configurationDirectory**: `string`

• **\_controller**: [`TvController`](../tv-controller/classes/TvController.md)

• **\_searcher**: [`TvSearcher`](../tv-searcher/classes/TvSearcher.md)

#### Returns

[`TvManager`](TvManager.md)

#### Overrides

`EventEmitter.constructor`

## Properties

### \_configurationDirectory

> `private` `readonly` **\_configurationDirectory**: `string`

***

### \_controller

> `private` `readonly` **\_controller**: [`TvController`](../tv-controller/classes/TvController.md)

***

### \_searcher

> `private` `readonly` **\_searcher**: [`TvSearcher`](../tv-searcher/classes/TvSearcher.md)

## Methods

### control()

> **control**(`udn`): [`TvControl`](../tv-control/classes/TvControl.md)

#### Parameters

• **udn**: `string`

#### Returns

[`TvControl`](../tv-control/classes/TvControl.md)

***

### controls()

> **controls**(): [`TvControl`](../tv-control/classes/TvControl.md)[]

#### Returns

[`TvControl`](../tv-control/classes/TvControl.md)[]

***

### start()

> **start**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### build()

> `static` **build**(`_configurationDirectory`): `Promise`\<[`TvManager`](TvManager.md)\>

#### Parameters

• **\_configurationDirectory**: `string`

#### Returns

`Promise`\<[`TvManager`](TvManager.md)\>

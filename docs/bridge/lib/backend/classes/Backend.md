[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/lib/backend](../README.md) / Backend

# Class: Backend

## Extends

- `EventEmitter`

## Constructors

### new Backend()

> `private` **new Backend**(`_configurationDirectory`, `_controller`, `_searcher`): [`Backend`](Backend.md)

#### Parameters

• **\_configurationDirectory**: `string`

• **\_controller**: [`BackendController`](../backend-controller/classes/BackendController.md)

• **\_searcher**: [`BackendSearcher`](../backend-searcher/classes/BackendSearcher.md)

#### Returns

[`Backend`](Backend.md)

#### Overrides

`EventEmitter.constructor`

## Properties

### \_configurationDirectory

> `private` `readonly` **\_configurationDirectory**: `string`

***

### \_controller

> `private` `readonly` **\_controller**: [`BackendController`](../backend-controller/classes/BackendController.md)

***

### \_searcher

> `private` `readonly` **\_searcher**: [`BackendSearcher`](../backend-searcher/classes/BackendSearcher.md)

## Methods

### control()

> **control**(`udn`): [`BackendControl`](../backend-control/classes/BackendControl.md)

#### Parameters

• **udn**: `string`

#### Returns

[`BackendControl`](../backend-control/classes/BackendControl.md)

***

### controls()

> **controls**(): [`BackendControl`](../backend-control/classes/BackendControl.md)[]

#### Returns

[`BackendControl`](../backend-control/classes/BackendControl.md)[]

***

### start()

> **start**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### build()

> `static` **build**(`_configurationDirectory`): `Promise`\<[`Backend`](Backend.md)\>

#### Parameters

• **\_configurationDirectory**: `string`

#### Returns

`Promise`\<[`Backend`](Backend.md)\>

[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/lib/backend](../README.md) / Backend

# Class: Backend

## Extends

- `EventEmitter`

## Constructors

### new Backend()

> `private` **new Backend**(`_configuration`, `_controller`, `_searcher`): [`Backend`](Backend.md)

#### Parameters

• **\_configuration**: [`Configuration`](../../configuration/classes/Configuration.md)

• **\_controller**: [`BackendController`](../backend-controller/classes/BackendController.md)

• **\_searcher**: [`BackendSearcher`](../backend-searcher/classes/BackendSearcher.md)

#### Returns

[`Backend`](Backend.md)

#### Overrides

`EventEmitter.constructor`

## Properties

### \_configuration

> `private` `readonly` **\_configuration**: [`Configuration`](../../configuration/classes/Configuration.md)

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

> `static` **build**(`configuration`): `Promise`\<[`Backend`](Backend.md)\>

#### Parameters

• **configuration**: [`Configuration`](../../configuration/classes/Configuration.md)

#### Returns

`Promise`\<[`Backend`](Backend.md)\>

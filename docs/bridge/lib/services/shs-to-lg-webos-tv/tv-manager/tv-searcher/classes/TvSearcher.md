[**alexa-for-lg-webos-tv**](../../../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../../../modules.md) / [bridge/lib/services/shs-to-lg-webos-tv/tv-manager/tv-searcher](../README.md) / TvSearcher

# Class: TvSearcher

## Extends

- `EventEmitter`

## Constructors

### new TvSearcher()

> **new TvSearcher**(`_ssdpNotify`, `_ssdpResponse`): [`TvSearcher`](TvSearcher.md)

#### Parameters

• **\_ssdpNotify**: [`Server`](../../../../../../types/node-ssdp/classes/Server.md)

• **\_ssdpResponse**: [`Client`](../../../../../../types/node-ssdp/classes/Client.md)

#### Returns

[`TvSearcher`](TvSearcher.md)

#### Overrides

`EventEmitter.constructor`

## Properties

### \_ssdpNotify

> `private` `readonly` **\_ssdpNotify**: [`Server`](../../../../../../types/node-ssdp/classes/Server.md)

***

### \_ssdpResponse

> `private` `readonly` **\_ssdpResponse**: [`Client`](../../../../../../types/node-ssdp/classes/Client.md)

## Methods

### now()

> **now**(): `void`

#### Returns

`void`

***

### start()

> **start**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### build()

> `static` **build**(): [`TvSearcher`](TvSearcher.md)

#### Returns

[`TvSearcher`](TvSearcher.md)

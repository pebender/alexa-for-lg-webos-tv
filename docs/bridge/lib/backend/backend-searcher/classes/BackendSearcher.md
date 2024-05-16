[**alexa-for-lg-webos-tv**](../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../modules.md) / [bridge/lib/backend/backend-searcher](../README.md) / BackendSearcher

# Class: BackendSearcher

## Extends

- `EventEmitter`

## Constructors

### new BackendSearcher()

> **new BackendSearcher**(`_ssdpNotify`, `_ssdpResponse`): [`BackendSearcher`](BackendSearcher.md)

#### Parameters

• **\_ssdpNotify**: [`Server`](../../../../types/node-ssdp/classes/Server.md)

• **\_ssdpResponse**: [`Client`](../../../../types/node-ssdp/classes/Client.md)

#### Returns

[`BackendSearcher`](BackendSearcher.md)

#### Overrides

`EventEmitter.constructor`

## Properties

### \_ssdpNotify

> `private` `readonly` **\_ssdpNotify**: [`Server`](../../../../types/node-ssdp/classes/Server.md)

***

### \_ssdpResponse

> `private` `readonly` **\_ssdpResponse**: [`Client`](../../../../types/node-ssdp/classes/Client.md)

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

> `static` **build**(): [`BackendSearcher`](BackendSearcher.md)

#### Returns

[`BackendSearcher`](BackendSearcher.md)

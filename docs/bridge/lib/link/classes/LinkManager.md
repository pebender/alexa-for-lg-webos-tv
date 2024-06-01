[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/lib/link](../README.md) / LinkManager

# Class: LinkManager

## Constructors

### new LinkManager()

> `private` **new LinkManager**(`_links`, `_server`): [`LinkManager`](LinkManager.md)

The constructor is private. To instantiate a LinkManager, use [LinkManager.build](LinkManager.md#build)().

#### Parameters

• **\_links**: `Record`\<`string`, [`LinkDescription`](../interfaces/LinkDescription.md)\>

• **\_server**: `Express`

#### Returns

[`LinkManager`](LinkManager.md)

## Properties

### \_links

> `private` `readonly` **\_links**: `Record`\<`string`, [`LinkDescription`](../interfaces/LinkDescription.md)\>

***

### \_server

> `private` `readonly` **\_server**: `Express`

## Methods

### start()

> **start**(): `void`

#### Returns

`void`

***

### build()

> `static` **build**(`configurationDirectory`, `serviceApplications`): `Promise`\<[`LinkManager`](LinkManager.md)\>

#### Parameters

• **configurationDirectory**: `string`

• **serviceApplications**: `Record`\<`string`, [`Application`](../application/interfaces/Application.md)\>

#### Returns

`Promise`\<[`LinkManager`](LinkManager.md)\>

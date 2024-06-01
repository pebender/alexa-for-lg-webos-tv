[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/lib/link](../README.md) / LinkManager

# Class: LinkManager

## Constructors

### new LinkManager()

> `private` **new LinkManager**(`_loginTokenAuth`, `_bridgeTokenAuth`, `_links`, `_server`): [`LinkManager`](LinkManager.md)

The constructor is private. To instantiate a LinkManager, use [LinkManager.build](LinkManager.md#build)().

#### Parameters

• **\_loginTokenAuth**: [`LoginTokenAuth`](../login-token-auth/classes/LoginTokenAuth.md)

• **\_bridgeTokenAuth**: [`BridgeTokenAuth`](../bridge-token-auth/classes/BridgeTokenAuth.md)

• **\_links**: `Record`\<`string`, [`LinkDescription`](../interfaces/LinkDescription.md)\>

• **\_server**: `Express`

#### Returns

[`LinkManager`](LinkManager.md)

## Properties

### \_bridgeTokenAuth

> `private` `readonly` **\_bridgeTokenAuth**: [`BridgeTokenAuth`](../bridge-token-auth/classes/BridgeTokenAuth.md)

***

### \_links

> `private` `readonly` **\_links**: `Record`\<`string`, [`LinkDescription`](../interfaces/LinkDescription.md)\>

***

### \_loginTokenAuth

> `private` `readonly` **\_loginTokenAuth**: [`LoginTokenAuth`](../login-token-auth/classes/LoginTokenAuth.md)

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

• **serviceApplications**: `Record`\<`string`, [`Application`](../application/classes/Application.md)\>

#### Returns

`Promise`\<[`LinkManager`](LinkManager.md)\>

[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/lib/frontend](../README.md) / Frontend

# Class: Frontend

## Constructors

### new Frontend()

> `private` **new Frontend**(`_loginTokenAuth`, `_bridgeTokenAuth`, `_links`, `_server`): [`Frontend`](Frontend.md)

The constructor is private. To instantiate a Frontend, use [Frontend.build](Frontend.md#build)().

#### Parameters

• **\_loginTokenAuth**: [`LoginTokenAuth`](../login-token-auth/classes/LoginTokenAuth.md)

• **\_bridgeTokenAuth**: [`BridgeTokenAuth`](../bridge-token-auth/classes/BridgeTokenAuth.md)

• **\_links**: `Record`\<`string`, `LinkDescription`\>

• **\_server**: `Express`

#### Returns

[`Frontend`](Frontend.md)

## Properties

### \_bridgeTokenAuth

> `private` `readonly` **\_bridgeTokenAuth**: [`BridgeTokenAuth`](../bridge-token-auth/classes/BridgeTokenAuth.md)

***

### \_links

> `private` `readonly` **\_links**: `Record`\<`string`, `LinkDescription`\>

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

> `static` **build**(`configurationDirectory`, `serviceApplications`): `Promise`\<[`Frontend`](Frontend.md)\>

#### Parameters

• **configurationDirectory**: `string`

• **serviceApplications**: `Record`\<`string`, [`Application`](../application/classes/Application.md)\>

#### Returns

`Promise`\<[`Frontend`](Frontend.md)\>

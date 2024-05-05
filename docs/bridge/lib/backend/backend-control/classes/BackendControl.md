[**alexa-for-lg-webos-tv**](../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../modules.md) / [bridge/lib/backend/backend-control](../README.md) / BackendControl

# Class: BackendControl

## Extends

- `EventEmitter`

## Constructors

### new BackendControl()

> `private` **new BackendControl**(`_db`, `_tv`, `_connection`, `_ssdpNotify`, `_ssdpResponse`): [`BackendControl`](BackendControl.md)

#### Parameters

• **\_db**: [`DatabaseTable`](../../../database/classes/DatabaseTable.md)

• **\_tv**: [`TV`](../../tv/interfaces/TV.md)

• **\_connection**: [`export=`](../../../../types/lgtv2/classes/export=.md)

• **\_ssdpNotify**: [`Server`](../../../../types/node-ssdp/classes/Server.md)

• **\_ssdpResponse**: [`Client`](../../../../types/node-ssdp/classes/Client.md)

#### Returns

[`BackendControl`](BackendControl.md)

#### Overrides

`EventEmitter.constructor`

## Properties

### \_connecting

> `private` **\_connecting**: `boolean`

***

### \_connection

> `private` `readonly` **\_connection**: [`export=`](../../../../types/lgtv2/classes/export=.md)

***

### \_db

> `private` `readonly` **\_db**: [`DatabaseTable`](../../../database/classes/DatabaseTable.md)

***

### \_poweredOn

> `private` **\_poweredOn**: `boolean`

***

### \_ssdpNotify

> `private` `readonly` **\_ssdpNotify**: [`Server`](../../../../types/node-ssdp/classes/Server.md)

***

### \_ssdpResponse

> `private` `readonly` **\_ssdpResponse**: [`Client`](../../../../types/node-ssdp/classes/Client.md)

***

### \_tv

> `private` `readonly` **\_tv**: [`TV`](../../tv/interfaces/TV.md)

## Accessors

### tv

> `get` **tv**(): [`TV`](../../tv/interfaces/TV.md)

#### Returns

[`TV`](../../tv/interfaces/TV.md)

## Methods

### addSubscriptionEvents()

> `private` **addSubscriptionEvents**(): `void`

#### Returns

`void`

***

### getPowerState()

> **getPowerState**(): `"ON"` \| `"OFF"`

#### Returns

`"ON"` \| `"OFF"`

***

### lgtvCommand()

> **lgtvCommand**(`lgtvRequest`): `Promise`\<[`Response`](../../../../types/lgtv2/namespaces/export=/interfaces/Response.md)\>

#### Parameters

• **lgtvRequest**: [`Request`](../../../../types/lgtv2/namespaces/export=/interfaces/Request.md)

#### Returns

`Promise`\<[`Response`](../../../../types/lgtv2/namespaces/export=/interfaces/Response.md)\>

***

### start()

> **start**(): `void`

#### Returns

`void`

***

### turnOff()

> **turnOff**(): `boolean`

#### Returns

`boolean`

***

### turnOn()

> **turnOn**(): `Promise`\<`boolean`\>

#### Returns

`Promise`\<`boolean`\>

***

### build()

> `static` **build**(`db`, `tv`): [`BackendControl`](BackendControl.md)

#### Parameters

• **db**: [`DatabaseTable`](../../../database/classes/DatabaseTable.md)

• **tv**: [`TV`](../../tv/interfaces/TV.md)

#### Returns

[`BackendControl`](BackendControl.md)

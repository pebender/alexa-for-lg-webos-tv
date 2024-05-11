[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/types/lgtv2](../README.md) / export=

# Class: export=

## Extends

- `EventEmitter`

## Constructors

### new export=()

> **new export=**(`opts`?): [`export=`](export=.md)

#### Parameters

• **opts?**

• **opts.clientKey?**: `string`

• **opts.keyFile?**: `string`

• **opts.reconnect?**: `number`

• **opts.saveKey?**

• **opts.timeout?**: `number`

• **opts.url?**: `string`

#### Returns

[`export=`](export=.md)

#### Overrides

`EventEmitter.constructor`

## Properties

### clientKey

> **clientKey**: `string`

## Methods

### connect()

> **connect**(`host`): `void`

#### Parameters

• **host**: `string`

#### Returns

`void`

***

### disconnect()

> **disconnect**(): `void`

#### Returns

`void`

***

### getSocket()

> **getSocket**(`url`, `callback`?): `void`

#### Parameters

• **url**: `string`

• **callback?**

#### Returns

`void`

***

### on()

#### on(event, listener)

> **on**(`event`, `listener`): `this`

##### Parameters

• **event**: `"error"` \| `"close"`

• **listener**

##### Returns

`this`

##### Overrides

`EventEmitter.on`

#### on(event, listener)

> **on**(`event`, `listener`): `this`

##### Parameters

• **event**: `"connect"` \| `"prompt"`

• **listener**

##### Returns

`this`

##### Overrides

`EventEmitter.on`

#### on(event, listener)

> **on**(`event`, `listener`): `this`

##### Parameters

• **event**: `"connecting"`

• **listener**

##### Returns

`this`

##### Overrides

`EventEmitter.on`

***

### register()

> **register**(): `void`

#### Returns

`void`

***

### request()

#### request(uri, callback)

> **request**(`uri`, `callback`?): `void`

##### Parameters

• **uri**: `string`

• **callback?**

##### Returns

`void`

#### request(uri, payload, callback)

> **request**(`uri`, `payload`, `callback`): `void`

##### Parameters

• **uri**: `string`

• **payload**: [`RequestPayload`](../namespaces/export=/interfaces/RequestPayload.md)

• **callback**

##### Returns

`void`

***

### subscribe()

#### subscribe(uri, callback)

> **subscribe**(`uri`, `callback`): `void`

##### Parameters

• **uri**: `string`

• **callback**

##### Returns

`void`

#### subscribe(uri, payload, callback)

> **subscribe**(`uri`, `payload`, `callback`): `void`

##### Parameters

• **uri**: `string`

• **payload**: [`RequestPayload`](../namespaces/export=/interfaces/RequestPayload.md)

• **callback**

##### Returns

`void`

[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/types/node-ssdp](../README.md) / Client

# Class: Client

## Extends

- [`Base`](Base.md)

## Constructors

### new Client()

> **new Client**(`opts`?): [`Client`](Client.md)

#### Parameters

• **opts?**: [`ClientOptions`](../interfaces/ClientOptions.md)

#### Returns

[`Client`](Client.md)

#### Overrides

[`Base`](Base.md).[`constructor`](Base.md#constructors)

## Methods

### addUSN()

> **addUSN**(`device`): `void`

#### Parameters

• **device**: `string`

#### Returns

`void`

#### Inherited from

[`Base`](Base.md).[`addUSN`](Base.md#addusn)

***

### emit()

#### emit(event, headers, statusCode, rinfo)

> **emit**(`event`, `headers`, `statusCode`, `rinfo`): `boolean`

##### Parameters

• **event**: `"response"`

• **headers**: [`SsdpHeaders`](../interfaces/SsdpHeaders.md)

• **statusCode**: `number`

• **rinfo**: `RemoteInfo`

##### Returns

`boolean`

##### Overrides

`Base.emit`

#### emit(event, headers, rinfo)

> **emit**(`event`, `headers`, `rinfo`): `boolean`

##### Parameters

• **event**: `"advertise-alive"` \| `"advertise-bye"`

• **headers**: [`SsdpHeaders`](../interfaces/SsdpHeaders.md)

• **rinfo**: `RemoteInfo`

##### Returns

`boolean`

##### Overrides

`Base.emit`

***

### on()

#### on(event, listener)

> **on**(`event`, `listener`): `this`

##### Parameters

• **event**: `"response"`

• **listener**

##### Returns

`this`

##### Overrides

`Base.on`

#### on(event, listener)

> **on**(`event`, `listener`): `this`

##### Parameters

• **event**: `"advertise-alive"` \| `"advertise-bye"`

• **listener**

##### Returns

`this`

##### Overrides

`Base.on`

***

### once()

#### once(event, listener)

> **once**(`event`, `listener`): `this`

##### Parameters

• **event**: `"response"`

• **listener**

##### Returns

`this`

##### Overrides

`Base.once`

#### once(event, listener)

> **once**(`event`, `listener`): `this`

##### Parameters

• **event**: `"advertise-alive"` \| `"advertise-bye"`

• **listener**

##### Returns

`this`

##### Overrides

`Base.once`

***

### search()

> **search**(`serviceType`): `void` \| `Promise`\<`void`\>

#### Parameters

• **serviceType**: `string`

#### Returns

`void` \| `Promise`\<`void`\>

***

### start()

> **start**(`cb`?): `Promise`\<`void`\>

Start the listener for multicast notifications from SSDP devices

#### Parameters

• **cb?**

callback to socket.bind

#### Returns

`Promise`\<`void`\>

promise when socket.bind is ready

***

### stop()

> **stop**(): `void`

Close UDP socket.

#### Returns

`void`

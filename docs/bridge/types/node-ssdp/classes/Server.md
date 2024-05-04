[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/types/node-ssdp](../README.md) / Server

# Class: Server

## Extends

- [`Base`](Base.md)

## Constructors

### new Server()

> **new Server**(`opts`?): [`Server`](Server.md)

#### Parameters

• **opts?**: [`ServerOptions`](../interfaces/ServerOptions.md)

#### Returns

[`Server`](Server.md)

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

### advertise()

> **advertise**(`alive`?): `void`

#### Parameters

• **alive?**: `boolean`

#### Returns

`void`

***

### emit()

> **emit**(`event`, `headers`, `rinfo`): `boolean`

#### Parameters

• **event**: `"advertise-alive"` \| `"advertise-bye"`

• **headers**: [`SsdpHeaders`](../interfaces/SsdpHeaders.md)

• **rinfo**: `RemoteInfo`

#### Returns

`boolean`

#### Overrides

`Base.emit`

***

### on()

> **on**(`event`, `listener`): `this`

#### Parameters

• **event**: `"advertise-alive"` \| `"advertise-bye"`

• **listener**

#### Returns

`this`

#### Overrides

`Base.on`

***

### once()

> **once**(`event`, `listener`): `this`

#### Parameters

• **event**: `"advertise-alive"` \| `"advertise-bye"`

• **listener**

#### Returns

`this`

#### Overrides

`Base.once`

***

### start()

> **start**(`cb`?): `void` \| `Promise`\<`void`\>

Binds UDP socket to an interface/port and starts advertising.

#### Parameters

• **cb?**

callback to socket.bind

#### Returns

`void` \| `Promise`\<`void`\>

promise when socket.bind is ready

***

### stop()

> **stop**(): `void`

Advertise shutdown and close UDP socket.

#### Returns

`void`

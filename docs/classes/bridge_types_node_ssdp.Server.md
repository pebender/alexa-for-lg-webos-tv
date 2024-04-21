[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/types/node-ssdp](../modules/bridge_types_node_ssdp.md) / Server

# Class: Server

[bridge/types/node-ssdp](../modules/bridge_types_node_ssdp.md).Server

## Hierarchy

- [`Base`](bridge_types_node_ssdp.Base.md)

  ↳ **`Server`**

## Table of contents

### Constructors

- [constructor](bridge_types_node_ssdp.Server.md#constructor)

### Methods

- [addUSN](bridge_types_node_ssdp.Server.md#addusn)
- [advertise](bridge_types_node_ssdp.Server.md#advertise)
- [emit](bridge_types_node_ssdp.Server.md#emit)
- [on](bridge_types_node_ssdp.Server.md#on)
- [once](bridge_types_node_ssdp.Server.md#once)
- [start](bridge_types_node_ssdp.Server.md#start)
- [stop](bridge_types_node_ssdp.Server.md#stop)

## Constructors

### constructor

• **new Server**(`opts?`): [`Server`](bridge_types_node_ssdp.Server.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ServerOptions`](../interfaces/bridge_types_node_ssdp.ServerOptions.md) |

#### Returns

[`Server`](bridge_types_node_ssdp.Server.md)

#### Overrides

[Base](bridge_types_node_ssdp.Base.md).[constructor](bridge_types_node_ssdp.Base.md#constructor)

## Methods

### addUSN

▸ **addUSN**(`device`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `device` | `string` |

#### Returns

`void`

#### Inherited from

[Base](bridge_types_node_ssdp.Base.md).[addUSN](bridge_types_node_ssdp.Base.md#addusn)

___

### advertise

▸ **advertise**(`alive?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `alive?` | `boolean` |

#### Returns

`void`

___

### emit

▸ **emit**(`event`, `headers`, `rinfo`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"advertise-alive"`` \| ``"advertise-bye"`` |
| `headers` | [`SsdpHeaders`](../interfaces/bridge_types_node_ssdp.SsdpHeaders.md) |
| `rinfo` | `RemoteInfo` |

#### Returns

`boolean`

#### Overrides

Base.emit

___

### on

▸ **on**(`event`, `listener`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"advertise-alive"`` \| ``"advertise-bye"`` |
| `listener` | (`headers`: [`SsdpHeaders`](../interfaces/bridge_types_node_ssdp.SsdpHeaders.md), `rinfo`: `RemoteInfo`) => `void` |

#### Returns

`this`

#### Overrides

Base.on

___

### once

▸ **once**(`event`, `listener`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"advertise-alive"`` \| ``"advertise-bye"`` |
| `listener` | (`headers`: [`SsdpHeaders`](../interfaces/bridge_types_node_ssdp.SsdpHeaders.md), `rinfo`: `RemoteInfo`) => `void` |

#### Returns

`this`

#### Overrides

Base.once

___

### start

▸ **start**(`cb?`): `void` \| `Promise`\<`void`\>

Binds UDP socket to an interface/port and starts advertising.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cb?` | (`error`: `Error`) => `void` | callback to socket.bind |

#### Returns

`void` \| `Promise`\<`void`\>

promise when socket.bind is ready

___

### stop

▸ **stop**(): `void`

Advertise shutdown and close UDP socket.

#### Returns

`void`

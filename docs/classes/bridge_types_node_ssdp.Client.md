[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/types/node-ssdp](../modules/bridge_types_node_ssdp.md) / Client

# Class: Client

[bridge/types/node-ssdp](../modules/bridge_types_node_ssdp.md).Client

## Hierarchy

- [`Base`](bridge_types_node_ssdp.Base.md)

  ↳ **`Client`**

## Table of contents

### Constructors

- [constructor](bridge_types_node_ssdp.Client.md#constructor)

### Methods

- [addUSN](bridge_types_node_ssdp.Client.md#addusn)
- [emit](bridge_types_node_ssdp.Client.md#emit)
- [on](bridge_types_node_ssdp.Client.md#on)
- [once](bridge_types_node_ssdp.Client.md#once)
- [search](bridge_types_node_ssdp.Client.md#search)
- [start](bridge_types_node_ssdp.Client.md#start)
- [stop](bridge_types_node_ssdp.Client.md#stop)

## Constructors

### constructor

• **new Client**(`opts?`): [`Client`](bridge_types_node_ssdp.Client.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | [`ClientOptions`](../interfaces/bridge_types_node_ssdp.ClientOptions.md) |

#### Returns

[`Client`](bridge_types_node_ssdp.Client.md)

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

### emit

▸ **emit**(`event`, `headers`, `statusCode`, `rinfo`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"response"`` |
| `headers` | [`SsdpHeaders`](../interfaces/bridge_types_node_ssdp.SsdpHeaders.md) |
| `statusCode` | `number` |
| `rinfo` | `RemoteInfo` |

#### Returns

`boolean`

#### Overrides

Base.emit

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
| `event` | ``"response"`` |
| `listener` | (`headers`: [`SsdpHeaders`](../interfaces/bridge_types_node_ssdp.SsdpHeaders.md), `statusCode`: `number`, `rinfo`: `RemoteInfo`) => `void` |

#### Returns

`this`

#### Overrides

Base.on

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
| `event` | ``"response"`` |
| `listener` | (`headers`: [`SsdpHeaders`](../interfaces/bridge_types_node_ssdp.SsdpHeaders.md), `statusCode`: `number`, `rinfo`: `RemoteInfo`) => `void` |

#### Returns

`this`

#### Overrides

Base.once

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

### search

▸ **search**(`serviceType`): `void` \| `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `serviceType` | `string` |

#### Returns

`void` \| `Promise`\<`void`\>

___

### start

▸ **start**(`cb?`): `Promise`\<`void`\>

Start the listener for multicast notifications from SSDP devices

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `cb?` | (`error`: `Error`) => `void` | callback to socket.bind |

#### Returns

`Promise`\<`void`\>

promise when socket.bind is ready

___

### stop

▸ **stop**(): `void`

Close UDP socket.

#### Returns

`void`

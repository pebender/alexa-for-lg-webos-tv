[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/types/node-ssdp](../modules/bridge_types_node_ssdp.md) / ClientOptions

# Interface: ClientOptions

[bridge/types/node-ssdp](../modules/bridge_types_node_ssdp.md).ClientOptions

## Hierarchy

- [`SsdpOptions`](bridge_types_node_ssdp.SsdpOptions.md)

  ↳ **`ClientOptions`**

  ↳↳ [`ServerOptions`](bridge_types_node_ssdp.ServerOptions.md)

## Table of contents

### Properties

- [customLogger](bridge_types_node_ssdp.ClientOptions.md#customlogger)
- [description](bridge_types_node_ssdp.ClientOptions.md#description)
- [explicitSocketBind](bridge_types_node_ssdp.ClientOptions.md#explicitsocketbind)
- [headers](bridge_types_node_ssdp.ClientOptions.md#headers)
- [interfaces](bridge_types_node_ssdp.ClientOptions.md#interfaces)
- [reuseAddr](bridge_types_node_ssdp.ClientOptions.md#reuseaddr)
- [sourcePort](bridge_types_node_ssdp.ClientOptions.md#sourceport)
- [ssdpIp](bridge_types_node_ssdp.ClientOptions.md#ssdpip)
- [ssdpPort](bridge_types_node_ssdp.ClientOptions.md#ssdpport)
- [ssdpSig](bridge_types_node_ssdp.ClientOptions.md#ssdpsig)
- [ssdpTtl](bridge_types_node_ssdp.ClientOptions.md#ssdpttl)

## Properties

### customLogger

• `Optional` **customLogger**: (`format`: `string`, ...`args`: `any`[]) => `void`

A logger function to use instead of the default. The first argument to the function can contain a format string.

#### Type declaration

▸ (`format`, `...args`): `void`

##### Parameters

| Name | Type |
| :------ | :------ |
| `format` | `string` |
| `...args` | `any`[] |

##### Returns

`void`

#### Inherited from

[SsdpOptions](bridge_types_node_ssdp.SsdpOptions.md).[customLogger](bridge_types_node_ssdp.SsdpOptions.md#customlogger)

___

### description

• `Optional` **description**: `string`

Path to SSDP description file

#### Inherited from

[SsdpOptions](bridge_types_node_ssdp.SsdpOptions.md).[description](bridge_types_node_ssdp.SsdpOptions.md#description)

___

### explicitSocketBind

• `Optional` **explicitSocketBind**: `boolean`

Bind sockets to each discovered interface explicitly instead of relying on the system. Might help with issues with multiple NICs.

___

### headers

• `Optional` **headers**: [`SsdpHeaders`](bridge_types_node_ssdp.SsdpHeaders.md)

Additional headers

#### Inherited from

[SsdpOptions](bridge_types_node_ssdp.SsdpOptions.md).[headers](bridge_types_node_ssdp.SsdpOptions.md#headers)

___

### interfaces

• `Optional` **interfaces**: `string`[]

List of interfaces to explicitly bind. By default, bind to all available interfaces.

___

### reuseAddr

• `Optional` **reuseAddr**: `boolean`

When true socket.bind() will reuse the address, even if another process has already bound a socket on it.

**`Default Value`**

```ts
true
```

___

### sourcePort

• `Optional` **sourcePort**: `number`

#### Inherited from

[SsdpOptions](bridge_types_node_ssdp.SsdpOptions.md).[sourcePort](bridge_types_node_ssdp.SsdpOptions.md#sourceport)

___

### ssdpIp

• `Optional` **ssdpIp**: `string`

SSDP multicast group

**`Default Value`**

```ts
'239.255.255.250'
```

#### Inherited from

[SsdpOptions](bridge_types_node_ssdp.SsdpOptions.md).[ssdpIp](bridge_types_node_ssdp.SsdpOptions.md#ssdpip)

___

### ssdpPort

• `Optional` **ssdpPort**: `number`

SSDP port

**`Default Value`**

```ts
1900
```

#### Inherited from

[SsdpOptions](bridge_types_node_ssdp.SsdpOptions.md).[ssdpPort](bridge_types_node_ssdp.SsdpOptions.md#ssdpport)

___

### ssdpSig

• `Optional` **ssdpSig**: `string`

SSDP signature

**`Default Value`**

```ts
'node.js/NODE_VERSION UPnP/1.1 node-ssdp/PACKAGE_VERSION'
```

#### Inherited from

[SsdpOptions](bridge_types_node_ssdp.SsdpOptions.md).[ssdpSig](bridge_types_node_ssdp.SsdpOptions.md#ssdpsig)

___

### ssdpTtl

• `Optional` **ssdpTtl**: `number`

Multicast TTL

**`Default Value`**

```ts
4
```

#### Inherited from

[SsdpOptions](bridge_types_node_ssdp.SsdpOptions.md).[ssdpTtl](bridge_types_node_ssdp.SsdpOptions.md#ssdpttl)

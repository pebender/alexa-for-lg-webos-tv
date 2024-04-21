[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/types/node-ssdp](../modules/bridge_types_node_ssdp.md) / SsdpOptions

# Interface: SsdpOptions

[bridge/types/node-ssdp](../modules/bridge_types_node_ssdp.md).SsdpOptions

## Hierarchy

- **`SsdpOptions`**

  ↳ [`ClientOptions`](bridge_types_node_ssdp.ClientOptions.md)

## Table of contents

### Properties

- [customLogger](bridge_types_node_ssdp.SsdpOptions.md#customlogger)
- [description](bridge_types_node_ssdp.SsdpOptions.md#description)
- [headers](bridge_types_node_ssdp.SsdpOptions.md#headers)
- [sourcePort](bridge_types_node_ssdp.SsdpOptions.md#sourceport)
- [ssdpIp](bridge_types_node_ssdp.SsdpOptions.md#ssdpip)
- [ssdpPort](bridge_types_node_ssdp.SsdpOptions.md#ssdpport)
- [ssdpSig](bridge_types_node_ssdp.SsdpOptions.md#ssdpsig)
- [ssdpTtl](bridge_types_node_ssdp.SsdpOptions.md#ssdpttl)

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

___

### description

• `Optional` **description**: `string`

Path to SSDP description file

___

### headers

• `Optional` **headers**: [`SsdpHeaders`](bridge_types_node_ssdp.SsdpHeaders.md)

Additional headers

___

### sourcePort

• `Optional` **sourcePort**: `number`

___

### ssdpIp

• `Optional` **ssdpIp**: `string`

SSDP multicast group

**`Default Value`**

```ts
'239.255.255.250'
```

___

### ssdpPort

• `Optional` **ssdpPort**: `number`

SSDP port

**`Default Value`**

```ts
1900
```

___

### ssdpSig

• `Optional` **ssdpSig**: `string`

SSDP signature

**`Default Value`**

```ts
'node.js/NODE_VERSION UPnP/1.1 node-ssdp/PACKAGE_VERSION'
```

___

### ssdpTtl

• `Optional` **ssdpTtl**: `number`

Multicast TTL

**`Default Value`**

```ts
4
```

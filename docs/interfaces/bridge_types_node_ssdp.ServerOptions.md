[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/types/node-ssdp](../modules/bridge_types_node_ssdp.md) / ServerOptions

# Interface: ServerOptions

[bridge/types/node-ssdp](../modules/bridge_types_node_ssdp.md).ServerOptions

## Hierarchy

- [`ClientOptions`](bridge_types_node_ssdp.ClientOptions.md)

  ↳ **`ServerOptions`**

## Table of contents

### Properties

- [adInterval](bridge_types_node_ssdp.ServerOptions.md#adinterval)
- [allowWildcards](bridge_types_node_ssdp.ServerOptions.md#allowwildcards)
- [customLogger](bridge_types_node_ssdp.ServerOptions.md#customlogger)
- [description](bridge_types_node_ssdp.ServerOptions.md#description)
- [explicitSocketBind](bridge_types_node_ssdp.ServerOptions.md#explicitsocketbind)
- [headers](bridge_types_node_ssdp.ServerOptions.md#headers)
- [interfaces](bridge_types_node_ssdp.ServerOptions.md#interfaces)
- [location](bridge_types_node_ssdp.ServerOptions.md#location)
- [reuseAddr](bridge_types_node_ssdp.ServerOptions.md#reuseaddr)
- [sourcePort](bridge_types_node_ssdp.ServerOptions.md#sourceport)
- [ssdpIp](bridge_types_node_ssdp.ServerOptions.md#ssdpip)
- [ssdpPort](bridge_types_node_ssdp.ServerOptions.md#ssdpport)
- [ssdpSig](bridge_types_node_ssdp.ServerOptions.md#ssdpsig)
- [ssdpTtl](bridge_types_node_ssdp.ServerOptions.md#ssdpttl)
- [suppressRootDeviceAdvertisements](bridge_types_node_ssdp.ServerOptions.md#suppressrootdeviceadvertisements)
- [ttl](bridge_types_node_ssdp.ServerOptions.md#ttl)
- [udn](bridge_types_node_ssdp.ServerOptions.md#udn)

## Properties

### adInterval

• `Optional` **adInterval**: `number`

Interval at which to send out advertisement (ms)

**`Default Value`**

```ts
10000
```

___

### allowWildcards

• `Optional` **allowWildcards**: `boolean`

Allow wildcards in M-SEARCH packets (non-standard)

**`Default Value`**

```ts
false
```

___

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

[ClientOptions](bridge_types_node_ssdp.ClientOptions.md).[customLogger](bridge_types_node_ssdp.ClientOptions.md#customlogger)

___

### description

• `Optional` **description**: `string`

Path to SSDP description file

#### Inherited from

[ClientOptions](bridge_types_node_ssdp.ClientOptions.md).[description](bridge_types_node_ssdp.ClientOptions.md#description)

___

### explicitSocketBind

• `Optional` **explicitSocketBind**: `boolean`

Bind sockets to each discovered interface explicitly instead of relying on the system. Might help with issues with multiple NICs.

#### Inherited from

[ClientOptions](bridge_types_node_ssdp.ClientOptions.md).[explicitSocketBind](bridge_types_node_ssdp.ClientOptions.md#explicitsocketbind)

___

### headers

• `Optional` **headers**: [`SsdpHeaders`](bridge_types_node_ssdp.SsdpHeaders.md)

Additional headers

#### Inherited from

[ClientOptions](bridge_types_node_ssdp.ClientOptions.md).[headers](bridge_types_node_ssdp.ClientOptions.md#headers)

___

### interfaces

• `Optional` **interfaces**: `string`[]

List of interfaces to explicitly bind. By default, bind to all available interfaces.

#### Inherited from

[ClientOptions](bridge_types_node_ssdp.ClientOptions.md).[interfaces](bridge_types_node_ssdp.ClientOptions.md#interfaces)

___

### location

• `Optional` **location**: `string` \| [`ServiceDescriptionLocation`](bridge_types_node_ssdp.ServiceDescriptionLocation.md)

URL pointing to description of your service, or a function that returns that URL.
For cases where there are multiple network interfaces or the IP of the host isn't known in advance,
it's possible to specify location as an object. Host will be set to the IP of the responding interface.

___

### reuseAddr

• `Optional` **reuseAddr**: `boolean`

When true socket.bind() will reuse the address, even if another process has already bound a socket on it.

**`Default Value`**

```ts
true
```

#### Inherited from

[ClientOptions](bridge_types_node_ssdp.ClientOptions.md).[reuseAddr](bridge_types_node_ssdp.ClientOptions.md#reuseaddr)

___

### sourcePort

• `Optional` **sourcePort**: `number`

#### Inherited from

[ClientOptions](bridge_types_node_ssdp.ClientOptions.md).[sourcePort](bridge_types_node_ssdp.ClientOptions.md#sourceport)

___

### ssdpIp

• `Optional` **ssdpIp**: `string`

SSDP multicast group

**`Default Value`**

```ts
'239.255.255.250'
```

#### Inherited from

[ClientOptions](bridge_types_node_ssdp.ClientOptions.md).[ssdpIp](bridge_types_node_ssdp.ClientOptions.md#ssdpip)

___

### ssdpPort

• `Optional` **ssdpPort**: `number`

SSDP port

**`Default Value`**

```ts
1900
```

#### Inherited from

[ClientOptions](bridge_types_node_ssdp.ClientOptions.md).[ssdpPort](bridge_types_node_ssdp.ClientOptions.md#ssdpport)

___

### ssdpSig

• `Optional` **ssdpSig**: `string`

SSDP signature

**`Default Value`**

```ts
'node.js/NODE_VERSION UPnP/1.1 node-ssdp/PACKAGE_VERSION'
```

#### Inherited from

[ClientOptions](bridge_types_node_ssdp.ClientOptions.md).[ssdpSig](bridge_types_node_ssdp.ClientOptions.md#ssdpsig)

___

### ssdpTtl

• `Optional` **ssdpTtl**: `number`

Multicast TTL

**`Default Value`**

```ts
4
```

#### Inherited from

[ClientOptions](bridge_types_node_ssdp.ClientOptions.md).[ssdpTtl](bridge_types_node_ssdp.ClientOptions.md#ssdpttl)

___

### suppressRootDeviceAdvertisements

• `Optional` **suppressRootDeviceAdvertisements**: `boolean`

When true the SSDP server will not advertise the root device (i.e. the bare UDN). In some scenarios, this advertisement is not needed.

**`Default Value`**

```ts
false
```

___

### ttl

• `Optional` **ttl**: `number`

Packet TTL

**`Default Value`**

```ts
1800
```

___

### udn

• `Optional` **udn**: `string`

SSDP Unique Device Name

**`Default Value`**

```ts
'uuid:f40c2981-7329-40b7-8b04-27f187aecfb5'
```

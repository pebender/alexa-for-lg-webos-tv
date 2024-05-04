[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/types/node-ssdp](../README.md) / ClientOptions

# Interface: ClientOptions

## Extends

- [`SsdpOptions`](SsdpOptions.md)

## Properties

### customLogger()?

> `optional` **customLogger**: (`format`, ...`args`) => `void`

A logger function to use instead of the default. The first argument to the function can contain a format string.

#### Parameters

• **format**: `string`

• ...**args**: `any`[]

#### Returns

`void`

#### Inherited from

[`SsdpOptions`](SsdpOptions.md).[`customLogger`](SsdpOptions.md#customlogger)

***

### description?

> `optional` **description**: `string`

Path to SSDP description file

#### Inherited from

[`SsdpOptions`](SsdpOptions.md).[`description`](SsdpOptions.md#description)

***

### explicitSocketBind?

> `optional` **explicitSocketBind**: `boolean`

Bind sockets to each discovered interface explicitly instead of relying on the system. Might help with issues with multiple NICs.

***

### headers?

> `optional` **headers**: [`SsdpHeaders`](SsdpHeaders.md)

Additional headers

#### Inherited from

[`SsdpOptions`](SsdpOptions.md).[`headers`](SsdpOptions.md#headers)

***

### interfaces?

> `optional` **interfaces**: `string`[]

List of interfaces to explicitly bind. By default, bind to all available interfaces.

***

### reuseAddr?

> `optional` **reuseAddr**: `boolean`

When true socket.bind() will reuse the address, even if another process has already bound a socket on it.

#### Default Value

```ts
true
```

***

### sourcePort?

> `optional` **sourcePort**: `number`

#### Inherited from

[`SsdpOptions`](SsdpOptions.md).[`sourcePort`](SsdpOptions.md#sourceport)

***

### ssdpIp?

> `optional` **ssdpIp**: `string`

SSDP multicast group

#### Default Value

```ts
'239.255.255.250'
```

#### Inherited from

[`SsdpOptions`](SsdpOptions.md).[`ssdpIp`](SsdpOptions.md#ssdpip)

***

### ssdpPort?

> `optional` **ssdpPort**: `number`

SSDP port

#### Default Value

```ts
1900
```

#### Inherited from

[`SsdpOptions`](SsdpOptions.md).[`ssdpPort`](SsdpOptions.md#ssdpport)

***

### ssdpSig?

> `optional` **ssdpSig**: `string`

SSDP signature

#### Default Value

```ts
'node.js/NODE_VERSION UPnP/1.1 node-ssdp/PACKAGE_VERSION'
```

#### Inherited from

[`SsdpOptions`](SsdpOptions.md).[`ssdpSig`](SsdpOptions.md#ssdpsig)

***

### ssdpTtl?

> `optional` **ssdpTtl**: `number`

Multicast TTL

#### Default Value

```ts
4
```

#### Inherited from

[`SsdpOptions`](SsdpOptions.md).[`ssdpTtl`](SsdpOptions.md#ssdpttl)

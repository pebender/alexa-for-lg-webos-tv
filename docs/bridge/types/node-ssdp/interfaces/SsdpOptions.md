[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/types/node-ssdp](../README.md) / SsdpOptions

# Interface: SsdpOptions

## Extended by

- [`ClientOptions`](ClientOptions.md)

## Properties

### customLogger()?

> `optional` **customLogger**: (`format`, ...`args`) => `void`

A logger function to use instead of the default. The first argument to the
function can contain a format string.

#### Parameters

• **format**: `string`

• ...**args**: `any`[]

#### Returns

`void`

***

### description?

> `optional` **description**: `string`

Path to SSDP description file

***

### headers?

> `optional` **headers**: [`SsdpHeaders`](SsdpHeaders.md)

Additional headers

***

### ssdpIp?

> `optional` **ssdpIp**: `string`

SSDP multicast group

#### Default Value

```ts
'239.255.255.250'
```

***

### ssdpPort?

> `optional` **ssdpPort**: `number`

SSDP port

#### Default Value

```ts
1900
```

***

### ssdpSig?

> `optional` **ssdpSig**: `string`

SSDP signature

#### Default Value

```ts
'node.js/NODE_VERSION UPnP/1.1 node-ssdp/PACKAGE_VERSION'
```

***

### ssdpTtl?

> `optional` **ssdpTtl**: `number`

Multicast TTL

#### Default Value

```ts
4
```

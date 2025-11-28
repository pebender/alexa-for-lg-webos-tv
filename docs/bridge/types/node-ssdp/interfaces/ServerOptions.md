[**alexa-for-lg-webos-tv**](../../../../README.md)

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/types/node-ssdp](../README.md) / ServerOptions

# Interface: ServerOptions

## Extends

- [`ClientOptions`](ClientOptions.md)

## Properties

### adInterval?

> `optional` **adInterval**: `number`

Interval at which to send out advertisement (ms)

#### Default Value

```ts
10000
```

***

### allowWildcards?

> `optional` **allowWildcards**: `boolean`

Allow wildcards in M-SEARCH packets (non-standard)

#### Default Value

```ts
false
```

***

### customLogger()?

> `optional` **customLogger**: (`format`, ...`args`) => `void`

A logger function to use instead of the default. The first argument to the
function can contain a format string.

#### Parameters

##### format

`string`

##### args

...`unknown`[]

#### Returns

`void`

#### Inherited from

[`ClientOptions`](ClientOptions.md).[`customLogger`](ClientOptions.md#customlogger)

***

### description?

> `optional` **description**: `string`

Path to SSDP description file

#### Inherited from

[`ClientOptions`](ClientOptions.md).[`description`](ClientOptions.md#description)

***

### explicitSocketBind?

> `optional` **explicitSocketBind**: `boolean`

Bind sockets to each discovered interface explicitly instead of relying on
the system. Might help with issues with multiple NICs.

#### Inherited from

[`ClientOptions`](ClientOptions.md).[`explicitSocketBind`](ClientOptions.md#explicitsocketbind)

***

### headers?

> `optional` **headers**: [`SsdpHeaders`](SsdpHeaders.md)

Additional headers

#### Inherited from

[`ClientOptions`](ClientOptions.md).[`headers`](ClientOptions.md#headers)

***

### interfaces?

> `optional` **interfaces**: `string`[]

List of interfaces to explicitly bind. By default, bind to all available
interfaces.

#### Inherited from

[`ClientOptions`](ClientOptions.md).[`interfaces`](ClientOptions.md#interfaces)

***

### location?

> `optional` **location**: `string` \| [`ServiceDescriptionLocation`](ServiceDescriptionLocation.md)

URL pointing to description of your service, or a function that returns
that URL. For cases where there are multiple network interfaces or the IP
of the host isn't known in advance, it's possible to specify location as an
object. Host will be set to the IP of the responding interface.

***

### reuseAddr?

> `optional` **reuseAddr**: `boolean`

When true socket.bind() will reuse the address, even if another process has
already bound a socket on it.

#### Default Value

```ts
true
```

#### Inherited from

[`ClientOptions`](ClientOptions.md).[`reuseAddr`](ClientOptions.md#reuseaddr)

***

### ssdpIp?

> `optional` **ssdpIp**: `string`

SSDP multicast group

#### Default Value

```ts
'239.255.255.250'
```

#### Inherited from

[`ClientOptions`](ClientOptions.md).[`ssdpIp`](ClientOptions.md#ssdpip)

***

### ssdpPort?

> `optional` **ssdpPort**: `number`

SSDP port

#### Default Value

```ts
1900
```

#### Inherited from

[`ClientOptions`](ClientOptions.md).[`ssdpPort`](ClientOptions.md#ssdpport)

***

### ssdpSig?

> `optional` **ssdpSig**: `string`

SSDP signature

#### Default Value

```ts
'node.js/NODE_VERSION UPnP/1.1 node-ssdp/PACKAGE_VERSION'
```

#### Inherited from

[`ClientOptions`](ClientOptions.md).[`ssdpSig`](ClientOptions.md#ssdpsig)

***

### ssdpTtl?

> `optional` **ssdpTtl**: `number`

Multicast TTL

#### Default Value

```ts
4
```

#### Inherited from

[`ClientOptions`](ClientOptions.md).[`ssdpTtl`](ClientOptions.md#ssdpttl)

***

### suppressRootDeviceAdvertisements?

> `optional` **suppressRootDeviceAdvertisements**: `boolean`

When true the SSDP server will not advertise the root device (i.e. the bare
UDN). In some scenarios, this advertisement is not needed.

#### Default Value

```ts
false
```

***

### ttl?

> `optional` **ttl**: `number`

Packet TTL

#### Default Value

```ts
1800
```

***

### udn?

> `optional` **udn**: `string`

SSDP Unique Device Name

#### Default Value

```ts
'uuid:f40c2981-7329-40b7-8b04-27f187aecfb5'
```

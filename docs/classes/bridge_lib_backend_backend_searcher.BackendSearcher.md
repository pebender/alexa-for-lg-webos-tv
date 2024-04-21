[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/lib/backend/backend-searcher](../modules/bridge_lib_backend_backend_searcher.md) / BackendSearcher

# Class: BackendSearcher

[bridge/lib/backend/backend-searcher](../modules/bridge_lib_backend_backend_searcher.md).BackendSearcher

## Hierarchy

- `EventEmitter`

  ↳ **`BackendSearcher`**

## Table of contents

### Constructors

- [constructor](bridge_lib_backend_backend_searcher.BackendSearcher.md#constructor)

### Properties

- [\_ssdpNotify](bridge_lib_backend_backend_searcher.BackendSearcher.md#_ssdpnotify)
- [\_ssdpResponse](bridge_lib_backend_backend_searcher.BackendSearcher.md#_ssdpresponse)

### Methods

- [now](bridge_lib_backend_backend_searcher.BackendSearcher.md#now)
- [start](bridge_lib_backend_backend_searcher.BackendSearcher.md#start)
- [build](bridge_lib_backend_backend_searcher.BackendSearcher.md#build)

## Constructors

### constructor

• **new BackendSearcher**(`_ssdpNotify`, `_ssdpResponse`): [`BackendSearcher`](bridge_lib_backend_backend_searcher.BackendSearcher.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_ssdpNotify` | [`Client`](bridge_types_node_ssdp.Client.md) |
| `_ssdpResponse` | [`Client`](bridge_types_node_ssdp.Client.md) |

#### Returns

[`BackendSearcher`](bridge_lib_backend_backend_searcher.BackendSearcher.md)

#### Overrides

EventEmitter.constructor

## Properties

### \_ssdpNotify

• `Private` **\_ssdpNotify**: [`Client`](bridge_types_node_ssdp.Client.md)

___

### \_ssdpResponse

• `Private` **\_ssdpResponse**: [`Client`](bridge_types_node_ssdp.Client.md)

## Methods

### now

▸ **now**(): `void`

#### Returns

`void`

___

### start

▸ **start**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

___

### build

▸ **build**(): `Promise`\<[`BackendSearcher`](bridge_lib_backend_backend_searcher.BackendSearcher.md)\>

#### Returns

`Promise`\<[`BackendSearcher`](bridge_lib_backend_backend_searcher.BackendSearcher.md)\>

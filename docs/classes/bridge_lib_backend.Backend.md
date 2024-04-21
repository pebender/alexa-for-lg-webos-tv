[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/lib/backend](../modules/bridge_lib_backend.md) / Backend

# Class: Backend

[bridge/lib/backend](../modules/bridge_lib_backend.md).Backend

## Hierarchy

- `EventEmitter`

  ↳ **`Backend`**

## Table of contents

### Constructors

- [constructor](bridge_lib_backend.Backend.md#constructor)

### Properties

- [\_configuration](bridge_lib_backend.Backend.md#_configuration)
- [\_controller](bridge_lib_backend.Backend.md#_controller)
- [\_searcher](bridge_lib_backend.Backend.md#_searcher)

### Methods

- [control](bridge_lib_backend.Backend.md#control)
- [controls](bridge_lib_backend.Backend.md#controls)
- [start](bridge_lib_backend.Backend.md#start)
- [build](bridge_lib_backend.Backend.md#build)

## Constructors

### constructor

• **new Backend**(`_configuration`, `_controller`, `_searcher`): [`Backend`](bridge_lib_backend.Backend.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_configuration` | [`Configuration`](bridge_lib_configuration.Configuration.md) |
| `_controller` | [`BackendController`](bridge_lib_backend_backend_controller.BackendController.md) |
| `_searcher` | [`BackendSearcher`](bridge_lib_backend_backend_searcher.BackendSearcher.md) |

#### Returns

[`Backend`](bridge_lib_backend.Backend.md)

#### Overrides

EventEmitter.constructor

## Properties

### \_configuration

• `Private` `Readonly` **\_configuration**: [`Configuration`](bridge_lib_configuration.Configuration.md)

___

### \_controller

• `Private` `Readonly` **\_controller**: [`BackendController`](bridge_lib_backend_backend_controller.BackendController.md)

___

### \_searcher

• `Private` `Readonly` **\_searcher**: [`BackendSearcher`](bridge_lib_backend_backend_searcher.BackendSearcher.md)

## Methods

### control

▸ **control**(`udn`): [`BackendControl`](bridge_lib_backend_backend_control.BackendControl.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `udn` | `string` |

#### Returns

[`BackendControl`](bridge_lib_backend_backend_control.BackendControl.md)

___

### controls

▸ **controls**(): [`BackendControl`](bridge_lib_backend_backend_control.BackendControl.md)[]

#### Returns

[`BackendControl`](bridge_lib_backend_backend_control.BackendControl.md)[]

___

### start

▸ **start**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

___

### build

▸ **build**(`configuration`): `Promise`\<[`Backend`](bridge_lib_backend.Backend.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [`Configuration`](bridge_lib_configuration.Configuration.md) |

#### Returns

`Promise`\<[`Backend`](bridge_lib_backend.Backend.md)\>

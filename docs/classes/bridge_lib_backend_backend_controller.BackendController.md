[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/lib/backend/backend-controller](../modules/bridge_lib_backend_backend_controller.md) / BackendController

# Class: BackendController

[bridge/lib/backend/backend-controller](../modules/bridge_lib_backend_backend_controller.md).BackendController

## Hierarchy

- `EventEmitter`

  ↳ **`BackendController`**

## Table of contents

### Constructors

- [constructor](bridge_lib_backend_backend_controller.BackendController.md#constructor)

### Properties

- [\_controls](bridge_lib_backend_backend_controller.BackendController.md#_controls)
- [\_db](bridge_lib_backend_backend_controller.BackendController.md#_db)

### Methods

- [control](bridge_lib_backend_backend_controller.BackendController.md#control)
- [controls](bridge_lib_backend_backend_controller.BackendController.md#controls)
- [eventsAdd](bridge_lib_backend_backend_controller.BackendController.md#eventsadd)
- [start](bridge_lib_backend_backend_controller.BackendController.md#start)
- [throwIfNotKnownTV](bridge_lib_backend_backend_controller.BackendController.md#throwifnotknowntv)
- [tvUpsert](bridge_lib_backend_backend_controller.BackendController.md#tvupsert)
- [build](bridge_lib_backend_backend_controller.BackendController.md#build)

## Constructors

### constructor

• **new BackendController**(`_db`, `_controls`): [`BackendController`](bridge_lib_backend_backend_controller.BackendController.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_db` | [`DatabaseTable`](bridge_lib_database.DatabaseTable.md) |
| `_controls` | `Object` |

#### Returns

[`BackendController`](bridge_lib_backend_backend_controller.BackendController.md)

#### Overrides

EventEmitter.constructor

## Properties

### \_controls

• `Private` `Readonly` **\_controls**: `Object`

#### Index signature

▪ [x: `string`]: [`BackendControl`](bridge_lib_backend_backend_control.BackendControl.md)

___

### \_db

• `Private` `Readonly` **\_db**: [`DatabaseTable`](bridge_lib_database.DatabaseTable.md)

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

### eventsAdd

▸ **eventsAdd**(`udn`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `udn` | `string` |

#### Returns

`void`

___

### start

▸ **start**(): `void`

#### Returns

`void`

___

### throwIfNotKnownTV

▸ **throwIfNotKnownTV**(`methodName`, `udn`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `methodName` | `string` |
| `udn` | `string` |

#### Returns

`void`

___

### tvUpsert

▸ **tvUpsert**(`tv`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `tv` | [`TV`](../interfaces/bridge_lib_backend_tv.TV.md) |

#### Returns

`Promise`\<`void`\>

___

### build

▸ **build**(): `Promise`\<[`BackendController`](bridge_lib_backend_backend_controller.BackendController.md)\>

#### Returns

`Promise`\<[`BackendController`](bridge_lib_backend_backend_controller.BackendController.md)\>

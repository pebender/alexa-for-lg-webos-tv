[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/lib/backend/backend-control](../modules/bridge_lib_backend_backend_control.md) / BackendControl

# Class: BackendControl

[bridge/lib/backend/backend-control](../modules/bridge_lib_backend_backend_control.md).BackendControl

## Hierarchy

- `EventEmitter`

  ↳ **`BackendControl`**

## Table of contents

### Constructors

- [constructor](bridge_lib_backend_backend_control.BackendControl.md#constructor)

### Properties

- [\_connecting](bridge_lib_backend_backend_control.BackendControl.md#_connecting)
- [\_connection](bridge_lib_backend_backend_control.BackendControl.md#_connection)
- [\_db](bridge_lib_backend_backend_control.BackendControl.md#_db)
- [\_poweredOn](bridge_lib_backend_backend_control.BackendControl.md#_poweredon)
- [\_ssdpNotify](bridge_lib_backend_backend_control.BackendControl.md#_ssdpnotify)
- [\_ssdpResponse](bridge_lib_backend_backend_control.BackendControl.md#_ssdpresponse)
- [\_tv](bridge_lib_backend_backend_control.BackendControl.md#_tv)

### Accessors

- [tv](bridge_lib_backend_backend_control.BackendControl.md#tv)

### Methods

- [addSubscriptionEvents](bridge_lib_backend_backend_control.BackendControl.md#addsubscriptionevents)
- [getPowerState](bridge_lib_backend_backend_control.BackendControl.md#getpowerstate)
- [lgtvCommand](bridge_lib_backend_backend_control.BackendControl.md#lgtvcommand)
- [start](bridge_lib_backend_backend_control.BackendControl.md#start)
- [turnOff](bridge_lib_backend_backend_control.BackendControl.md#turnoff)
- [turnOn](bridge_lib_backend_backend_control.BackendControl.md#turnon)
- [build](bridge_lib_backend_backend_control.BackendControl.md#build)

## Constructors

### constructor

• **new BackendControl**(`_db`, `_tv`, `_connection`, `_ssdpNotify`, `_ssdpResponse`): [`BackendControl`](bridge_lib_backend_backend_control.BackendControl.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_db` | [`DatabaseTable`](bridge_lib_database.DatabaseTable.md) |
| `_tv` | [`TV`](../interfaces/bridge_lib_tv.TV.md) |
| `_connection` | [`export=`](bridge_types_lgtv2.export_-1.md) |
| `_ssdpNotify` | [`Client`](bridge_types_node_ssdp.Client.md) |
| `_ssdpResponse` | [`Client`](bridge_types_node_ssdp.Client.md) |

#### Returns

[`BackendControl`](bridge_lib_backend_backend_control.BackendControl.md)

#### Overrides

EventEmitter.constructor

## Properties

### \_connecting

• `Private` **\_connecting**: `boolean`

___

### \_connection

• `Private` `Readonly` **\_connection**: [`export=`](bridge_types_lgtv2.export_-1.md)

___

### \_db

• `Private` `Readonly` **\_db**: [`DatabaseTable`](bridge_lib_database.DatabaseTable.md)

___

### \_poweredOn

• `Private` **\_poweredOn**: `boolean`

___

### \_ssdpNotify

• `Private` `Readonly` **\_ssdpNotify**: [`Client`](bridge_types_node_ssdp.Client.md)

___

### \_ssdpResponse

• `Private` `Readonly` **\_ssdpResponse**: [`Client`](bridge_types_node_ssdp.Client.md)

___

### \_tv

• `Private` `Readonly` **\_tv**: [`TV`](../interfaces/bridge_lib_tv.TV.md)

## Accessors

### tv

• `get` **tv**(): [`TV`](../interfaces/bridge_lib_tv.TV.md)

#### Returns

[`TV`](../interfaces/bridge_lib_tv.TV.md)

## Methods

### addSubscriptionEvents

▸ **addSubscriptionEvents**(): `void`

#### Returns

`void`

___

### getPowerState

▸ **getPowerState**(): ``"ON"`` \| ``"OFF"``

#### Returns

``"ON"`` \| ``"OFF"``

___

### lgtvCommand

▸ **lgtvCommand**(`lgtvRequest`): `Promise`\<[`Response`](../interfaces/bridge_types_lgtv2.export_.Response.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `lgtvRequest` | [`Request`](../interfaces/bridge_types_lgtv2.export_.Request.md) |

#### Returns

`Promise`\<[`Response`](../interfaces/bridge_types_lgtv2.export_.Response.md)\>

___

### start

▸ **start**(): `void`

#### Returns

`void`

___

### turnOff

▸ **turnOff**(): `boolean`

#### Returns

`boolean`

___

### turnOn

▸ **turnOn**(): `Promise`\<`boolean`\>

#### Returns

`Promise`\<`boolean`\>

___

### build

▸ **build**(`db`, `tv`): [`BackendControl`](bridge_lib_backend_backend_control.BackendControl.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `db` | [`DatabaseTable`](bridge_lib_database.DatabaseTable.md) |
| `tv` | [`TV`](../interfaces/bridge_lib_tv.TV.md) |

#### Returns

[`BackendControl`](bridge_lib_backend_backend_control.BackendControl.md)

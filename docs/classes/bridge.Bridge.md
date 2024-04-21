[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge](../modules/bridge.md) / Bridge

# Class: Bridge

[bridge](../modules/bridge.md).Bridge

## Table of contents

### Constructors

- [constructor](bridge.Bridge.md#constructor)

### Properties

- [\_backend](bridge.Bridge.md#_backend)
- [\_configuration](bridge.Bridge.md#_configuration)
- [\_frontend](bridge.Bridge.md#_frontend)
- [\_middle](bridge.Bridge.md#_middle)

### Methods

- [start](bridge.Bridge.md#start)
- [build](bridge.Bridge.md#build)

## Constructors

### constructor

• **new Bridge**(`_configuration`, `_backend`, `_middle`, `_frontend`): [`Bridge`](bridge.Bridge.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_configuration` | [`Configuration`](bridge_lib_configuration.Configuration.md) |
| `_backend` | [`Backend`](bridge_lib_backend.Backend.md) |
| `_middle` | [`Middle`](bridge_lib_middle.Middle.md) |
| `_frontend` | [`Frontend`](bridge_lib_frontend.Frontend.md) |

#### Returns

[`Bridge`](bridge.Bridge.md)

## Properties

### \_backend

• `Private` `Readonly` **\_backend**: [`Backend`](bridge_lib_backend.Backend.md)

___

### \_configuration

• `Private` `Readonly` **\_configuration**: [`Configuration`](bridge_lib_configuration.Configuration.md)

___

### \_frontend

• `Private` `Readonly` **\_frontend**: [`Frontend`](bridge_lib_frontend.Frontend.md)

___

### \_middle

• `Private` `Readonly` **\_middle**: [`Middle`](bridge_lib_middle.Middle.md)

## Methods

### start

▸ **start**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

___

### build

▸ **build**(): `Promise`\<[`Bridge`](bridge.Bridge.md)\>

#### Returns

`Promise`\<[`Bridge`](bridge.Bridge.md)\>

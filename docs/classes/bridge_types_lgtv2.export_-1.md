[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/types/lgtv2](../modules/bridge_types_lgtv2.md) / export=

# Class: export=

[bridge/types/lgtv2](../modules/bridge_types_lgtv2.md).export=

## Hierarchy

- `EventEmitter`

  ↳ **`export=`**

## Table of contents

### Constructors

- [constructor](bridge_types_lgtv2.export_-1.md#constructor)

### Properties

- [clientKey](bridge_types_lgtv2.export_-1.md#clientkey)

### Methods

- [connect](bridge_types_lgtv2.export_-1.md#connect)
- [disconnect](bridge_types_lgtv2.export_-1.md#disconnect)
- [getSocket](bridge_types_lgtv2.export_-1.md#getsocket)
- [on](bridge_types_lgtv2.export_-1.md#on)
- [register](bridge_types_lgtv2.export_-1.md#register)
- [request](bridge_types_lgtv2.export_-1.md#request)
- [subscribe](bridge_types_lgtv2.export_-1.md#subscribe)

## Constructors

### constructor

• **new export=**(`opts?`): [`export=`](bridge_types_lgtv2.export_-1.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts?` | `Object` |
| `opts.clientKey?` | `string` |
| `opts.keyFile?` | `string` |
| `opts.reconnect?` | `number` |
| `opts.saveKey?` | (`key`: `string`, `callback`: (`error`: `Error`) => `void`) => `void` |
| `opts.timeout?` | `number` |
| `opts.url?` | `string` |

#### Returns

[`export=`](bridge_types_lgtv2.export_-1.md)

#### Overrides

EventEmitter.constructor

## Properties

### clientKey

• **clientKey**: `string`

## Methods

### connect

▸ **connect**(`host`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `host` | `string` |

#### Returns

`void`

___

### disconnect

▸ **disconnect**(): `void`

#### Returns

`void`

___

### getSocket

▸ **getSocket**(`url`, `callback?`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `url` | `string` |
| `callback?` | (`error`: `Error`, `response`: [`Response`](../interfaces/bridge_types_lgtv2.export_.Response.md)) => `void` |

#### Returns

`void`

___

### on

▸ **on**(`event`, `listener`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"close"`` |
| `listener` | (`error`: `Error`) => `void` |

#### Returns

`this`

#### Overrides

EventEmitter.on

▸ **on**(`event`, `listener`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"connect"`` |
| `listener` | () => `void` |

#### Returns

`this`

#### Overrides

EventEmitter.on

▸ **on**(`event`, `listener`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"connecting"`` |
| `listener` | (`host`: `string`) => `void` |

#### Returns

`this`

#### Overrides

EventEmitter.on

▸ **on**(`event`, `listener`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"error"`` |
| `listener` | (`error`: `Error`) => `void` |

#### Returns

`this`

#### Overrides

EventEmitter.on

▸ **on**(`event`, `listener`): `this`

#### Parameters

| Name | Type |
| :------ | :------ |
| `event` | ``"prompt"`` |
| `listener` | () => `void` |

#### Returns

`this`

#### Overrides

EventEmitter.on

___

### register

▸ **register**(): `void`

#### Returns

`void`

___

### request

▸ **request**(`uri`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `uri` | `string` |

#### Returns

`void`

▸ **request**(`uri`, `callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `uri` | `string` |
| `callback` | (`error`: `Error`, `response`: [`Response`](../interfaces/bridge_types_lgtv2.export_.Response.md)) => `void` |

#### Returns

`void`

▸ **request**(`uri`, `payload`, `callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `uri` | `string` |
| `payload` | [`RequestPayload`](../interfaces/bridge_types_lgtv2.export_.RequestPayload.md) |
| `callback` | (`error`: `Error`, `response`: [`Response`](../interfaces/bridge_types_lgtv2.export_.Response.md)) => `void` |

#### Returns

`void`

___

### subscribe

▸ **subscribe**(`uri`, `callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `uri` | `string` |
| `callback` | (`error`: `Error`, `response`: [`Response`](../interfaces/bridge_types_lgtv2.export_.Response.md)) => `void` |

#### Returns

`void`

▸ **subscribe**(`uri`, `payload`, `callback`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `uri` | `string` |
| `payload` | [`RequestPayload`](../interfaces/bridge_types_lgtv2.export_.RequestPayload.md) |
| `callback` | (`error`: `Error`, `response`: [`Response`](../interfaces/bridge_types_lgtv2.export_.Response.md)) => `void` |

#### Returns

`void`

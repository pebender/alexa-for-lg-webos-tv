[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/lib/middle](../modules/bridge_lib_middle.md) / Middle

# Class: Middle

[bridge/lib/middle](../modules/bridge_lib_middle.md).Middle

## Table of contents

### Constructors

- [constructor](bridge_lib_middle.Middle.md#constructor)

### Properties

- [\_authorization](bridge_lib_middle.Middle.md#_authorization)
- [\_backend](bridge_lib_middle.Middle.md#_backend)

### Methods

- [handler](bridge_lib_middle.Middle.md#handler)
- [build](bridge_lib_middle.Middle.md#build)

## Constructors

### constructor

• **new Middle**(`_authorization`, `_backend`): [`Middle`](bridge_lib_middle.Middle.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_authorization` | [`Authorization`](bridge_lib_middle_authorization.Authorization.md) |
| `_backend` | [`Backend`](bridge_lib_backend.Backend.md) |

#### Returns

[`Middle`](bridge_lib_middle.Middle.md)

## Properties

### \_authorization

• `Private` `Readonly` **\_authorization**: [`Authorization`](bridge_lib_middle_authorization.Authorization.md)

___

### \_backend

• `Private` `Readonly` **\_backend**: [`Backend`](bridge_lib_backend.Backend.md)

## Methods

### handler

▸ **handler**(`alexaRequest`): `Promise`\<[`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `alexaRequest` | [`SHSRequest`](common_smart_home_skill_request.SHSRequest.md) |

#### Returns

`Promise`\<[`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)\>

___

### build

▸ **build**(`configuration`, `backend`): `Promise`\<[`Middle`](bridge_lib_middle.Middle.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [`Configuration`](bridge_lib_configuration.Configuration.md) |
| `backend` | [`Backend`](bridge_lib_backend.Backend.md) |

#### Returns

`Promise`\<[`Middle`](bridge_lib_middle.Middle.md)\>

[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/lib/frontend](../modules/bridge_lib_frontend.md) / Frontend

# Class: Frontend

[bridge/lib/frontend](../modules/bridge_lib_frontend.md).Frontend

## Table of contents

### Constructors

- [constructor](bridge_lib_frontend.Frontend.md#constructor)

### Properties

- [\_ajv](bridge_lib_frontend.Frontend.md#_ajv)
- [\_bridgeTokenAuth](bridge_lib_frontend.Frontend.md#_bridgetokenauth)
- [\_ipBlacklist](bridge_lib_frontend.Frontend.md#_ipblacklist)
- [\_loginTokenAuth](bridge_lib_frontend.Frontend.md#_logintokenauth)
- [\_middle](bridge_lib_frontend.Frontend.md#_middle)
- [\_schemaValidator](bridge_lib_frontend.Frontend.md#_schemavalidator)
- [\_server](bridge_lib_frontend.Frontend.md#_server)

### Methods

- [start](bridge_lib_frontend.Frontend.md#start)
- [build](bridge_lib_frontend.Frontend.md#build)

## Constructors

### constructor

• **new Frontend**(`_loginTokenAuth`, `_bridgeTokenAuth`, `_middle`, `_ipBlacklist`, `_ajv`, `_schemaValidator`, `_server`): [`Frontend`](bridge_lib_frontend.Frontend.md)

The constructor is private. To instantiate a Frontend, use [Frontend.build](bridge_lib_frontend.Frontend.md#build)().

#### Parameters

| Name | Type |
| :------ | :------ |
| `_loginTokenAuth` | [`LoginTokenAuth`](bridge_lib_frontend_login_token_auth.LoginTokenAuth.md) |
| `_bridgeTokenAuth` | [`BridgeTokenAuth`](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md) |
| `_middle` | [`Middle`](bridge_lib_middle.Middle.md) |
| `_ipBlacklist` | `any` |
| `_ajv` | `Ajv2019` |
| `_schemaValidator` | `ValidateFunction`\<`unknown`\> |
| `_server` | `Express` |

#### Returns

[`Frontend`](bridge_lib_frontend.Frontend.md)

## Properties

### \_ajv

• `Private` `Readonly` **\_ajv**: `Ajv2019`

___

### \_bridgeTokenAuth

• `Private` `Readonly` **\_bridgeTokenAuth**: [`BridgeTokenAuth`](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md)

___

### \_ipBlacklist

• `Private` `Readonly` **\_ipBlacklist**: `any`

___

### \_loginTokenAuth

• `Private` `Readonly` **\_loginTokenAuth**: [`LoginTokenAuth`](bridge_lib_frontend_login_token_auth.LoginTokenAuth.md)

___

### \_middle

• `Private` `Readonly` **\_middle**: [`Middle`](bridge_lib_middle.Middle.md)

___

### \_schemaValidator

• `Private` `Readonly` **\_schemaValidator**: `ValidateFunction`\<`unknown`\>

___

### \_server

• `Private` `Readonly` **\_server**: `Express`

## Methods

### start

▸ **start**(): `void`

#### Returns

`void`

___

### build

▸ **build**(`configuration`, `middle`): `Promise`\<[`Frontend`](bridge_lib_frontend.Frontend.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [`Configuration`](bridge_lib_configuration.Configuration.md) |
| `middle` | [`Middle`](bridge_lib_middle.Middle.md) |

#### Returns

`Promise`\<[`Frontend`](bridge_lib_frontend.Frontend.md)\>

[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/lib/frontend/bridge-token-auth](../modules/bridge_lib_frontend_bridge_token_auth.md) / BridgeTokenAuth

# Class: BridgeTokenAuth

[bridge/lib/frontend/bridge-token-auth](../modules/bridge_lib_frontend_bridge_token_auth.md).BridgeTokenAuth

## Table of contents

### Constructors

- [constructor](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md#constructor)

### Properties

- [\_configuration](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md#_configuration)
- [\_db](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md#_db)

### Methods

- [authorizeBridgeToken](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md#authorizebridgetoken)
- [generateBridgeToken](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md#generatebridgetoken)
- [setBridgeToken](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md#setbridgetoken)
- [build](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md#build)

## Constructors

### constructor

• **new BridgeTokenAuth**(`_configuration`, `_db`): [`BridgeTokenAuth`](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_configuration` | [`Configuration`](bridge_lib_configuration.Configuration.md) |
| `_db` | [`DatabaseTable`](bridge_lib_database.DatabaseTable.md) |

#### Returns

[`BridgeTokenAuth`](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md)

## Properties

### \_configuration

• `Private` `Readonly` **\_configuration**: [`Configuration`](bridge_lib_configuration.Configuration.md)

___

### \_db

• `Private` `Readonly` **\_db**: [`DatabaseTable`](bridge_lib_database.DatabaseTable.md)

## Methods

### authorizeBridgeToken

▸ **authorizeBridgeToken**(`bridgeToken`): `Promise`\<``null`` \| `string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `bridgeToken` | `string` |

#### Returns

`Promise`\<``null`` \| `string`\>

___

### generateBridgeToken

▸ **generateBridgeToken**(): `string`

#### Returns

`string`

___

### setBridgeToken

▸ **setBridgeToken**(`bridgeToken`, `hostname`, `email`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `bridgeToken` | `string` |
| `hostname` | `string` |
| `email` | `string` |

#### Returns

`Promise`\<`void`\>

___

### build

▸ **build**(`configuration`): `Promise`\<[`BridgeTokenAuth`](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [`Configuration`](bridge_lib_configuration.Configuration.md) |

#### Returns

`Promise`\<[`BridgeTokenAuth`](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md)\>

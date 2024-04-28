[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/lib/frontend/bridge-token-auth](../modules/bridge_lib_frontend_bridge_token_auth.md) / BridgeTokenAuth

# Class: BridgeTokenAuth

[bridge/lib/frontend/bridge-token-auth](../modules/bridge_lib_frontend_bridge_token_auth.md).BridgeTokenAuth

## Table of contents

### Constructors

- [constructor](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md#constructor)

### Properties

- [\_authorizationHandler](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md#_authorizationhandler)
- [\_configuration](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md#_configuration)
- [\_db](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md#_db)

### Methods

- [authorizeBridgeToken](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md#authorizebridgetoken)
- [generateBridgeToken](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md#generatebridgetoken)
- [getBridgeToken](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md#getbridgetoken)
- [setBridgeToken](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md#setbridgetoken)
- [build](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md#build)

## Constructors

### constructor

• **new BridgeTokenAuth**(`_configuration`, `_authorizationHandler`, `_db`): [`BridgeTokenAuth`](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_configuration` | [`Configuration`](bridge_lib_configuration.Configuration.md) |
| `_authorizationHandler` | [`AuthorizationHandler`](../modules/bridge_lib_frontend_auth.md#authorizationhandler) |
| `_db` | [`DatabaseTable`](bridge_lib_database.DatabaseTable.md) |

#### Returns

[`BridgeTokenAuth`](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md)

## Properties

### \_authorizationHandler

• `Private` `Readonly` **\_authorizationHandler**: [`AuthorizationHandler`](../modules/bridge_lib_frontend_auth.md#authorizationhandler)

___

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

### getBridgeToken

▸ **getBridgeToken**(`bridgeToken`): `Promise`\<``null`` \| \{ `service`: `string` ; `user`: `string`  }\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `bridgeToken` | `string` |

#### Returns

`Promise`\<``null`` \| \{ `service`: `string` ; `user`: `string`  }\>

___

### setBridgeToken

▸ **setBridgeToken**(`bridgeToken`, `service`, `user`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `bridgeToken` | `string` |
| `service` | `string` |
| `user` | `string` |

#### Returns

`Promise`\<`void`\>

___

### build

▸ **build**(`configuration`, `authorizationHandler`): `Promise`\<[`BridgeTokenAuth`](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [`Configuration`](bridge_lib_configuration.Configuration.md) |
| `authorizationHandler` | [`AuthorizationHandler`](../modules/bridge_lib_frontend_auth.md#authorizationhandler) |

#### Returns

`Promise`\<[`BridgeTokenAuth`](bridge_lib_frontend_bridge_token_auth.BridgeTokenAuth.md)\>

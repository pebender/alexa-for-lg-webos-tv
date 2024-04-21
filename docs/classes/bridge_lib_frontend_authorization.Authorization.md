[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/lib/frontend/authorization](../modules/bridge_lib_frontend_authorization.md) / Authorization

# Class: Authorization

[bridge/lib/frontend/authorization](../modules/bridge_lib_frontend_authorization.md).Authorization

## Table of contents

### Constructors

- [constructor](bridge_lib_frontend_authorization.Authorization.md#constructor)

### Properties

- [\_configuration](bridge_lib_frontend_authorization.Authorization.md#_configuration)
- [\_db](bridge_lib_frontend_authorization.Authorization.md#_db)
- [\_x509PublicCert](bridge_lib_frontend_authorization.Authorization.md#_x509publiccert)

### Methods

- [authorizeBridgeToken](bridge_lib_frontend_authorization.Authorization.md#authorizebridgetoken)
- [authorizeJwTPayload](bridge_lib_frontend_authorization.Authorization.md#authorizejwtpayload)
- [generateBridgeToken](bridge_lib_frontend_authorization.Authorization.md#generatebridgetoken)
- [setBridgeToken](bridge_lib_frontend_authorization.Authorization.md#setbridgetoken)
- [x509PublicCert](bridge_lib_frontend_authorization.Authorization.md#x509publiccert)
- [build](bridge_lib_frontend_authorization.Authorization.md#build)

## Constructors

### constructor

• **new Authorization**(`_configuration`, `_x509PublicCert`, `_db`): [`Authorization`](bridge_lib_frontend_authorization.Authorization.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_configuration` | [`Configuration`](bridge_lib_configuration.Configuration.md) |
| `_x509PublicCert` | `Buffer` |
| `_db` | [`DatabaseTable`](bridge_lib_database.DatabaseTable.md) |

#### Returns

[`Authorization`](bridge_lib_frontend_authorization.Authorization.md)

## Properties

### \_configuration

• `Private` `Readonly` **\_configuration**: [`Configuration`](bridge_lib_configuration.Configuration.md)

___

### \_db

• `Private` `Readonly` **\_db**: [`DatabaseTable`](bridge_lib_database.DatabaseTable.md)

___

### \_x509PublicCert

• `Private` `Readonly` **\_x509PublicCert**: `Buffer`

## Methods

### authorizeBridgeToken

▸ **authorizeBridgeToken**(`bridgeToken`): `Promise`\<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `bridgeToken` | `string` |

#### Returns

`Promise`\<`boolean`\>

___

### authorizeJwTPayload

▸ **authorizeJwTPayload**(`jwtPayload`): `Promise`\<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `jwtPayload` | `JwtPayload` |

#### Returns

`Promise`\<`boolean`\>

___

### generateBridgeToken

▸ **generateBridgeToken**(): `string`

#### Returns

`string`

___

### setBridgeToken

▸ **setBridgeToken**(`email`, `hostname`, `bridgeToken`): `Promise`\<`void`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `email` | `string` |
| `hostname` | `string` |
| `bridgeToken` | `string` |

#### Returns

`Promise`\<`void`\>

___

### x509PublicCert

▸ **x509PublicCert**(): `Buffer`

#### Returns

`Buffer`

___

### build

▸ **build**(`configuration`): `Promise`\<[`Authorization`](bridge_lib_frontend_authorization.Authorization.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [`Configuration`](bridge_lib_configuration.Configuration.md) |

#### Returns

`Promise`\<[`Authorization`](bridge_lib_frontend_authorization.Authorization.md)\>

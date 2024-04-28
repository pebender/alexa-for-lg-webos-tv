[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/lib/frontend/login-token-auth](../modules/bridge_lib_frontend_login_token_auth.md) / LoginTokenAuth

# Class: LoginTokenAuth

[bridge/lib/frontend/login-token-auth](../modules/bridge_lib_frontend_login_token_auth.md).LoginTokenAuth

## Table of contents

### Constructors

- [constructor](bridge_lib_frontend_login_token_auth.LoginTokenAuth.md#constructor)

### Properties

- [\_authorizationHandler](bridge_lib_frontend_login_token_auth.LoginTokenAuth.md#_authorizationhandler)
- [\_configuration](bridge_lib_frontend_login_token_auth.LoginTokenAuth.md#_configuration)
- [\_x509PublicCert](bridge_lib_frontend_login_token_auth.LoginTokenAuth.md#_x509publiccert)

### Methods

- [authorizeJwTPayload](bridge_lib_frontend_login_token_auth.LoginTokenAuth.md#authorizejwtpayload)
- [x509PublicCert](bridge_lib_frontend_login_token_auth.LoginTokenAuth.md#x509publiccert)
- [build](bridge_lib_frontend_login_token_auth.LoginTokenAuth.md#build)

## Constructors

### constructor

• **new LoginTokenAuth**(`_configuration`, `_authorizationHandler`, `_x509PublicCert`): [`LoginTokenAuth`](bridge_lib_frontend_login_token_auth.LoginTokenAuth.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_configuration` | [`Configuration`](bridge_lib_configuration.Configuration.md) |
| `_authorizationHandler` | [`AuthorizationHandler`](../modules/bridge_lib_frontend_auth.md#authorizationhandler) |
| `_x509PublicCert` | `Buffer` |

#### Returns

[`LoginTokenAuth`](bridge_lib_frontend_login_token_auth.LoginTokenAuth.md)

## Properties

### \_authorizationHandler

• `Private` `Readonly` **\_authorizationHandler**: [`AuthorizationHandler`](../modules/bridge_lib_frontend_auth.md#authorizationhandler)

___

### \_configuration

• `Private` `Readonly` **\_configuration**: [`Configuration`](bridge_lib_configuration.Configuration.md)

___

### \_x509PublicCert

• `Private` `Readonly` **\_x509PublicCert**: `Buffer`

## Methods

### authorizeJwTPayload

▸ **authorizeJwTPayload**(`jwtPayload`): `Promise`\<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `jwtPayload` | `JwtPayload` |

#### Returns

`Promise`\<`boolean`\>

___

### x509PublicCert

▸ **x509PublicCert**(): `Buffer`

#### Returns

`Buffer`

___

### build

▸ **build**(`configuration`, `authorizationHandler`): `Promise`\<[`LoginTokenAuth`](bridge_lib_frontend_login_token_auth.LoginTokenAuth.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [`Configuration`](bridge_lib_configuration.Configuration.md) |
| `authorizationHandler` | [`AuthorizationHandler`](../modules/bridge_lib_frontend_auth.md#authorizationhandler) |

#### Returns

`Promise`\<[`LoginTokenAuth`](bridge_lib_frontend_login_token_auth.LoginTokenAuth.md)\>

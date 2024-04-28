[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / bridge/lib/frontend/auth

# Module: bridge/lib/frontend/auth

## Table of contents

### Type Aliases

- [AuthorizationHandler](bridge_lib_frontend_auth.md#authorizationhandler)

### Functions

- [authorizeServiceAndUser](bridge_lib_frontend_auth.md#authorizeserviceanduser)

## Type Aliases

### AuthorizationHandler

Ƭ **AuthorizationHandler**: (`configuration`: [`Configuration`](../classes/bridge_lib_configuration.Configuration.md), `service`: `string` \| ``null``, `user`: `string` \| ``null``) => `Promise`\<`boolean`\>

#### Type declaration

▸ (`configuration`, `service`, `user`): `Promise`\<`boolean`\>

##### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [`Configuration`](../classes/bridge_lib_configuration.Configuration.md) |
| `service` | `string` \| ``null`` |
| `user` | `string` \| ``null`` |

##### Returns

`Promise`\<`boolean`\>

## Functions

### authorizeServiceAndUser

▸ **authorizeServiceAndUser**(`configuration`, `service`, `user`): `Promise`\<`boolean`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `configuration` | [`Configuration`](../classes/bridge_lib_configuration.Configuration.md) |
| `service` | ``null`` \| `string` |
| `user` | ``null`` \| `string` |

#### Returns

`Promise`\<`boolean`\>

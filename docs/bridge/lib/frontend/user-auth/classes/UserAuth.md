[**alexa-for-lg-webos-tv**](../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../modules.md) / [bridge/lib/frontend/user-auth](../README.md) / UserAuth

# Class: UserAuth

## Constructors

### new UserAuth()

> `private` **new UserAuth**(`_authorizedUsers`): [`UserAuth`](UserAuth.md)

#### Parameters

• **\_authorizedUsers**: `Record`\<`string`, `string`[]\>

#### Returns

[`UserAuth`](UserAuth.md)

## Properties

### \_authorizedUsers

> `private` `readonly` **\_authorizedUsers**: `Record`\<`string`, `string`[]\>

## Methods

### authorizeUser()

> **authorizeUser**(`bridgeHostname`, `email`): `boolean`

#### Parameters

• **bridgeHostname**: `null` \| `string`

• **email**: `null` \| `string`

#### Returns

`boolean`

***

### build()

> `static` **build**(`configurationDirectory`): `Promise`\<[`UserAuth`](UserAuth.md)\>

#### Parameters

• **configurationDirectory**: `string`

#### Returns

`Promise`\<[`UserAuth`](UserAuth.md)\>

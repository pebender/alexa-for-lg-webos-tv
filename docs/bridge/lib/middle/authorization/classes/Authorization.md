[**alexa-for-lg-webos-tv**](../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../modules.md) / [bridge/lib/middle/authorization](../README.md) / Authorization

# Class: Authorization

## Constructors

### new Authorization()

> `private` **new Authorization**(`_configuration`, `_db`): [`Authorization`](Authorization.md)

#### Parameters

• **\_configuration**: [`Configuration`](../../../configuration/classes/Configuration.md)

• **\_db**: [`DatabaseTable`](../../../database/classes/DatabaseTable.md)

#### Returns

[`Authorization`](Authorization.md)

## Properties

### \_configuration

> `private` `readonly` **\_configuration**: [`Configuration`](../../../configuration/classes/Configuration.md)

***

### \_db

> `private` `readonly` **\_db**: [`DatabaseTable`](../../../database/classes/DatabaseTable.md)

## Methods

### authorizeSkillToken()

> **authorizeSkillToken**(`skillToken`): `Promise`\<`boolean`\>

#### Parameters

• **skillToken**: `string`

#### Returns

`Promise`\<`boolean`\>

***

### build()

> `static` **build**(`configuration`): `Promise`\<[`Authorization`](Authorization.md)\>

#### Parameters

• **configuration**: [`Configuration`](../../../configuration/classes/Configuration.md)

#### Returns

`Promise`\<[`Authorization`](Authorization.md)\>

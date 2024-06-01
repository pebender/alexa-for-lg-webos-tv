[**alexa-for-lg-webos-tv**](../../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../../modules.md) / [bridge/lib/services/shs-to-lg-webos-tv/authorization](../README.md) / Authorization

# Class: Authorization

## Constructors

### new Authorization()

> `private` **new Authorization**(`_configurationDirectory`, `_database`): [`Authorization`](Authorization.md)

#### Parameters

• **\_configurationDirectory**: `string`

• **\_database**: [`DatabaseTable`](../../../../database/classes/DatabaseTable.md)\<[`AuthorizationRecord`](../type-aliases/AuthorizationRecord.md)\>

#### Returns

[`Authorization`](Authorization.md)

## Properties

### \_configurationDirectory

> `private` `readonly` **\_configurationDirectory**: `string`

***

### \_database

> `private` `readonly` **\_database**: [`DatabaseTable`](../../../../database/classes/DatabaseTable.md)\<[`AuthorizationRecord`](../type-aliases/AuthorizationRecord.md)\>

## Methods

### authorizeSkillToken()

> **authorizeSkillToken**(`skillToken`): `Promise`\<`boolean`\>

#### Parameters

• **skillToken**: `string`

#### Returns

`Promise`\<`boolean`\>

***

### build()

> `static` **build**(`configurationDirectory`): `Promise`\<[`Authorization`](Authorization.md)\>

#### Parameters

• **configurationDirectory**: `string`

#### Returns

`Promise`\<[`Authorization`](Authorization.md)\>

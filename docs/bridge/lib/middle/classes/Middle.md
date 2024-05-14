[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/lib/middle](../README.md) / Middle

# Class: Middle

## Constructors

### new Middle()

> `private` **new Middle**(`_authorization`, `_backend`): [`Middle`](Middle.md)

#### Parameters

• **\_authorization**: [`Authorization`](../authorization/classes/Authorization.md)

• **\_backend**: [`Backend`](../../backend/classes/Backend.md)

#### Returns

[`Middle`](Middle.md)

## Properties

### \_authorization

> `private` `readonly` **\_authorization**: [`Authorization`](../authorization/classes/Authorization.md)

***

### \_backend

> `private` `readonly` **\_backend**: [`Backend`](../../backend/classes/Backend.md)

## Methods

### getSkillToken()

> **getSkillToken**(`rawRequest`): `string`

#### Parameters

• **rawRequest**: `object`

#### Returns

`string`

***

### handler()

> **handler**(`rawRequest`): `Promise`\<[`Response`](../../../../common/smart-home-skill/response/classes/Response.md)\>

#### Parameters

• **rawRequest**: `object`

#### Returns

`Promise`\<[`Response`](../../../../common/smart-home-skill/response/classes/Response.md)\>

***

### build()

> `static` **build**(`configuration`, `backend`): `Promise`\<[`Middle`](Middle.md)\>

#### Parameters

• **configuration**: [`Configuration`](../../configuration/classes/Configuration.md)

• **backend**: [`Backend`](../../backend/classes/Backend.md)

#### Returns

`Promise`\<[`Middle`](Middle.md)\>

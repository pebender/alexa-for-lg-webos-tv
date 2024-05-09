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

### authorizer()

> **authorizer**(`skillToken`): `Promise`\<`boolean`\>

#### Parameters

• **skillToken**: `string`

#### Returns

`Promise`\<`boolean`\>

***

### handler()

> **handler**(`authorizedSkillToken`, `alexaRequest`): `Promise`\<[`SHSResponseWrapper`](../../../../common/smart-home-skill/response/classes/SHSResponseWrapper.md)\>

#### Parameters

• **authorizedSkillToken**: `string`

• **alexaRequest**: [`SHSRequest`](../../../../common/smart-home-skill/request/classes/SHSRequest.md)

#### Returns

`Promise`\<[`SHSResponseWrapper`](../../../../common/smart-home-skill/response/classes/SHSResponseWrapper.md)\>

***

### build()

> `static` **build**(`configuration`, `backend`): `Promise`\<[`Middle`](Middle.md)\>

#### Parameters

• **configuration**: [`Configuration`](../../configuration/classes/Configuration.md)

• **backend**: [`Backend`](../../backend/classes/Backend.md)

#### Returns

`Promise`\<[`Middle`](Middle.md)\>

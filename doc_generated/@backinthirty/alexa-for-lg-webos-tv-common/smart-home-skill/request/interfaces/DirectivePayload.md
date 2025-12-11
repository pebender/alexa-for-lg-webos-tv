[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@backinthirty/alexa-for-lg-webos-tv-common](../../../README.md) / [smart-home-skill/request](../README.md) / DirectivePayload

# Interface: DirectivePayload

Defined in: [packages/common/src/smart-home-skill/request.ts:5](https://github.com/pebender/alexa-for-lg-webos-tv/blob/08f09ed88779fc1ad44c84758ae6d1b5fed7b8bb/packages/common/src/smart-home-skill/request.ts#L5)

## Indexable

\[`x`: `string`\]: `string` \| `number` \| `boolean` \| `object` \| \[\] \| `undefined`

## Properties

### grant?

> `optional` **grant**: `object`

Defined in: [packages/common/src/smart-home-skill/request.ts:10](https://github.com/pebender/alexa-for-lg-webos-tv/blob/08f09ed88779fc1ad44c84758ae6d1b5fed7b8bb/packages/common/src/smart-home-skill/request.ts#L10)

#### code

> **code**: `string`

#### type

> **type**: `"OAuth2.AuthorizationCode"`

***

### grantee?

> `optional` **grantee**: `object`

Defined in: [packages/common/src/smart-home-skill/request.ts:14](https://github.com/pebender/alexa-for-lg-webos-tv/blob/08f09ed88779fc1ad44c84758ae6d1b5fed7b8bb/packages/common/src/smart-home-skill/request.ts#L14)

#### token

> **token**: `string`

#### type

> **type**: `"BearerToken"`

***

### scope?

> `optional` **scope**: `object`

Defined in: [packages/common/src/smart-home-skill/request.ts:6](https://github.com/pebender/alexa-for-lg-webos-tv/blob/08f09ed88779fc1ad44c84758ae6d1b5fed7b8bb/packages/common/src/smart-home-skill/request.ts#L6)

#### token

> **token**: `string`

#### type

> **type**: `"BearerToken"`

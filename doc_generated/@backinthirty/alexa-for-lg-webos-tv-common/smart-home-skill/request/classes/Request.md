[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@backinthirty/alexa-for-lg-webos-tv-common](../../../README.md) / [smart-home-skill/request](../README.md) / Request

# Class: Request

Defined in: [packages/common/src/smart-home-skill/request.ts:28](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/request.ts#L28)

## Constructors

### Constructor

> **new Request**(`options`): `Request`

Defined in: [packages/common/src/smart-home-skill/request.ts:30](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/request.ts#L30)

#### Parameters

##### options

###### directive

\{ `endpoint?`: `object`; `header`: \{ `correlationToken?`: `string`; `instance?`: `string`; `messageId?`: `string`; `name?`: `string`; `namespace?`: [`Namespace`](../../common/type-aliases/Namespace.md); `payloadVersion?`: `"3"`; \}; `payload`: [`DirectivePayload`](../interfaces/DirectivePayload.md); \}

###### directive.endpoint?

`object`

###### directive.header

\{ `correlationToken?`: `string`; `instance?`: `string`; `messageId?`: `string`; `name?`: `string`; `namespace?`: [`Namespace`](../../common/type-aliases/Namespace.md); `payloadVersion?`: `"3"`; \}

###### directive.header.correlationToken?

`string`

###### directive.header.instance?

`string`

###### directive.header.messageId?

`string`

###### directive.header.name?

`string`

###### directive.header.namespace?

[`Namespace`](../../common/type-aliases/Namespace.md)

###### directive.header.payloadVersion?

`"3"`

###### directive.payload

[`DirectivePayload`](../interfaces/DirectivePayload.md)

#### Returns

`Request`

## Properties

### directive

> **directive**: [`Directive`](../interfaces/Directive.md)

Defined in: [packages/common/src/smart-home-skill/request.ts:29](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/request.ts#L29)

## Methods

### getAccessToken()

> **getAccessToken**(): `string`

Defined in: [packages/common/src/smart-home-skill/request.ts:55](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/request.ts#L55)

#### Returns

`string`

***

### getCorrelationToken()

> **getCorrelationToken**(): `string` \| `undefined`

Defined in: [packages/common/src/smart-home-skill/request.ts:47](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/request.ts#L47)

#### Returns

`string` \| `undefined`

***

### getEndpointId()

> **getEndpointId**(): `string` \| `undefined`

Defined in: [packages/common/src/smart-home-skill/request.ts:51](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/request.ts#L51)

#### Returns

`string` \| `undefined`

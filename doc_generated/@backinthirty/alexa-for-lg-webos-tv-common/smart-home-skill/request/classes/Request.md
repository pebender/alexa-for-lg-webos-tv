[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@backinthirty/alexa-for-lg-webos-tv-common](../../../README.md) / [smart-home-skill/request](../README.md) / Request

# Class: Request

## Constructors

### Constructor

> **new Request**(`options`): `Request`

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

## Methods

### getAccessToken()

> **getAccessToken**(): `string`

#### Returns

`string`

***

### getCorrelationToken()

> **getCorrelationToken**(): `string` \| `undefined`

#### Returns

`string` \| `undefined`

***

### getEndpointId()

> **getEndpointId**(): `string` \| `undefined`

#### Returns

`string` \| `undefined`

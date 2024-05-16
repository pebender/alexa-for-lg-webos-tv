[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [common/smart-home-skill/request](../README.md) / Request

# Class: Request

## Constructors

### new Request()

> **new Request**(`options`): [`Request`](Request.md)

#### Parameters

• **options**

• **options.directive**

• **options.directive.endpoint?**: `object`

• **options.directive.header**

• **options.directive.header.correlationToken?**: `string`

• **options.directive.header.instance?**: `string`

• **options.directive.header.messageId?**: `string`

• **options.directive.header.name?**: `string`

• **options.directive.header.namespace?**: [`Namespace`](../../common/type-aliases/Namespace.md)

• **options.directive.header.payloadVersion?**: `"3"`

• **options.directive.payload**: [`DirectivePayload`](../interfaces/DirectivePayload.md)

#### Returns

[`Request`](Request.md)

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

> **getCorrelationToken**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

***

### getEndpointId()

> **getEndpointId**(): `undefined` \| `string`

#### Returns

`undefined` \| `string`

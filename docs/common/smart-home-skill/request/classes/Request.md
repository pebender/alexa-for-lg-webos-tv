[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [common/smart-home-skill/request](../README.md) / Request

# Class: Request

## Indexable

 \[`x`: `string`\]: `object` \| `undefined`

## Constructors

### new Request()

> **new Request**(`opts`): [`Request`](Request.md)

#### Parameters

• **opts**

• **opts.directive**

• **opts.directive.endpoint?**: `object`

• **opts.directive.header**

• **opts.directive.header.correlationToken?**: `string`

• **opts.directive.header.instance?**: `string`

• **opts.directive.header.messageId?**: `string`

• **opts.directive.header.name?**: `string`

• **opts.directive.header.namespace?**: [`Namespace`](../../common/type-aliases/Namespace.md)

• **opts.directive.header.payloadVersion?**: `"3"`

• **opts.directive.payload**: [`DirectivePayload`](../interfaces/DirectivePayload.md)

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

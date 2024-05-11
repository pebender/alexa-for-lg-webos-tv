[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [common/smart-home-skill/request](../README.md) / SHSRequest

# Class: SHSRequest

## Indexable

 \[`x`: `string`\]: `object` \| `undefined`

## Constructors

### new SHSRequest()

> **new SHSRequest**(`opts`): [`SHSRequest`](SHSRequest.md)

#### Parameters

• **opts**

• **opts.directive**

• **opts.directive.endpoint?**: `object`

• **opts.directive.header**

• **opts.directive.header.correlationToken?**: `string`

• **opts.directive.header.instance?**: `string`

• **opts.directive.header.messageId?**: `string`

• **opts.directive.header.name?**: `string`

• **opts.directive.header.namespace?**: [`Namespace`](../namespaces/SHSDirective/namespaces/Header/type-aliases/Namespace.md)

• **opts.directive.header.payloadVersion?**: `"3"`

• **opts.directive.payload**: [`Payload`](../namespaces/SHSDirective/interfaces/Payload.md)

#### Returns

[`SHSRequest`](SHSRequest.md)

## Properties

### directive

> **directive**: [`SHSDirective`](../interfaces/SHSDirective.md)

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

***

### getUserProfile()

> **getUserProfile**(): `Promise`\<[`UserProfile`](../../../profile/type-aliases/UserProfile.md)\>

#### Returns

`Promise`\<[`UserProfile`](../../../profile/type-aliases/UserProfile.md)\>

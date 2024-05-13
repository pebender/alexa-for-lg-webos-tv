[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [common/smart-home-skill/response](../README.md) / Response

# Class: Response

## Indexable

 \[`x`: `string`\]: `object` \| `undefined`

## Constructors

### new Response()

> **new Response**(`opts`): [`Response`](Response.md)

#### Parameters

• **opts**: `object` \| `object`

#### Returns

[`Response`](Response.md)

## Properties

### context?

> `optional` **context**: [`Context`](../interfaces/Context.md)

***

### event

> **event**: [`Event`](../interfaces/Event.md)

## Methods

### addContextProperty()

> **addContextProperty**(`contextProperty`): `void`

#### Parameters

• **contextProperty**: [`ContextProperty`](../interfaces/ContextProperty.md)

#### Returns

`void`

***

### addPayloadEndpoint()

> **addPayloadEndpoint**(`payloadEndpoint`): `void`

#### Parameters

• **payloadEndpoint**: [`EventPayloadEndpoint`](../interfaces/EventPayloadEndpoint.md)

#### Returns

`void`

***

### setEndpointId()

> **setEndpointId**(`endpointId`): `void`

#### Parameters

• **endpointId**: `string`

#### Returns

`void`

***

### buildContextProperty()

> `static` **buildContextProperty**(`opts`): `Promise`\<`null` \| [`ContextProperty`](../interfaces/ContextProperty.md)\>

#### Parameters

• **opts**

• **opts.instance?**: `string`

• **opts.name**: `string`

• **opts.namespace**: [`Namespace`](../../common/type-aliases/Namespace.md)

• **opts.value**

#### Returns

`Promise`\<`null` \| [`ContextProperty`](../interfaces/ContextProperty.md)\>

***

### buildPayloadEndpointCapability()

> `static` **buildPayloadEndpointCapability**(`opts`): `Promise`\<[`EventPayloadEndpointCapability`](../interfaces/EventPayloadEndpointCapability.md)\>

#### Parameters

• **opts**

• **opts.namespace**: [`Namespace`](../../common/type-aliases/Namespace.md)

• **opts.propertyNames?**: `string`[]

#### Returns

`Promise`\<[`EventPayloadEndpointCapability`](../interfaces/EventPayloadEndpointCapability.md)\>

[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [common/smart-home-skill/response](../README.md) / SHSResponse

# Class: SHSResponse

## Indexable

 \[`x`: `string`\]: `object` \| `undefined`

## Constructors

### new SHSResponse()

> **new SHSResponse**(`opts`): [`SHSResponse`](SHSResponse.md)

#### Parameters

• **opts**: `object` \| `object`

#### Returns

[`SHSResponse`](SHSResponse.md)

## Properties

### context?

> `optional` **context**: [`SHSContext`](../interfaces/SHSContext.md)

***

### event

> **event**: [`SHSEvent`](../interfaces/SHSEvent.md)

## Methods

### addContextProperty()

> **addContextProperty**(`contextProperty`): `void`

#### Parameters

• **contextProperty**: [`Property`](../namespaces/SHSContext/interfaces/Property.md)

#### Returns

`void`

***

### addPayloadEndpoint()

> **addPayloadEndpoint**(`payloadEndpoint`): `void`

#### Parameters

• **payloadEndpoint**: [`Endpoint`](../namespaces/SHSEvent/namespaces/Payload/interfaces/Endpoint.md)

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

> `static` **buildContextProperty**(`opts`): `Promise`\<`null` \| [`Property`](../namespaces/SHSContext/interfaces/Property.md)\>

#### Parameters

• **opts**

• **opts.instance?**: `string`

• **opts.name**: `string`

• **opts.namespace**: [`Namespace`](../../request/namespaces/SHSDirective/namespaces/Header/type-aliases/Namespace.md)

• **opts.value**

#### Returns

`Promise`\<`null` \| [`Property`](../namespaces/SHSContext/interfaces/Property.md)\>

***

### buildPayloadEndpointCapability()

> `static` **buildPayloadEndpointCapability**(`opts`): `Promise`\<[`Capability`](../namespaces/SHSEvent/namespaces/Payload/namespaces/Endpoint/interfaces/Capability.md)\>

#### Parameters

• **opts**

• **opts.namespace**: [`Namespace`](../../request/namespaces/SHSDirective/namespaces/Header/type-aliases/Namespace.md)

• **opts.propertyNames?**: `string`[]

#### Returns

`Promise`\<[`Capability`](../namespaces/SHSEvent/namespaces/Payload/namespaces/Endpoint/interfaces/Capability.md)\>

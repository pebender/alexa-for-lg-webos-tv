[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [common/smart-home-skill/response](../README.md) / Response

# Class: Response

## Constructors

### new Response()

> **new Response**(`options`): [`Response`](Response.md)

#### Parameters

• **options**: `object` \| `object`

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

### buildAlexaErrorResponse()

> `static` **buildAlexaErrorResponse**(`request`, `type`, `message`?, `error`?): [`Response`](Response.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

• **type**: `string`

• **message?**: `string`

• **error?**: `unknown`

#### Returns

[`Response`](Response.md)

***

### buildAlexaErrorResponseAddError()

> `static` **buildAlexaErrorResponseAddError**(`request`, `type`, `message`): [`Response`](Response.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

• **type**: `string`

• **message**: `string`

#### Returns

[`Response`](Response.md)

***

### buildAlexaErrorResponseForInternalError()

> `static` **buildAlexaErrorResponseForInternalError**(`request`, `error`): [`Response`](Response.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

• **error**: `unknown`

#### Returns

[`Response`](Response.md)

***

### buildAlexaErrorResponseForInvalidDirectiveName()

> `static` **buildAlexaErrorResponseForInvalidDirectiveName**(`request`): [`Response`](Response.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

#### Returns

[`Response`](Response.md)

***

### buildAlexaErrorResponseForInvalidDirectiveNamespace()

> `static` **buildAlexaErrorResponseForInvalidDirectiveNamespace**(`request`): [`Response`](Response.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

#### Returns

[`Response`](Response.md)

***

### buildAlexaErrorResponseForInvalidValue()

> `static` **buildAlexaErrorResponseForInvalidValue**(`request`): [`Response`](Response.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

#### Returns

[`Response`](Response.md)

***

### buildAlexaErrorResponseForPowerOff()

> `static` **buildAlexaErrorResponseForPowerOff**(`request`): [`Response`](Response.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

#### Returns

[`Response`](Response.md)

***

### buildAlexaErrorResponseForValueOutOfRange()

> `static` **buildAlexaErrorResponseForValueOutOfRange**(`request`, `validRange`?): [`Response`](Response.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

• **validRange?**

• **validRange.maximumValue?**: `unknown`

• **validRange.minimumValue?**: `unknown`

#### Returns

[`Response`](Response.md)

***

### buildAlexaErrorResponseNotSupportedInCurrentMode()

> `static` **buildAlexaErrorResponseNotSupportedInCurrentMode**(`request`, `message`?): [`Response`](Response.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

• **message?**: `string`

#### Returns

[`Response`](Response.md)

***

### buildAlexaResponse()

> `static` **buildAlexaResponse**(`request`): [`Response`](Response.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

#### Returns

[`Response`](Response.md)

***

### buildContextProperty()

> `static` **buildContextProperty**(`options`): `Promise`\<`null` \| [`ContextProperty`](../interfaces/ContextProperty.md)\>

#### Parameters

• **options**

• **options.instance?**: `string`

• **options.name**: `string`

• **options.namespace**: [`Namespace`](../../common/type-aliases/Namespace.md)

• **options.value**

#### Returns

`Promise`\<`null` \| [`ContextProperty`](../interfaces/ContextProperty.md)\>

***

### buildPayloadEndpointCapability()

> `static` **buildPayloadEndpointCapability**(`options`): `Promise`\<[`EventPayloadEndpointCapability`](../interfaces/EventPayloadEndpointCapability.md)\>

#### Parameters

• **options**

• **options.namespace**: [`Namespace`](../../common/type-aliases/Namespace.md)

• **options.propertyNames?**: `string`[]

#### Returns

`Promise`\<[`EventPayloadEndpointCapability`](../interfaces/EventPayloadEndpointCapability.md)\>

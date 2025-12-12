[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@backinthirty/alexa-for-lg-webos-tv-common](../../../README.md) / [smart-home-skill/response](../README.md) / Response

# Class: Response

## Constructors

### Constructor

> **new Response**(`options`): `Response`

#### Parameters

##### options

\{ `context?`: [`Context`](../interfaces/Context.md); `event`: [`Event`](../interfaces/Event.md); \} | \{ `correlationToken?`: `string`; `endpointId?`: `string`; `instance?`: `string`; `name`: `string`; `namespace`: [`Namespace`](../../common/type-aliases/Namespace.md); `payload?`: [`EventPayload`](../interfaces/EventPayload.md); `token?`: `string`; \}

#### Returns

`Response`

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

##### contextProperty

[`ContextProperty`](../interfaces/ContextProperty.md)

#### Returns

`void`

***

### addPayloadEndpoint()

> **addPayloadEndpoint**(`payloadEndpoint`): `void`

#### Parameters

##### payloadEndpoint

[`EventPayloadEndpoint`](../interfaces/EventPayloadEndpoint.md)

#### Returns

`void`

***

### buildAlexaErrorResponse()

> `static` **buildAlexaErrorResponse**(`request`, `type`, `message?`, `error?`): `Response`

#### Parameters

##### request

[`Request`](../../request/classes/Request.md)

##### type

`string`

##### message?

`string`

##### error?

`unknown`

#### Returns

`Response`

***

### buildAlexaErrorResponseAddError()

> `static` **buildAlexaErrorResponseAddError**(`request`, `type`, `message`): `Response`

#### Parameters

##### request

[`Request`](../../request/classes/Request.md)

##### type

`string`

##### message

`string`

#### Returns

`Response`

***

### buildAlexaErrorResponseForInternalError()

> `static` **buildAlexaErrorResponseForInternalError**(`request`, `error`): `Response`

#### Parameters

##### request

[`Request`](../../request/classes/Request.md)

##### error

`unknown`

#### Returns

`Response`

***

### buildAlexaErrorResponseForInvalidDirectiveName()

> `static` **buildAlexaErrorResponseForInvalidDirectiveName**(`request`): `Response`

#### Parameters

##### request

[`Request`](../../request/classes/Request.md)

#### Returns

`Response`

***

### buildAlexaErrorResponseForInvalidDirectiveNamespace()

> `static` **buildAlexaErrorResponseForInvalidDirectiveNamespace**(`request`): `Response`

#### Parameters

##### request

[`Request`](../../request/classes/Request.md)

#### Returns

`Response`

***

### buildAlexaErrorResponseForInvalidValue()

> `static` **buildAlexaErrorResponseForInvalidValue**(`request`): `Response`

#### Parameters

##### request

[`Request`](../../request/classes/Request.md)

#### Returns

`Response`

***

### buildAlexaErrorResponseForPowerOff()

> `static` **buildAlexaErrorResponseForPowerOff**(`request`): `Response`

#### Parameters

##### request

[`Request`](../../request/classes/Request.md)

#### Returns

`Response`

***

### buildAlexaErrorResponseForValueOutOfRange()

> `static` **buildAlexaErrorResponseForValueOutOfRange**(`request`, `validRange?`): `Response`

#### Parameters

##### request

[`Request`](../../request/classes/Request.md)

##### validRange?

###### maximumValue

`unknown`

###### minimumValue

`unknown`

#### Returns

`Response`

***

### buildAlexaErrorResponseNotSupportedInCurrentMode()

> `static` **buildAlexaErrorResponseNotSupportedInCurrentMode**(`request`, `message?`): `Response`

#### Parameters

##### request

[`Request`](../../request/classes/Request.md)

##### message?

`string`

#### Returns

`Response`

***

### buildAlexaResponse()

> `static` **buildAlexaResponse**(`request`): `Response`

#### Parameters

##### request

[`Request`](../../request/classes/Request.md)

#### Returns

`Response`

***

### buildContextProperty()

> `static` **buildContextProperty**(`options`): `Promise`\<[`ContextProperty`](../interfaces/ContextProperty.md) \| `null`\>

#### Parameters

##### options

###### instance?

`string`

###### name

`string`

###### namespace

[`Namespace`](../../common/type-aliases/Namespace.md)

###### value

() => `Promise`\<`string` \| `number` \| `boolean` \| `object` \| \[\]\>

#### Returns

`Promise`\<[`ContextProperty`](../interfaces/ContextProperty.md) \| `null`\>

***

### buildPayloadEndpointCapability()

> `static` **buildPayloadEndpointCapability**(`options`): `Promise`\<[`EventPayloadEndpointCapability`](../interfaces/EventPayloadEndpointCapability.md)\>

#### Parameters

##### options

###### namespace

[`Namespace`](../../common/type-aliases/Namespace.md)

###### propertyNames?

`string`[]

#### Returns

`Promise`\<[`EventPayloadEndpointCapability`](../interfaces/EventPayloadEndpointCapability.md)\>

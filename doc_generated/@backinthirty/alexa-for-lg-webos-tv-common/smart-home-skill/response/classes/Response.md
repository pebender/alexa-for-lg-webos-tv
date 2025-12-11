[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@backinthirty/alexa-for-lg-webos-tv-common](../../../README.md) / [smart-home-skill/response](../README.md) / Response

# Class: Response

Defined in: [packages/common/src/smart-home-skill/response.ts:77](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/response.ts#L77)

## Constructors

### Constructor

> **new Response**(`options`): `Response`

Defined in: [packages/common/src/smart-home-skill/response.ts:80](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/response.ts#L80)

#### Parameters

##### options

\{ `context?`: [`Context`](../interfaces/Context.md); `event`: [`Event`](../interfaces/Event.md); \} | \{ `correlationToken?`: `string`; `endpointId?`: `string`; `instance?`: `string`; `name`: `string`; `namespace`: [`Namespace`](../../common/type-aliases/Namespace.md); `payload?`: [`EventPayload`](../interfaces/EventPayload.md); `token?`: `string`; \}

#### Returns

`Response`

## Properties

### context?

> `optional` **context**: [`Context`](../interfaces/Context.md)

Defined in: [packages/common/src/smart-home-skill/response.ts:79](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/response.ts#L79)

***

### event

> **event**: [`Event`](../interfaces/Event.md)

Defined in: [packages/common/src/smart-home-skill/response.ts:78](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/response.ts#L78)

## Methods

### addContextProperty()

> **addContextProperty**(`contextProperty`): `void`

Defined in: [packages/common/src/smart-home-skill/response.ts:155](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/response.ts#L155)

#### Parameters

##### contextProperty

[`ContextProperty`](../interfaces/ContextProperty.md)

#### Returns

`void`

***

### addPayloadEndpoint()

> **addPayloadEndpoint**(`payloadEndpoint`): `void`

Defined in: [packages/common/src/smart-home-skill/response.ts:162](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/response.ts#L162)

#### Parameters

##### payloadEndpoint

[`EventPayloadEndpoint`](../interfaces/EventPayloadEndpoint.md)

#### Returns

`void`

***

### buildAlexaErrorResponse()

> `static` **buildAlexaErrorResponse**(`request`, `type`, `message?`, `error?`): `Response`

Defined in: [packages/common/src/smart-home-skill/response.ts:224](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/response.ts#L224)

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

Defined in: [packages/common/src/smart-home-skill/response.ts:315](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/response.ts#L315)

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

Defined in: [packages/common/src/smart-home-skill/response.ts:245](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/response.ts#L245)

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

Defined in: [packages/common/src/smart-home-skill/response.ts:266](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/response.ts#L266)

#### Parameters

##### request

[`Request`](../../request/classes/Request.md)

#### Returns

`Response`

***

### buildAlexaErrorResponseForInvalidDirectiveNamespace()

> `static` **buildAlexaErrorResponseForInvalidDirectiveNamespace**(`request`): `Response`

Defined in: [packages/common/src/smart-home-skill/response.ts:274](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/response.ts#L274)

#### Parameters

##### request

[`Request`](../../request/classes/Request.md)

#### Returns

`Response`

***

### buildAlexaErrorResponseForInvalidValue()

> `static` **buildAlexaErrorResponseForInvalidValue**(`request`): `Response`

Defined in: [packages/common/src/smart-home-skill/response.ts:282](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/response.ts#L282)

#### Parameters

##### request

[`Request`](../../request/classes/Request.md)

#### Returns

`Response`

***

### buildAlexaErrorResponseForPowerOff()

> `static` **buildAlexaErrorResponseForPowerOff**(`request`): `Response`

Defined in: [packages/common/src/smart-home-skill/response.ts:309](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/response.ts#L309)

#### Parameters

##### request

[`Request`](../../request/classes/Request.md)

#### Returns

`Response`

***

### buildAlexaErrorResponseForValueOutOfRange()

> `static` **buildAlexaErrorResponseForValueOutOfRange**(`request`, `validRange?`): `Response`

Defined in: [packages/common/src/smart-home-skill/response.ts:297](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/response.ts#L297)

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

Defined in: [packages/common/src/smart-home-skill/response.ts:289](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/response.ts#L289)

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

Defined in: [packages/common/src/smart-home-skill/response.ts:214](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/response.ts#L214)

#### Parameters

##### request

[`Request`](../../request/classes/Request.md)

#### Returns

`Response`

***

### buildContextProperty()

> `static` **buildContextProperty**(`options`): `Promise`\<[`ContextProperty`](../interfaces/ContextProperty.md) \| `null`\>

Defined in: [packages/common/src/smart-home-skill/response.ts:168](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/response.ts#L168)

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

Defined in: [packages/common/src/smart-home-skill/response.ts:191](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/common/src/smart-home-skill/response.ts#L191)

#### Parameters

##### options

###### namespace

[`Namespace`](../../common/type-aliases/Namespace.md)

###### propertyNames?

`string`[]

#### Returns

`Promise`\<[`EventPayloadEndpointCapability`](../interfaces/EventPayloadEndpointCapability.md)\>

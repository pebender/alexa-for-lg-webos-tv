[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [common/smart-home-skill/response](../README.md) / SHSResponseWrapper

# Class: SHSResponseWrapper

## Constructors

### new SHSResponseWrapper()

> **new SHSResponseWrapper**(`request`, `response`, `statusCode`?, `error`?): [`SHSResponseWrapper`](SHSResponseWrapper.md)

#### Parameters

• **request**: [`SHSRequest`](../../request/classes/SHSRequest.md)

• **response**: [`SHSResponse`](SHSResponse.md)

• **statusCode?**: `number`

• **error?**: `Error`

#### Returns

[`SHSResponseWrapper`](SHSResponseWrapper.md)

## Properties

### error?

> `optional` `readonly` **error**: `any`

***

### request

> `readonly` **request**: [`SHSRequest`](../../request/classes/SHSRequest.md)

***

### response

> `readonly` **response**: [`SHSResponse`](SHSResponse.md)

***

### statusCode

> `readonly` **statusCode**: `number`

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

### buildAlexaErrorResponse()

> `static` **buildAlexaErrorResponse**(`request`, `type`, `message`, `statusCode`?, `error`?): [`SHSResponseWrapper`](SHSResponseWrapper.md)

#### Parameters

• **request**: [`SHSRequest`](../../request/classes/SHSRequest.md)

• **type**: `string`

• **message**: `string`

• **statusCode?**: `number`

• **error?**: `any`

#### Returns

[`SHSResponseWrapper`](SHSResponseWrapper.md)

***

### buildAlexaErrorResponseAddError()

> `static` **buildAlexaErrorResponseAddError**(`request`, `type`, `message`, `statusCode`?): [`SHSResponseWrapper`](SHSResponseWrapper.md)

#### Parameters

• **request**: [`SHSRequest`](../../request/classes/SHSRequest.md)

• **type**: `string`

• **message**: `string`

• **statusCode?**: `number`

#### Returns

[`SHSResponseWrapper`](SHSResponseWrapper.md)

***

### buildAlexaErrorResponseForInternalError()

> `static` **buildAlexaErrorResponseForInternalError**(`request`, `statusCode`?, `error`?): [`SHSResponseWrapper`](SHSResponseWrapper.md)

#### Parameters

• **request**: [`SHSRequest`](../../request/classes/SHSRequest.md)

• **statusCode?**: `number`

• **error?**: `any`

#### Returns

[`SHSResponseWrapper`](SHSResponseWrapper.md)

***

### buildAlexaErrorResponseForInvalidDirectiveName()

> `static` **buildAlexaErrorResponseForInvalidDirectiveName**(`request`): [`SHSResponseWrapper`](SHSResponseWrapper.md)

#### Parameters

• **request**: [`SHSRequest`](../../request/classes/SHSRequest.md)

#### Returns

[`SHSResponseWrapper`](SHSResponseWrapper.md)

***

### buildAlexaErrorResponseForInvalidDirectiveNamespace()

> `static` **buildAlexaErrorResponseForInvalidDirectiveNamespace**(`request`): [`SHSResponseWrapper`](SHSResponseWrapper.md)

#### Parameters

• **request**: [`SHSRequest`](../../request/classes/SHSRequest.md)

#### Returns

[`SHSResponseWrapper`](SHSResponseWrapper.md)

***

### buildAlexaErrorResponseForInvalidValue()

> `static` **buildAlexaErrorResponseForInvalidValue**(`request`): [`SHSResponseWrapper`](SHSResponseWrapper.md)

#### Parameters

• **request**: [`SHSRequest`](../../request/classes/SHSRequest.md)

#### Returns

[`SHSResponseWrapper`](SHSResponseWrapper.md)

***

### buildAlexaErrorResponseForPowerOff()

> `static` **buildAlexaErrorResponseForPowerOff**(`request`): [`SHSResponseWrapper`](SHSResponseWrapper.md)

#### Parameters

• **request**: [`SHSRequest`](../../request/classes/SHSRequest.md)

#### Returns

[`SHSResponseWrapper`](SHSResponseWrapper.md)

***

### buildAlexaErrorResponseForValueOutOfRange()

> `static` **buildAlexaErrorResponseForValueOutOfRange**(`request`, `validRange`?): [`SHSResponseWrapper`](SHSResponseWrapper.md)

#### Parameters

• **request**: [`SHSRequest`](../../request/classes/SHSRequest.md)

• **validRange?**

• **validRange.maximumValue?**: `any`

• **validRange.minimumValue?**: `any`

#### Returns

[`SHSResponseWrapper`](SHSResponseWrapper.md)

***

### buildAlexaErrorResponseNotSupportedInCurrentMode()

> `static` **buildAlexaErrorResponseNotSupportedInCurrentMode**(`request`, `message`?): [`SHSResponseWrapper`](SHSResponseWrapper.md)

#### Parameters

• **request**: [`SHSRequest`](../../request/classes/SHSRequest.md)

• **message?**: `string`

#### Returns

[`SHSResponseWrapper`](SHSResponseWrapper.md)

***

### buildAlexaResponse()

> `static` **buildAlexaResponse**(`request`): [`SHSResponseWrapper`](SHSResponseWrapper.md)

#### Parameters

• **request**: [`SHSRequest`](../../request/classes/SHSRequest.md)

#### Returns

[`SHSResponseWrapper`](SHSResponseWrapper.md)

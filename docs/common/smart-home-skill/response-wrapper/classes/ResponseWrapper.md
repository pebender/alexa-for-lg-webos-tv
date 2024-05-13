[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [common/smart-home-skill/response-wrapper](../README.md) / ResponseWrapper

# Class: ResponseWrapper

## Constructors

### new ResponseWrapper()

> **new ResponseWrapper**(`request`, `response`, `statusCode`?, `error`?): [`ResponseWrapper`](ResponseWrapper.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

• **response**: [`Response`](../../response/classes/Response.md)

• **statusCode?**: `number`

• **error?**: `unknown`

#### Returns

[`ResponseWrapper`](ResponseWrapper.md)

## Properties

### error?

> `optional` `readonly` **error**: [`CommonError`](../../../error/classes/CommonError.md)

***

### request

> `readonly` **request**: [`Request`](../../request/classes/Request.md)

***

### response

> `readonly` **response**: [`Response`](../../response/classes/Response.md)

***

### statusCode

> `readonly` **statusCode**: `number`

## Methods

### buildAlexaErrorResponse()

> `static` **buildAlexaErrorResponse**(`request`, `type`, `message`, `statusCode`?, `error`?): [`ResponseWrapper`](ResponseWrapper.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

• **type**: `string`

• **message**: `string`

• **statusCode?**: `number`

• **error?**: `unknown`

#### Returns

[`ResponseWrapper`](ResponseWrapper.md)

***

### buildAlexaErrorResponseAddError()

> `static` **buildAlexaErrorResponseAddError**(`request`, `type`, `message`, `statusCode`?): [`ResponseWrapper`](ResponseWrapper.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

• **type**: `string`

• **message**: `string`

• **statusCode?**: `number`

#### Returns

[`ResponseWrapper`](ResponseWrapper.md)

***

### buildAlexaErrorResponseForInternalError()

> `static` **buildAlexaErrorResponseForInternalError**(`request`, `statusCode`?, `error`?): [`ResponseWrapper`](ResponseWrapper.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

• **statusCode?**: `number`

• **error?**: `unknown`

#### Returns

[`ResponseWrapper`](ResponseWrapper.md)

***

### buildAlexaErrorResponseForInvalidDirectiveName()

> `static` **buildAlexaErrorResponseForInvalidDirectiveName**(`request`): [`ResponseWrapper`](ResponseWrapper.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

#### Returns

[`ResponseWrapper`](ResponseWrapper.md)

***

### buildAlexaErrorResponseForInvalidDirectiveNamespace()

> `static` **buildAlexaErrorResponseForInvalidDirectiveNamespace**(`request`): [`ResponseWrapper`](ResponseWrapper.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

#### Returns

[`ResponseWrapper`](ResponseWrapper.md)

***

### buildAlexaErrorResponseForInvalidValue()

> `static` **buildAlexaErrorResponseForInvalidValue**(`request`): [`ResponseWrapper`](ResponseWrapper.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

#### Returns

[`ResponseWrapper`](ResponseWrapper.md)

***

### buildAlexaErrorResponseForPowerOff()

> `static` **buildAlexaErrorResponseForPowerOff**(`request`): [`ResponseWrapper`](ResponseWrapper.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

#### Returns

[`ResponseWrapper`](ResponseWrapper.md)

***

### buildAlexaErrorResponseForValueOutOfRange()

> `static` **buildAlexaErrorResponseForValueOutOfRange**(`request`, `validRange`?): [`ResponseWrapper`](ResponseWrapper.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

• **validRange?**

• **validRange.maximumValue?**: `unknown`

• **validRange.minimumValue?**: `unknown`

#### Returns

[`ResponseWrapper`](ResponseWrapper.md)

***

### buildAlexaErrorResponseNotSupportedInCurrentMode()

> `static` **buildAlexaErrorResponseNotSupportedInCurrentMode**(`request`, `message`?): [`ResponseWrapper`](ResponseWrapper.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

• **message?**: `string`

#### Returns

[`ResponseWrapper`](ResponseWrapper.md)

***

### buildAlexaResponse()

> `static` **buildAlexaResponse**(`request`): [`ResponseWrapper`](ResponseWrapper.md)

#### Parameters

• **request**: [`Request`](../../request/classes/Request.md)

#### Returns

[`ResponseWrapper`](ResponseWrapper.md)
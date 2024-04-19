[alexa-for-lg-webos-tv](../README.md) / [common](../modules/common.md) / [SHS](../modules/common.SHS.md) / ResponseWrapper

# Class: ResponseWrapper

[common](../modules/common.md).[SHS](../modules/common.SHS.md).ResponseWrapper

## Table of contents

### Constructors

- [constructor](common.SHS.ResponseWrapper.md#constructor)

### Properties

- [error](common.SHS.ResponseWrapper.md#error)
- [request](common.SHS.ResponseWrapper.md#request)
- [response](common.SHS.ResponseWrapper.md#response)
- [statusCode](common.SHS.ResponseWrapper.md#statuscode)

### Methods

- [addContextProperty](common.SHS.ResponseWrapper.md#addcontextproperty)
- [addPayloadEndpoint](common.SHS.ResponseWrapper.md#addpayloadendpoint)
- [buildAlexaErrorResponse](common.SHS.ResponseWrapper.md#buildalexaerrorresponse)
- [buildAlexaErrorResponseAddError](common.SHS.ResponseWrapper.md#buildalexaerrorresponseadderror)
- [buildAlexaErrorResponseForInternalError](common.SHS.ResponseWrapper.md#buildalexaerrorresponseforinternalerror)
- [buildAlexaErrorResponseForInvalidDirectiveName](common.SHS.ResponseWrapper.md#buildalexaerrorresponseforinvaliddirectivename)
- [buildAlexaErrorResponseForInvalidDirectiveNamespace](common.SHS.ResponseWrapper.md#buildalexaerrorresponseforinvaliddirectivenamespace)
- [buildAlexaErrorResponseForInvalidValue](common.SHS.ResponseWrapper.md#buildalexaerrorresponseforinvalidvalue)
- [buildAlexaErrorResponseForPowerOff](common.SHS.ResponseWrapper.md#buildalexaerrorresponseforpoweroff)
- [buildAlexaErrorResponseForValueOutOfRange](common.SHS.ResponseWrapper.md#buildalexaerrorresponseforvalueoutofrange)
- [buildAlexaErrorResponseNotSupportedInCurrentMode](common.SHS.ResponseWrapper.md#buildalexaerrorresponsenotsupportedincurrentmode)
- [buildAlexaResponse](common.SHS.ResponseWrapper.md#buildalexaresponse)

## Constructors

### constructor

• **new ResponseWrapper**(`request`, `response`, `statusCode?`, `error?`): [`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`Request`](common.SHS.Request.md) |
| `response` | [`Response`](common.SHS.Response.md) |
| `statusCode?` | `number` |
| `error?` | `Error` |

#### Returns

[`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Defined in

[common/smart-home-skill/response.ts:255](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L255)

## Properties

### error

• `Optional` `Readonly` **error**: `any`

#### Defined in

[common/smart-home-skill/response.ts:253](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L253)

___

### request

• `Readonly` **request**: [`Request`](common.SHS.Request.md)

#### Defined in

[common/smart-home-skill/response.ts:250](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L250)

___

### response

• `Readonly` **response**: [`Response`](common.SHS.Response.md)

#### Defined in

[common/smart-home-skill/response.ts:251](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L251)

___

### statusCode

• `Readonly` **statusCode**: `number`

#### Defined in

[common/smart-home-skill/response.ts:252](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L252)

## Methods

### addContextProperty

▸ **addContextProperty**(`contextProperty`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `contextProperty` | [`Property`](../interfaces/common.SHS.Context.Property-1.md) |

#### Returns

`void`

#### Defined in

[common/smart-home-skill/response.ts:283](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L283)

___

### addPayloadEndpoint

▸ **addPayloadEndpoint**(`payloadEndpoint`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `payloadEndpoint` | [`Endpoint`](../interfaces/common.SHS.Event.Payload.Endpoint-1.md) |

#### Returns

`void`

#### Defined in

[common/smart-home-skill/response.ts:287](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L287)

___

### buildAlexaErrorResponse

▸ **buildAlexaErrorResponse**(`request`, `type`, `message`, `statusCode?`, `error?`): [`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`Request`](common.SHS.Request.md) |
| `type` | `string` |
| `message` | `string` |
| `statusCode?` | `number` |
| `error?` | `any` |

#### Returns

[`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Defined in

[common/smart-home-skill/response.ts:302](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L302)

___

### buildAlexaErrorResponseAddError

▸ **buildAlexaErrorResponseAddError**(`request`, `type`, `message`, `statusCode?`): [`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`Request`](common.SHS.Request.md) |
| `type` | `string` |
| `message` | `string` |
| `statusCode?` | `number` |

#### Returns

[`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Defined in

[common/smart-home-skill/response.ts:401](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L401)

___

### buildAlexaErrorResponseForInternalError

▸ **buildAlexaErrorResponseForInternalError**(`request`, `statusCode?`, `error?`): [`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`Request`](common.SHS.Request.md) |
| `statusCode?` | `number` |
| `error?` | `any` |

#### Returns

[`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Defined in

[common/smart-home-skill/response.ts:322](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L322)

___

### buildAlexaErrorResponseForInvalidDirectiveName

▸ **buildAlexaErrorResponseForInvalidDirectiveName**(`request`): [`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`Request`](common.SHS.Request.md) |

#### Returns

[`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Defined in

[common/smart-home-skill/response.ts:344](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L344)

___

### buildAlexaErrorResponseForInvalidDirectiveNamespace

▸ **buildAlexaErrorResponseForInvalidDirectiveNamespace**(`request`): [`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`Request`](common.SHS.Request.md) |

#### Returns

[`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Defined in

[common/smart-home-skill/response.ts:352](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L352)

___

### buildAlexaErrorResponseForInvalidValue

▸ **buildAlexaErrorResponseForInvalidValue**(`request`): [`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`Request`](common.SHS.Request.md) |

#### Returns

[`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Defined in

[common/smart-home-skill/response.ts:360](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L360)

___

### buildAlexaErrorResponseForPowerOff

▸ **buildAlexaErrorResponseForPowerOff**(`request`): [`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`Request`](common.SHS.Request.md) |

#### Returns

[`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Defined in

[common/smart-home-skill/response.ts:395](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L395)

___

### buildAlexaErrorResponseForValueOutOfRange

▸ **buildAlexaErrorResponseForValueOutOfRange**(`request`, `validRange?`): [`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`Request`](common.SHS.Request.md) |
| `validRange?` | `Object` |
| `validRange.maximumValue` | `any` |
| `validRange.minimumValue` | `any` |

#### Returns

[`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Defined in

[common/smart-home-skill/response.ts:378](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L378)

___

### buildAlexaErrorResponseNotSupportedInCurrentMode

▸ **buildAlexaErrorResponseNotSupportedInCurrentMode**(`request`, `message?`): [`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`Request`](common.SHS.Request.md) |
| `message?` | `string` |

#### Returns

[`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Defined in

[common/smart-home-skill/response.ts:366](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L366)

___

### buildAlexaResponse

▸ **buildAlexaResponse**(`request`): [`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`Request`](common.SHS.Request.md) |

#### Returns

[`ResponseWrapper`](common.SHS.ResponseWrapper.md)

#### Defined in

[common/smart-home-skill/response.ts:291](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L291)

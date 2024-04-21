[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [common/smart-home-skill/response](../modules/common_smart_home_skill_response.md) / SHSResponseWrapper

# Class: SHSResponseWrapper

[common/smart-home-skill/response](../modules/common_smart_home_skill_response.md).SHSResponseWrapper

## Table of contents

### Constructors

- [constructor](common_smart_home_skill_response.SHSResponseWrapper.md#constructor)

### Properties

- [error](common_smart_home_skill_response.SHSResponseWrapper.md#error)
- [request](common_smart_home_skill_response.SHSResponseWrapper.md#request)
- [response](common_smart_home_skill_response.SHSResponseWrapper.md#response)
- [statusCode](common_smart_home_skill_response.SHSResponseWrapper.md#statuscode)

### Methods

- [addContextProperty](common_smart_home_skill_response.SHSResponseWrapper.md#addcontextproperty)
- [addPayloadEndpoint](common_smart_home_skill_response.SHSResponseWrapper.md#addpayloadendpoint)
- [buildAlexaErrorResponse](common_smart_home_skill_response.SHSResponseWrapper.md#buildalexaerrorresponse)
- [buildAlexaErrorResponseAddError](common_smart_home_skill_response.SHSResponseWrapper.md#buildalexaerrorresponseadderror)
- [buildAlexaErrorResponseForInternalError](common_smart_home_skill_response.SHSResponseWrapper.md#buildalexaerrorresponseforinternalerror)
- [buildAlexaErrorResponseForInvalidDirectiveName](common_smart_home_skill_response.SHSResponseWrapper.md#buildalexaerrorresponseforinvaliddirectivename)
- [buildAlexaErrorResponseForInvalidDirectiveNamespace](common_smart_home_skill_response.SHSResponseWrapper.md#buildalexaerrorresponseforinvaliddirectivenamespace)
- [buildAlexaErrorResponseForInvalidValue](common_smart_home_skill_response.SHSResponseWrapper.md#buildalexaerrorresponseforinvalidvalue)
- [buildAlexaErrorResponseForPowerOff](common_smart_home_skill_response.SHSResponseWrapper.md#buildalexaerrorresponseforpoweroff)
- [buildAlexaErrorResponseForValueOutOfRange](common_smart_home_skill_response.SHSResponseWrapper.md#buildalexaerrorresponseforvalueoutofrange)
- [buildAlexaErrorResponseNotSupportedInCurrentMode](common_smart_home_skill_response.SHSResponseWrapper.md#buildalexaerrorresponsenotsupportedincurrentmode)
- [buildAlexaResponse](common_smart_home_skill_response.SHSResponseWrapper.md#buildalexaresponse)

## Constructors

### constructor

• **new SHSResponseWrapper**(`request`, `response`, `statusCode?`, `error?`): [`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`SHSRequest`](common_smart_home_skill_request.SHSRequest.md) |
| `response` | [`SHSResponse`](common_smart_home_skill_response.SHSResponse.md) |
| `statusCode?` | `number` |
| `error?` | `Error` |

#### Returns

[`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

## Properties

### error

• `Optional` `Readonly` **error**: `any`

___

### request

• `Readonly` **request**: [`SHSRequest`](common_smart_home_skill_request.SHSRequest.md)

___

### response

• `Readonly` **response**: [`SHSResponse`](common_smart_home_skill_response.SHSResponse.md)

___

### statusCode

• `Readonly` **statusCode**: `number`

## Methods

### addContextProperty

▸ **addContextProperty**(`contextProperty`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `contextProperty` | [`Property`](../interfaces/common_smart_home_skill_response.SHSContext.Property-1.md) |

#### Returns

`void`

___

### addPayloadEndpoint

▸ **addPayloadEndpoint**(`payloadEndpoint`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `payloadEndpoint` | [`Endpoint`](../interfaces/common_smart_home_skill_response.SHSEvent.Payload.Endpoint-1.md) |

#### Returns

`void`

___

### buildAlexaErrorResponse

▸ **buildAlexaErrorResponse**(`request`, `type`, `message`, `statusCode?`, `error?`): [`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`SHSRequest`](common_smart_home_skill_request.SHSRequest.md) |
| `type` | `string` |
| `message` | `string` |
| `statusCode?` | `number` |
| `error?` | `any` |

#### Returns

[`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

___

### buildAlexaErrorResponseAddError

▸ **buildAlexaErrorResponseAddError**(`request`, `type`, `message`, `statusCode?`): [`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`SHSRequest`](common_smart_home_skill_request.SHSRequest.md) |
| `type` | `string` |
| `message` | `string` |
| `statusCode?` | `number` |

#### Returns

[`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

___

### buildAlexaErrorResponseForInternalError

▸ **buildAlexaErrorResponseForInternalError**(`request`, `statusCode?`, `error?`): [`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`SHSRequest`](common_smart_home_skill_request.SHSRequest.md) |
| `statusCode?` | `number` |
| `error?` | `any` |

#### Returns

[`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

___

### buildAlexaErrorResponseForInvalidDirectiveName

▸ **buildAlexaErrorResponseForInvalidDirectiveName**(`request`): [`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`SHSRequest`](common_smart_home_skill_request.SHSRequest.md) |

#### Returns

[`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

___

### buildAlexaErrorResponseForInvalidDirectiveNamespace

▸ **buildAlexaErrorResponseForInvalidDirectiveNamespace**(`request`): [`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`SHSRequest`](common_smart_home_skill_request.SHSRequest.md) |

#### Returns

[`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

___

### buildAlexaErrorResponseForInvalidValue

▸ **buildAlexaErrorResponseForInvalidValue**(`request`): [`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`SHSRequest`](common_smart_home_skill_request.SHSRequest.md) |

#### Returns

[`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

___

### buildAlexaErrorResponseForPowerOff

▸ **buildAlexaErrorResponseForPowerOff**(`request`): [`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`SHSRequest`](common_smart_home_skill_request.SHSRequest.md) |

#### Returns

[`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

___

### buildAlexaErrorResponseForValueOutOfRange

▸ **buildAlexaErrorResponseForValueOutOfRange**(`request`, `validRange?`): [`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`SHSRequest`](common_smart_home_skill_request.SHSRequest.md) |
| `validRange?` | `Object` |
| `validRange.maximumValue` | `any` |
| `validRange.minimumValue` | `any` |

#### Returns

[`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

___

### buildAlexaErrorResponseNotSupportedInCurrentMode

▸ **buildAlexaErrorResponseNotSupportedInCurrentMode**(`request`, `message?`): [`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`SHSRequest`](common_smart_home_skill_request.SHSRequest.md) |
| `message?` | `string` |

#### Returns

[`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

___

### buildAlexaResponse

▸ **buildAlexaResponse**(`request`): [`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `request` | [`SHSRequest`](common_smart_home_skill_request.SHSRequest.md) |

#### Returns

[`SHSResponseWrapper`](common_smart_home_skill_response.SHSResponseWrapper.md)

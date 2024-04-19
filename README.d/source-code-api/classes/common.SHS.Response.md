[alexa-for-lg-webos-tv](../README.md) / [common](../modules/common.md) / [SHS](../modules/common.SHS.md) / Response

# Class: Response

[common](../modules/common.md).[SHS](../modules/common.SHS.md).Response

## Indexable

▪ [x: `string`]: `object` \| `undefined`

## Table of contents

### Constructors

- [constructor](common.SHS.Response.md#constructor)

### Properties

- [context](common.SHS.Response.md#context)
- [event](common.SHS.Response.md#event)

### Methods

- [addContextProperty](common.SHS.Response.md#addcontextproperty)
- [addPayloadEndpoint](common.SHS.Response.md#addpayloadendpoint)
- [setEndpointId](common.SHS.Response.md#setendpointid)
- [buildContextProperty](common.SHS.Response.md#buildcontextproperty)
- [buildPayloadEndpointCapability](common.SHS.Response.md#buildpayloadendpointcapability)

## Constructors

### constructor

• **new Response**(`opts`): [`Response`](common.SHS.Response.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | \{ `context?`: [`Context`](../interfaces/common.SHS.Context-1.md) ; `event`: [`Event`](../interfaces/common.SHS.Event-1.md)  } \| \{ `correlationToken?`: `string` ; `endpointId?`: `string` ; `instance?`: `string` ; `name`: `string` ; `namespace`: [`Namespace`](../modules/common.SHS.Directive.Header.md#namespace) ; `payload?`: [`Payload`](../interfaces/common.SHS.Event.Payload-1.md) ; `token?`: `string`  } |

#### Returns

[`Response`](common.SHS.Response.md)

#### Defined in

[common/smart-home-skill/response.ts:108](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L108)

## Properties

### context

• `Optional` **context**: [`Context`](../interfaces/common.SHS.Context-1.md)

#### Defined in

[common/smart-home-skill/response.ts:106](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L106)

___

### event

• **event**: [`Event`](../interfaces/common.SHS.Event-1.md)

#### Defined in

[common/smart-home-skill/response.ts:105](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L105)

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

[common/smart-home-skill/response.ts:190](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L190)

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

[common/smart-home-skill/response.ts:201](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L201)

___

### setEndpointId

▸ **setEndpointId**(`endpointId`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpointId` | `string` |

#### Returns

`void`

#### Defined in

[common/smart-home-skill/response.ts:182](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L182)

___

### buildContextProperty

▸ **buildContextProperty**(`opts`): `Promise`\<[`Property`](../interfaces/common.SHS.Context.Property-1.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.instance?` | `string` |
| `opts.name` | `string` |
| `opts.namespace` | [`Namespace`](../modules/common.SHS.Directive.Header.md#namespace) |
| `opts.value` | () => `string` \| `number` \| `boolean` \| `object` \| [] |

#### Returns

`Promise`\<[`Property`](../interfaces/common.SHS.Context.Property-1.md)\>

#### Defined in

[common/smart-home-skill/response.ts:209](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L209)

___

### buildPayloadEndpointCapability

▸ **buildPayloadEndpointCapability**(`opts`): `Promise`\<[`Capability`](../interfaces/common.SHS.Event.Payload.Endpoint.Capability-1.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.namespace` | [`Namespace`](../modules/common.SHS.Directive.Header.md#namespace) |
| `opts.propertyNames?` | `string`[] |

#### Returns

`Promise`\<[`Capability`](../interfaces/common.SHS.Event.Payload.Endpoint.Capability-1.md)\>

#### Defined in

[common/smart-home-skill/response.ts:227](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/smart-home-skill/response.ts#L227)

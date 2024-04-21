[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [common/smart-home-skill/response](../modules/common_smart_home_skill_response.md) / SHSResponse

# Class: SHSResponse

[common/smart-home-skill/response](../modules/common_smart_home_skill_response.md).SHSResponse

## Indexable

▪ [x: `string`]: `object` \| `undefined`

## Table of contents

### Constructors

- [constructor](common_smart_home_skill_response.SHSResponse.md#constructor)

### Properties

- [context](common_smart_home_skill_response.SHSResponse.md#context)
- [event](common_smart_home_skill_response.SHSResponse.md#event)

### Methods

- [addContextProperty](common_smart_home_skill_response.SHSResponse.md#addcontextproperty)
- [addPayloadEndpoint](common_smart_home_skill_response.SHSResponse.md#addpayloadendpoint)
- [setEndpointId](common_smart_home_skill_response.SHSResponse.md#setendpointid)
- [buildContextProperty](common_smart_home_skill_response.SHSResponse.md#buildcontextproperty)
- [buildPayloadEndpointCapability](common_smart_home_skill_response.SHSResponse.md#buildpayloadendpointcapability)

## Constructors

### constructor

• **new SHSResponse**(`opts`): [`SHSResponse`](common_smart_home_skill_response.SHSResponse.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | \{ `context?`: [`SHSContext`](../interfaces/common_smart_home_skill_response.SHSContext-1.md) ; `event`: [`SHSEvent`](../interfaces/common_smart_home_skill_response.SHSEvent-1.md)  } \| \{ `correlationToken?`: `string` ; `endpointId?`: `string` ; `instance?`: `string` ; `name`: `string` ; `namespace`: [`Namespace`](../modules/common_smart_home_skill_request.SHSDirective.Header.md#namespace) ; `payload?`: [`Payload`](../interfaces/common_smart_home_skill_response.SHSEvent.Payload-1.md) ; `token?`: `string`  } |

#### Returns

[`SHSResponse`](common_smart_home_skill_response.SHSResponse.md)

## Properties

### context

• `Optional` **context**: [`SHSContext`](../interfaces/common_smart_home_skill_response.SHSContext-1.md)

___

### event

• **event**: [`SHSEvent`](../interfaces/common_smart_home_skill_response.SHSEvent-1.md)

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

### setEndpointId

▸ **setEndpointId**(`endpointId`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `endpointId` | `string` |

#### Returns

`void`

___

### buildContextProperty

▸ **buildContextProperty**(`opts`): `Promise`\<[`Property`](../interfaces/common_smart_home_skill_response.SHSContext.Property-1.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.instance?` | `string` |
| `opts.name` | `string` |
| `opts.namespace` | [`Namespace`](../modules/common_smart_home_skill_request.SHSDirective.Header.md#namespace) |
| `opts.value` | () => `string` \| `number` \| `boolean` \| `object` \| [] |

#### Returns

`Promise`\<[`Property`](../interfaces/common_smart_home_skill_response.SHSContext.Property-1.md)\>

___

### buildPayloadEndpointCapability

▸ **buildPayloadEndpointCapability**(`opts`): `Promise`\<[`Capability`](../interfaces/common_smart_home_skill_response.SHSEvent.Payload.Endpoint.Capability-1.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `opts` | `Object` |
| `opts.namespace` | [`Namespace`](../modules/common_smart_home_skill_request.SHSDirective.Header.md#namespace) |
| `opts.propertyNames?` | `string`[] |

#### Returns

`Promise`\<[`Capability`](../interfaces/common_smart_home_skill_response.SHSEvent.Payload.Endpoint.Capability-1.md)\>

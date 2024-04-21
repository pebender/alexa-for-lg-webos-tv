[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / bridge/lib/middle/smart-home-skill/authorization

# Module: bridge/lib/middle/smart-home-skill/authorization

## Table of contents

### Functions

- [capabilities](bridge_lib_middle_smart_home_skill_authorization.md#capabilities)
- [handler](bridge_lib_middle_smart_home_skill_authorization.md#handler)
- [states](bridge_lib_middle_smart_home_skill_authorization.md#states)

## Functions

### capabilities

▸ **capabilities**(`backend`): `Promise`\<[`Capability`](../interfaces/common_smart_home_skill_response.SHSEvent.Payload.Endpoint.Capability-1.md)\>[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `backend` | [`Backend`](../classes/bridge_lib_backend.Backend.md) |

#### Returns

`Promise`\<[`Capability`](../interfaces/common_smart_home_skill_response.SHSEvent.Payload.Endpoint.Capability-1.md)\>[]

___

### handler

▸ **handler**(`alexaRequest`, `backend`): [`SHSResponseWrapper`](../classes/common_smart_home_skill_response.SHSResponseWrapper.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `alexaRequest` | [`SHSRequest`](../classes/common_smart_home_skill_request.SHSRequest.md) |
| `backend` | [`Backend`](../classes/bridge_lib_backend.Backend.md) |

#### Returns

[`SHSResponseWrapper`](../classes/common_smart_home_skill_response.SHSResponseWrapper.md)

___

### states

▸ **states**(`backend`): `Promise`\<[`Property`](../interfaces/common_smart_home_skill_response.SHSContext.Property-1.md)\>[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `backend` | [`Backend`](../classes/bridge_lib_backend.Backend.md) |

#### Returns

`Promise`\<[`Property`](../interfaces/common_smart_home_skill_response.SHSContext.Property-1.md)\>[]

[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / bridge/lib/middle/smart-home-skill

# Module: bridge/lib/middle/smart-home-skill

## Table of contents

### Functions

- [callback](bridge_lib_middle_smart_home_skill.md#callback)
- [capabilities](bridge_lib_middle_smart_home_skill.md#capabilities)
- [handler](bridge_lib_middle_smart_home_skill.md#handler)
- [states](bridge_lib_middle_smart_home_skill.md#states)

## Functions

### callback

▸ **callback**(`uri`, `error`, `response`, `udn`, `authorization`, `backend`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `uri` | `string` |
| `error` | `Error` |
| `response` | [`Response`](../interfaces/bridge_types_lgtv2.export_.Response.md) |
| `udn` | `string` |
| `authorization` | [`Authorization`](../classes/bridge_lib_middle_authorization.Authorization.md) |
| `backend` | [`Backend`](../classes/bridge_lib_backend.Backend.md) |

#### Returns

`void`

___

### capabilities

▸ **capabilities**(`backendControl`): `Promise`\<[`Capability`](../interfaces/common_smart_home_skill_response.SHSEvent.Payload.Endpoint.Capability-1.md)\>[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `backendControl` | [`BackendControl`](../classes/bridge_lib_backend_backend_control.BackendControl.md) |

#### Returns

`Promise`\<[`Capability`](../interfaces/common_smart_home_skill_response.SHSEvent.Payload.Endpoint.Capability-1.md)\>[]

___

### handler

▸ **handler**(`authorizedEmail`, `event`, `authorization`, `backend`): `Promise`\<[`SHSResponseWrapper`](../classes/common_smart_home_skill_response.SHSResponseWrapper.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `authorizedEmail` | `string` |
| `event` | [`SHSRequest`](../classes/common_smart_home_skill_request.SHSRequest.md) |
| `authorization` | [`Authorization`](../classes/bridge_lib_middle_authorization.Authorization.md) |
| `backend` | [`Backend`](../classes/bridge_lib_backend.Backend.md) |

#### Returns

`Promise`\<[`SHSResponseWrapper`](../classes/common_smart_home_skill_response.SHSResponseWrapper.md)\>

___

### states

▸ **states**(`backendControl`): `Promise`\<[`Property`](../interfaces/common_smart_home_skill_response.SHSContext.Property-1.md)\>[]

#### Parameters

| Name | Type |
| :------ | :------ |
| `backendControl` | [`BackendControl`](../classes/bridge_lib_backend_backend_control.BackendControl.md) |

#### Returns

`Promise`\<[`Property`](../interfaces/common_smart_home_skill_response.SHSContext.Property-1.md)\>[]

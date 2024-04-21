[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / bridge/lib/middle/smart-home-skill/input-controller

# Module: bridge/lib/middle/smart-home-skill/input-controller

## Table of contents

### Functions

- [capabilities](bridge_lib_middle_smart_home_skill_input_controller.md#capabilities)
- [handler](bridge_lib_middle_smart_home_skill_input_controller.md#handler)
- [states](bridge_lib_middle_smart_home_skill_input_controller.md#states)

## Functions

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

▸ **handler**(`alexaRequest`, `backendControl`): `Promise`\<[`SHSResponseWrapper`](../classes/common_smart_home_skill_response.SHSResponseWrapper.md)\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `alexaRequest` | [`SHSRequest`](../classes/common_smart_home_skill_request.SHSRequest.md) |
| `backendControl` | [`BackendControl`](../classes/bridge_lib_backend_backend_control.BackendControl.md) |

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

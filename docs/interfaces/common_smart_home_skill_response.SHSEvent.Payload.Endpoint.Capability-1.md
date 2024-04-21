[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [common/smart-home-skill/response](../modules/common_smart_home_skill_response.md) / [SHSEvent](../modules/common_smart_home_skill_response.SHSEvent.md) / [Payload](../modules/common_smart_home_skill_response.SHSEvent.Payload.md) / [Endpoint](../modules/common_smart_home_skill_response.SHSEvent.Payload.Endpoint.md) / Capability

# Interface: Capability

[Payload](../modules/common_smart_home_skill_response.SHSEvent.Payload.md).[Endpoint](../modules/common_smart_home_skill_response.SHSEvent.Payload.Endpoint.md).Capability

## Indexable

▪ [x: `string`]: `string` \| `object` \| `undefined`

## Table of contents

### Properties

- [capabilityResources](common_smart_home_skill_response.SHSEvent.Payload.Endpoint.Capability-1.md#capabilityresources)
- [configuration](common_smart_home_skill_response.SHSEvent.Payload.Endpoint.Capability-1.md#configuration)
- [instance](common_smart_home_skill_response.SHSEvent.Payload.Endpoint.Capability-1.md#instance)
- [interface](common_smart_home_skill_response.SHSEvent.Payload.Endpoint.Capability-1.md#interface)
- [properties](common_smart_home_skill_response.SHSEvent.Payload.Endpoint.Capability-1.md#properties)
- [supportedOperations](common_smart_home_skill_response.SHSEvent.Payload.Endpoint.Capability-1.md#supportedoperations)
- [type](common_smart_home_skill_response.SHSEvent.Payload.Endpoint.Capability-1.md#type)
- [version](common_smart_home_skill_response.SHSEvent.Payload.Endpoint.Capability-1.md#version)

## Properties

### capabilityResources

• `Optional` **capabilityResources**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `friendlyNames` | \{ `@type`: ``"text"`` ; `value`: \{ `locale`: ``"en-US"`` ; `text`: `string`  }  }[] |

___

### configuration

• `Optional` **configuration**: `object`

___

### instance

• `Optional` **instance**: `string`

___

### interface

• **interface**: `string`

___

### properties

• `Optional` **properties**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `proactivelyReported` | `boolean` |
| `retrievable` | `boolean` |
| `supported` | \{ `name`: `string`  }[] |

___

### supportedOperations

• `Optional` **supportedOperations**: `string`[]

___

### type

• **type**: `string`

___

### version

• **version**: `string`

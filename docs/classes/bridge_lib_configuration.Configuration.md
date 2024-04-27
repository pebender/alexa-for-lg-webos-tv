[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [bridge/lib/configuration](../modules/bridge_lib_configuration.md) / Configuration

# Class: Configuration

[bridge/lib/configuration](../modules/bridge_lib_configuration.md).Configuration

## Table of contents

### Constructors

- [constructor](bridge_lib_configuration.Configuration.md#constructor)

### Properties

- [\_configuration](bridge_lib_configuration.Configuration.md#_configuration)

### Methods

- [authorizedServicesAndUsers](bridge_lib_configuration.Configuration.md#authorizedservicesandusers)
- [hostname](bridge_lib_configuration.Configuration.md#hostname)
- [build](bridge_lib_configuration.Configuration.md#build)

## Constructors

### constructor

• **new Configuration**(`_configuration`): [`Configuration`](bridge_lib_configuration.Configuration.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `_configuration` | `Object` |
| `_configuration.authorizedServicesAndUsers` | \{ `service`: `string` ; `users`: `string`[]  }[] |
| `_configuration.hostname` | `string` |

#### Returns

[`Configuration`](bridge_lib_configuration.Configuration.md)

## Properties

### \_configuration

• `Private` **\_configuration**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `authorizedServicesAndUsers` | \{ `service`: `string` ; `users`: `string`[]  }[] |
| `hostname` | `string` |

## Methods

### authorizedServicesAndUsers

▸ **authorizedServicesAndUsers**(): `Promise`\<\{ `service`: `string` ; `users`: `string`[]  }[]\>

#### Returns

`Promise`\<\{ `service`: `string` ; `users`: `string`[]  }[]\>

___

### hostname

▸ **hostname**(): `Promise`\<`string`\>

#### Returns

`Promise`\<`string`\>

___

### build

▸ **build**(): `Promise`\<[`Configuration`](bridge_lib_configuration.Configuration.md)\>

#### Returns

`Promise`\<[`Configuration`](bridge_lib_configuration.Configuration.md)\>

[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / common/error

# Module: common/error

## Table of contents

### Classes

- [AlexaForLGwebOSTVError](../classes/common_error.AlexaForLGwebOSTVError.md)

### Type Aliases

- [AlexaForLGwebOSTVErrorGeneral](common_error.md#alexaforlgwebostverrorgeneral)
- [AlexaForLGwebOSTVErrorLocation](common_error.md#alexaforlgwebostverrorlocation)
- [AlexaForLGwebOSTVErrorOptions](common_error.md#alexaforlgwebostverroroptions)

### Functions

- [create](common_error.md#create)

## Type Aliases

### AlexaForLGwebOSTVErrorGeneral

Ƭ **AlexaForLGwebOSTVErrorGeneral**: ``"unknown"`` \| ``"authorization"`` \| ``"database"`` \| ``"http"`` \| ``"link"``

___

### AlexaForLGwebOSTVErrorLocation

Ƭ **AlexaForLGwebOSTVErrorLocation**: ``"skill"`` \| ``"skill_link"`` \| ``"skill_user_profile"`` \| ``"skill_user_db"`` \| ``"bridge_link"`` \| ``"bridge_link_user_profile"`` \| ``"bridge_link_user_db"`` \| ``"bridge_service"`` \| ``"bridge_service_user_profile"`` \| ``"bridge_service_user_db"`` \| ``"bridge_service_auth_db"``

___

### AlexaForLGwebOSTVErrorOptions

Ƭ **AlexaForLGwebOSTVErrorOptions**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `cause?` | `any` |
| `general` | [`AlexaForLGwebOSTVErrorGeneral`](common_error.md#alexaforlgwebostverrorgeneral) |
| `receiver?` | [`AlexaForLGwebOSTVErrorLocation`](common_error.md#alexaforlgwebostverrorlocation) |
| `sender?` | [`AlexaForLGwebOSTVErrorLocation`](common_error.md#alexaforlgwebostverrorlocation) |
| `specific?` | `string` |

## Functions

### create

▸ **create**(`message`, `options?`): [`AlexaForLGwebOSTVError`](../classes/common_error.AlexaForLGwebOSTVError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `options?` | [`AlexaForLGwebOSTVErrorOptions`](common_error.md#alexaforlgwebostverroroptions) |

#### Returns

[`AlexaForLGwebOSTVError`](../classes/common_error.AlexaForLGwebOSTVError.md)

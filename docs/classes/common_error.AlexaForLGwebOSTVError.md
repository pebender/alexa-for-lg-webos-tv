[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / [common/error](../modules/common_error.md) / AlexaForLGwebOSTVError

# Class: AlexaForLGwebOSTVError

[common/error](../modules/common_error.md).AlexaForLGwebOSTVError

## Hierarchy

- `Error`

  ↳ **`AlexaForLGwebOSTVError`**

## Implements

- `ErrnoException`

## Table of contents

### Constructors

- [constructor](common_error.AlexaForLGwebOSTVError.md#constructor)

### Properties

- [code](common_error.AlexaForLGwebOSTVError.md#code)
- [general](common_error.AlexaForLGwebOSTVError.md#general)
- [receiver](common_error.AlexaForLGwebOSTVError.md#receiver)
- [sender](common_error.AlexaForLGwebOSTVError.md#sender)
- [specific](common_error.AlexaForLGwebOSTVError.md#specific)

## Constructors

### constructor

• **new AlexaForLGwebOSTVError**(`message`, `options?`): [`AlexaForLGwebOSTVError`](common_error.AlexaForLGwebOSTVError.md)

#### Parameters

| Name | Type |
| :------ | :------ |
| `message` | `string` |
| `options?` | [`AlexaForLGwebOSTVErrorOptions`](../modules/common_error.md#alexaforlgwebostverroroptions) |

#### Returns

[`AlexaForLGwebOSTVError`](common_error.AlexaForLGwebOSTVError.md)

#### Overrides

Error.constructor

## Properties

### code

• `Readonly` **code**: `string`

#### Implementation of

NodeJS.ErrnoException.code

___

### general

• `Readonly` **general**: [`AlexaForLGwebOSTVErrorGeneral`](../modules/common_error.md#alexaforlgwebostverrorgeneral)

___

### receiver

• `Optional` `Readonly` **receiver**: [`AlexaForLGwebOSTVErrorLocation`](../modules/common_error.md#alexaforlgwebostverrorlocation)

___

### sender

• `Optional` `Readonly` **sender**: [`AlexaForLGwebOSTVErrorLocation`](../modules/common_error.md#alexaforlgwebostverrorlocation)

___

### specific

• `Optional` `Readonly` **specific**: `string`

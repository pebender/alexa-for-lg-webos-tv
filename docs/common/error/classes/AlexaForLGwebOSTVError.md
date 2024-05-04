[**alexa-for-lg-webos-tv**](../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/error](../README.md) / AlexaForLGwebOSTVError

# Class: AlexaForLGwebOSTVError

## Extends

- `Error`

## Implements

- `ErrnoException`

## Constructors

### new AlexaForLGwebOSTVError()

> **new AlexaForLGwebOSTVError**(`message`, `options`?): [`AlexaForLGwebOSTVError`](AlexaForLGwebOSTVError.md)

#### Parameters

• **message**: `string`

• **options?**: [`AlexaForLGwebOSTVErrorOptions`](../type-aliases/AlexaForLGwebOSTVErrorOptions.md)

#### Returns

[`AlexaForLGwebOSTVError`](AlexaForLGwebOSTVError.md)

#### Overrides

`Error.constructor`

## Properties

### code

> `readonly` **code**: `string`

#### Implementation of

`NodeJS.ErrnoException.code`

***

### general

> `readonly` **general**: [`AlexaForLGwebOSTVErrorGeneral`](../type-aliases/AlexaForLGwebOSTVErrorGeneral.md)

***

### receiver?

> `optional` `readonly` **receiver**: [`AlexaForLGwebOSTVErrorLocation`](../type-aliases/AlexaForLGwebOSTVErrorLocation.md)

***

### sender?

> `optional` `readonly` **sender**: [`AlexaForLGwebOSTVErrorLocation`](../type-aliases/AlexaForLGwebOSTVErrorLocation.md)

***

### specific?

> `optional` `readonly` **specific**: `string`

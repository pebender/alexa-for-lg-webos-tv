[**alexa-for-lg-webos-tv**](../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/error](../README.md) / CommonError

# Class: CommonError

## Extends

- `Error`

## Implements

- `ErrnoException`

## Constructors

### new CommonError()

> **new CommonError**(`message`, `options`?): [`CommonError`](CommonError.md)

#### Parameters

• **message**: `string`

• **options?**: [`CommonErrorOptions`](../interfaces/CommonErrorOptions.md)

#### Returns

[`CommonError`](CommonError.md)

#### Overrides

`Error.constructor`

## Properties

### code

> `readonly` **code**: `string`

#### Implementation of

`NodeJS.ErrnoException.code`

***

### general

> `readonly` **general**: [`CommonErrorGeneral`](../type-aliases/CommonErrorGeneral.md)

***

### receiver?

> `optional` `readonly` **receiver**: [`CommonErrorLocation`](../type-aliases/CommonErrorLocation.md)

***

### sender?

> `optional` `readonly` **sender**: [`CommonErrorLocation`](../type-aliases/CommonErrorLocation.md)

***

### specific?

> `optional` `readonly` **specific**: `string`

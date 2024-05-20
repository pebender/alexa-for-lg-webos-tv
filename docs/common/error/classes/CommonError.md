[**alexa-for-lg-webos-tv**](../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/error](../README.md) / CommonError

# Class: `abstract` CommonError

## Extends

- `Error`

## Extended by

- [`GeneralCommonError`](GeneralCommonError.md)
- [`AuthorizationCommonError`](AuthorizationCommonError.md)
- [`DatabaseCommonError`](DatabaseCommonError.md)
- [`HttpCommonError`](HttpCommonError.md)
- [`LinkCommonError`](LinkCommonError.md)
- [`TvCommonError`](TvCommonError.md)

## Implements

- `ErrnoException`

## Constructors

### new CommonError()

> `protected` **new CommonError**(`options`): [`CommonError`](CommonError.md)

#### Parameters

• **options**

• **options.cause?**: `unknown`

• **options.code?**: `string`

• **options.message?**: `string`

#### Returns

[`CommonError`](CommonError.md)

#### Overrides

`Error.constructor`

## Properties

### code

> `abstract` **code**: `string`

#### Implementation of

`NodeJS.ErrnoException.code`

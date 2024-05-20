[**alexa-for-lg-webos-tv**](../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/error](../README.md) / TvCommonError

# Class: TvCommonError

A [CommonError](CommonError.md) subclass for TV related errors. The supported errors
are given by [TvCommonErrorCode](../type-aliases/TvCommonErrorCode.md).

## Extends

- [`CommonError`](CommonError.md)

## Constructors

### new TvCommonError()

> **new TvCommonError**(`options`): [`TvCommonError`](TvCommonError.md)

#### Parameters

• **options**

• **options.cause?**: `unknown`

• **options.code?**: [`TvCommonErrorCode`](../type-aliases/TvCommonErrorCode.md)

• **options.message?**: `string`

#### Returns

[`TvCommonError`](TvCommonError.md)

#### Overrides

[`CommonError`](CommonError.md).[`constructor`](CommonError.md#constructors)

## Properties

### code

> `readonly` **code**: [`TvCommonErrorCode`](../type-aliases/TvCommonErrorCode.md)

#### Overrides

[`CommonError`](CommonError.md).[`code`](CommonError.md#code)

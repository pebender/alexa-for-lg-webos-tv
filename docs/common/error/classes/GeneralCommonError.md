[**alexa-for-lg-webos-tv**](../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/error](../README.md) / GeneralCommonError

# Class: GeneralCommonError

A [CommonError](CommonError.md) subclass for errors that do not fit into any of the
other error classes. The supported errors codes are given by
[GeneralCommonErrorCode](../type-aliases/GeneralCommonErrorCode.md).

## Extends

- [`CommonError`](CommonError.md)

## Constructors

### new GeneralCommonError()

> **new GeneralCommonError**(`options`): [`GeneralCommonError`](GeneralCommonError.md)

#### Parameters

• **options**

• **options.cause?**: `unknown`

• **options.code?**: [`GeneralCommonErrorCode`](../type-aliases/GeneralCommonErrorCode.md)

• **options.message?**: `string`

#### Returns

[`GeneralCommonError`](GeneralCommonError.md)

#### Overrides

[`CommonError`](CommonError.md).[`constructor`](CommonError.md#constructors)

## Properties

### code

> `readonly` **code**: [`GeneralCommonErrorCode`](../type-aliases/GeneralCommonErrorCode.md)

#### Overrides

[`CommonError`](CommonError.md).[`code`](CommonError.md#code)

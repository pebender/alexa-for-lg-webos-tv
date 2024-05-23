[**alexa-for-lg-webos-tv**](../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/general-common-error](../README.md) / GeneralCommonError

# Class: GeneralCommonError

A [CommonError](../../common-error/classes/CommonError.md) subclass for errors that do not fit into any of the
other error classes. The supported errors codes are given by
[GeneralCommonErrorCode](../type-aliases/GeneralCommonErrorCode.md).

## Extends

- [`CommonError`](../../common-error/classes/CommonError.md)

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

[`CommonError`](../../common-error/classes/CommonError.md).[`constructor`](../../common-error/classes/CommonError.md#constructors)

## Properties

### code

> `readonly` **code**: [`GeneralCommonErrorCode`](../type-aliases/GeneralCommonErrorCode.md)

#### Overrides

[`CommonError`](../../common-error/classes/CommonError.md).[`code`](../../common-error/classes/CommonError.md#code)

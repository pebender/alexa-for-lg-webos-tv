[**alexa-for-lg-webos-tv**](../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/error](../README.md) / DatabaseCommonError

# Class: DatabaseCommonError

A [CommonError](CommonError.md) subclass for database related errors. The supported
errors codes are given by [DatabaseCommonErrorCode](../type-aliases/DatabaseCommonErrorCode.md).

## Extends

- [`CommonError`](CommonError.md)

## Constructors

### new DatabaseCommonError()

> **new DatabaseCommonError**(`options`): [`DatabaseCommonError`](DatabaseCommonError.md)

#### Parameters

• **options**

• **options.cause?**: `unknown`

• **options.code?**: [`DatabaseCommonErrorCode`](../type-aliases/DatabaseCommonErrorCode.md)

• **options.message?**: `string`

#### Returns

[`DatabaseCommonError`](DatabaseCommonError.md)

#### Overrides

[`CommonError`](CommonError.md).[`constructor`](CommonError.md#constructors)

## Properties

### code

> `readonly` **code**: [`DatabaseCommonErrorCode`](../type-aliases/DatabaseCommonErrorCode.md)

#### Overrides

[`CommonError`](CommonError.md).[`code`](CommonError.md#code)

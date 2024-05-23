[**alexa-for-lg-webos-tv**](../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/database-common-error](../README.md) / DatabaseCommonError

# Class: DatabaseCommonError

A [CommonError](../../common-error/classes/CommonError.md) subclass for database related errors. The supported
errors codes are given by [DatabaseCommonErrorCode](../type-aliases/DatabaseCommonErrorCode.md).

## Extends

- [`CommonError`](../../common-error/classes/CommonError.md)

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

[`CommonError`](../../common-error/classes/CommonError.md).[`constructor`](../../common-error/classes/CommonError.md#constructors)

## Properties

### code

> `readonly` **code**: [`DatabaseCommonErrorCode`](../type-aliases/DatabaseCommonErrorCode.md)

#### Overrides

[`CommonError`](../../common-error/classes/CommonError.md).[`code`](../../common-error/classes/CommonError.md#code)

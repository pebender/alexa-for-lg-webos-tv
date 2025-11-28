[**alexa-for-lg-webos-tv**](../../../README.md)

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/database-common-error](../README.md) / DatabaseCommonError

# Class: DatabaseCommonError

A [CommonError](../../common-error/classes/CommonError.md) subclass for database related errors. The supported
errors codes are given by [DatabaseCommonErrorCode](../type-aliases/DatabaseCommonErrorCode.md).

## Extends

- [`CommonError`](../../common-error/classes/CommonError.md)

## Constructors

### Constructor

> **new DatabaseCommonError**(`options`): `DatabaseCommonError`

#### Parameters

##### options

###### cause?

`unknown`

###### code?

[`DatabaseCommonErrorCode`](../type-aliases/DatabaseCommonErrorCode.md)

###### message?

`string`

#### Returns

`DatabaseCommonError`

#### Overrides

[`CommonError`](../../common-error/classes/CommonError.md).[`constructor`](../../common-error/classes/CommonError.md#constructor)

## Properties

### code

> `readonly` **code**: [`DatabaseCommonErrorCode`](../type-aliases/DatabaseCommonErrorCode.md)

#### Overrides

[`CommonError`](../../common-error/classes/CommonError.md).[`code`](../../common-error/classes/CommonError.md#code)

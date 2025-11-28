[**alexa-for-lg-webos-tv**](../../../README.md)

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/general-common-error](../README.md) / GeneralCommonError

# Class: GeneralCommonError

A [CommonError](../../common-error/classes/CommonError.md) subclass for errors that do not fit into any of the
other error classes. The supported errors codes are given by
[GeneralCommonErrorCode](../type-aliases/GeneralCommonErrorCode.md).

## Extends

- [`CommonError`](../../common-error/classes/CommonError.md)

## Constructors

### Constructor

> **new GeneralCommonError**(`options`): `GeneralCommonError`

#### Parameters

##### options

###### cause?

`unknown`

###### code?

[`GeneralCommonErrorCode`](../type-aliases/GeneralCommonErrorCode.md)

###### message?

`string`

#### Returns

`GeneralCommonError`

#### Overrides

[`CommonError`](../../common-error/classes/CommonError.md).[`constructor`](../../common-error/classes/CommonError.md#constructor)

## Properties

### code

> `readonly` **code**: [`GeneralCommonErrorCode`](../type-aliases/GeneralCommonErrorCode.md)

#### Overrides

[`CommonError`](../../common-error/classes/CommonError.md).[`code`](../../common-error/classes/CommonError.md#code)

[**alexa-for-lg-webos-tv**](../../../../../README.md)

***

[alexa-for-lg-webos-tv](../../../../../modules.md) / [skill/lib/link/link-common-error](../README.md) / LinkCommonError

# Class: LinkCommonError

A [CommonError](../../../../../common/common-error/classes/CommonError.md) subclass for skill to bridge
interface link related errors. The supported errors are given by
[LinkCommonErrorCode](../type-aliases/LinkCommonErrorCode.md).

## Extends

- [`CommonError`](../../../../../common/common-error/classes/CommonError.md)

## Constructors

### Constructor

> **new LinkCommonError**(`options`): `LinkCommonError`

#### Parameters

##### options

###### cause?

`unknown`

###### code?

[`LinkCommonErrorCode`](../type-aliases/LinkCommonErrorCode.md)

###### message?

`string`

#### Returns

`LinkCommonError`

#### Overrides

[`CommonError`](../../../../../common/common-error/classes/CommonError.md).[`constructor`](../../../../../common/common-error/classes/CommonError.md#constructor)

## Properties

### code

> `readonly` **code**: [`LinkCommonErrorCode`](../type-aliases/LinkCommonErrorCode.md)

#### Overrides

[`CommonError`](../../../../../common/common-error/classes/CommonError.md).[`code`](../../../../../common/common-error/classes/CommonError.md#code)

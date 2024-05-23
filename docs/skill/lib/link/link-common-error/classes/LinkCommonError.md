[**alexa-for-lg-webos-tv**](../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../modules.md) / [skill/lib/link/link-common-error](../README.md) / LinkCommonError

# Class: LinkCommonError

A [CommonError](../../../../../common/common-error/classes/CommonError.md) subclass for skill to bridge
interface link related errors. The supported errors are given by
[LinkCommonErrorCode](../type-aliases/LinkCommonErrorCode.md).

## Extends

- [`CommonError`](../../../../../common/common-error/classes/CommonError.md)

## Constructors

### new LinkCommonError()

> **new LinkCommonError**(`options`): [`LinkCommonError`](LinkCommonError.md)

#### Parameters

• **options**

• **options.cause?**: `unknown`

• **options.code?**: [`LinkCommonErrorCode`](../type-aliases/LinkCommonErrorCode.md)

• **options.message?**: `string`

#### Returns

[`LinkCommonError`](LinkCommonError.md)

#### Overrides

[`CommonError`](../../../../../common/common-error/classes/CommonError.md).[`constructor`](../../../../../common/common-error/classes/CommonError.md#constructors)

## Properties

### code

> `readonly` **code**: [`LinkCommonErrorCode`](../type-aliases/LinkCommonErrorCode.md)

#### Overrides

[`CommonError`](../../../../../common/common-error/classes/CommonError.md).[`code`](../../../../../common/common-error/classes/CommonError.md#code)

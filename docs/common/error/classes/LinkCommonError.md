[**alexa-for-lg-webos-tv**](../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/error](../README.md) / LinkCommonError

# Class: LinkCommonError

A [CommonError](CommonError.md) subclass for skill to bridge interface link related
errors. The supported errors are given by [LinkCommonErrorCode](../type-aliases/LinkCommonErrorCode.md).

## Extends

- [`CommonError`](CommonError.md)

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

[`CommonError`](CommonError.md).[`constructor`](CommonError.md#constructors)

## Properties

### code

> `readonly` **code**: [`LinkCommonErrorCode`](../type-aliases/LinkCommonErrorCode.md)

#### Overrides

[`CommonError`](CommonError.md).[`code`](CommonError.md#code)

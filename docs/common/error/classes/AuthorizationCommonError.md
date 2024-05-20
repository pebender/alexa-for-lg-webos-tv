[**alexa-for-lg-webos-tv**](../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/error](../README.md) / AuthorizationCommonError

# Class: AuthorizationCommonError

A [CommonError](CommonError.md) subclass for authorization related errors. The
supported errors codes are given by [AuthorizationCommonErrorCode](../type-aliases/AuthorizationCommonErrorCode.md).

## Extends

- [`CommonError`](CommonError.md)

## Constructors

### new AuthorizationCommonError()

> **new AuthorizationCommonError**(`options`): [`AuthorizationCommonError`](AuthorizationCommonError.md)

#### Parameters

• **options**

• **options.cause?**: `unknown`

• **options.code**: [`AuthorizationCommonErrorCode`](../type-aliases/AuthorizationCommonErrorCode.md)

• **options.message?**: `string`

#### Returns

[`AuthorizationCommonError`](AuthorizationCommonError.md)

#### Overrides

[`CommonError`](CommonError.md).[`constructor`](CommonError.md#constructors)

## Properties

### code

> `readonly` **code**: [`AuthorizationCommonErrorCode`](../type-aliases/AuthorizationCommonErrorCode.md)

#### Overrides

[`CommonError`](CommonError.md).[`code`](CommonError.md#code)

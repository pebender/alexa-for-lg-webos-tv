[**alexa-for-lg-webos-tv**](../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/profile](../README.md) / UserProfileCommonError

# Class: UserProfileCommonError

The class from which all errors are derived. Deriving all errors from this
class ensures that all errors will have an error code (`code`) and will be
understood where a `Error` class or a `NodeJS.ErrnoException` interface is
expected. Making `code` an abstract string enables each derived error
subclass to enumerate the `code` values it supports by declaring `code` to be
of a string literal type that enumerates the supported values supported
codes.

## Extends

- [`CommonError`](../../common-error/classes/CommonError.md)

## Constructors

### new UserProfileCommonError()

> **new UserProfileCommonError**(`options`): [`UserProfileCommonError`](UserProfileCommonError.md)

#### Parameters

• **options**

• **options.cause?**: `unknown`

• **options.code**: [`UserProfileCommonErrorCode`](../type-aliases/UserProfileCommonErrorCode.md)

• **options.message?**: `string`

#### Returns

[`UserProfileCommonError`](UserProfileCommonError.md)

#### Overrides

[`CommonError`](../../common-error/classes/CommonError.md).[`constructor`](../../common-error/classes/CommonError.md#constructors)

## Properties

### code

> `readonly` **code**: [`UserProfileCommonErrorCode`](../type-aliases/UserProfileCommonErrorCode.md)

#### Overrides

[`CommonError`](../../common-error/classes/CommonError.md).[`code`](../../common-error/classes/CommonError.md#code)

[**alexa-for-lg-webos-tv**](../../../README.md)

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/user-profile](../README.md) / UserProfileCommonError

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

### Constructor

> **new UserProfileCommonError**(`options`): `UserProfileCommonError`

#### Parameters

##### options

###### cause?

`unknown`

###### code

[`UserProfileCommonErrorCode`](../type-aliases/UserProfileCommonErrorCode.md)

###### message?

`string`

#### Returns

`UserProfileCommonError`

#### Overrides

[`CommonError`](../../common-error/classes/CommonError.md).[`constructor`](../../common-error/classes/CommonError.md#constructor)

## Properties

### code

> `readonly` **code**: [`UserProfileCommonErrorCode`](../type-aliases/UserProfileCommonErrorCode.md)

#### Overrides

[`CommonError`](../../common-error/classes/CommonError.md).[`code`](../../common-error/classes/CommonError.md#code)

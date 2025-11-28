[**alexa-for-lg-webos-tv**](../../../README.md)

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/common-error](../README.md) / CommonError

# Abstract Class: CommonError

The class from which all errors are derived. Deriving all errors from this
class ensures that all errors will have an error code (`code`) and will be
understood where a `Error` class or a `NodeJS.ErrnoException` interface is
expected. Making `code` an abstract string enables each derived error
subclass to enumerate the `code` values it supports by declaring `code` to be
of a string literal type that enumerates the supported values supported
codes.

## Extends

- `Error`

## Extended by

- [`HttpCommonError`](../../../skill/lib/link/http-common-error/classes/HttpCommonError.md)
- [`LinkCommonError`](../../../skill/lib/link/link-common-error/classes/LinkCommonError.md)
- [`TvCommonError`](../../../bridge/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error/classes/TvCommonError.md)
- [`DatabaseCommonError`](../../database-common-error/classes/DatabaseCommonError.md)
- [`GeneralCommonError`](../../general-common-error/classes/GeneralCommonError.md)
- [`UserProfileCommonError`](../../user-profile/classes/UserProfileCommonError.md)

## Implements

- `ErrnoException`

## Constructors

### Constructor

> `protected` **new CommonError**(`options`): `CommonError`

#### Parameters

##### options

###### cause?

`unknown`

###### code?

`string`

###### message?

`string`

#### Returns

`CommonError`

#### Overrides

`Error.constructor`

## Properties

### code

> `abstract` **code**: `string`

#### Implementation of

`NodeJS.ErrnoException.code`

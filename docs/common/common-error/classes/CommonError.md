[**alexa-for-lg-webos-tv**](../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/common-error](../README.md) / CommonError

# Class: `abstract` CommonError

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

- [`HttpCommonError`](../../../skill/lib/link/https-request/classes/HttpCommonError.md)
- [`LinkCommonError`](../../../skill/lib/link/link-common-error/classes/LinkCommonError.md)
- [`TvCommonError`](../../../bridge/lib/backend/tv-common-error/classes/TvCommonError.md)
- [`DatabaseCommonError`](../../database-common-error/classes/DatabaseCommonError.md)
- [`GeneralCommonError`](../../general-common-error/classes/GeneralCommonError.md)
- [`UserProfileCommonError`](../../user-profile/classes/UserProfileCommonError.md)

## Implements

- `ErrnoException`

## Constructors

### new CommonError()

> `protected` **new CommonError**(`options`): [`CommonError`](CommonError.md)

#### Parameters

• **options**

• **options.cause?**: `unknown`

• **options.code?**: `string`

• **options.message?**: `string`

#### Returns

[`CommonError`](CommonError.md)

#### Overrides

`Error.constructor`

## Properties

### code

> `abstract` **code**: `string`

#### Implementation of

`NodeJS.ErrnoException.code`

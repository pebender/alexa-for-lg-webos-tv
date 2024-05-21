[**alexa-for-lg-webos-tv**](../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../modules.md) / [bridge/lib/backend/tv](../README.md) / TvCommonError

# Class: TvCommonError

A [CommonError](../../../../../common/error/classes/CommonError.md) subclass for TV related
errors. The supported errors are given by [TvCommonErrorCode](../type-aliases/TvCommonErrorCode.md).

## Extends

- [`CommonError`](../../../../../common/error/classes/CommonError.md)

## Constructors

### new TvCommonError()

> **new TvCommonError**(`options`): [`TvCommonError`](TvCommonError.md)

#### Parameters

• **options**

• **options.cause?**: `unknown`

• **options.code?**: [`TvCommonErrorCode`](../type-aliases/TvCommonErrorCode.md)

• **options.message?**: `string`

• **options.request?**: [`Request`](../../../../types/lgtv2/namespaces/export=/interfaces/Request.md)

• **options.response?**: [`Response`](../../../../types/lgtv2/namespaces/export=/interfaces/Response.md)

• **options.tv?**: [`TV`](../interfaces/TV.md)

#### Returns

[`TvCommonError`](TvCommonError.md)

#### Overrides

[`CommonError`](../../../../../common/error/classes/CommonError.md).[`constructor`](../../../../../common/error/classes/CommonError.md#constructors)

## Properties

### code

> `readonly` **code**: [`TvCommonErrorCode`](../type-aliases/TvCommonErrorCode.md)

#### Overrides

[`CommonError`](../../../../../common/error/classes/CommonError.md).[`code`](../../../../../common/error/classes/CommonError.md#code)

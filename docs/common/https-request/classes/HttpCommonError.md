[**alexa-for-lg-webos-tv**](../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/https-request](../README.md) / HttpCommonError

# Class: HttpCommonError

A [CommonError](../../error/classes/CommonError.md) subclass for HTTP related
errors. The supported errors are given by [HttpCommonErrorCode](../type-aliases/HttpCommonErrorCode.md).

## Extends

- [`CommonError`](../../error/classes/CommonError.md)

## Constructors

### new HttpCommonError()

> **new HttpCommonError**(`options`): [`HttpCommonError`](HttpCommonError.md)

#### Parameters

• **options**

• **options.cause?**: `unknown`

• **options.code**: [`HttpCommonErrorCode`](../type-aliases/HttpCommonErrorCode.md)

• **options.message?**: `string`

• **options.requestBody?**: `object`

• **options.requestOptions?**: `RequestOptions`

• **options.responseBody?**: `string` \| `object`

• **options.responseHeaders?**: `IncomingHttpHeaders`

• **options.responseStatusCode?**: `number`

#### Returns

[`HttpCommonError`](HttpCommonError.md)

#### Overrides

[`CommonError`](../../error/classes/CommonError.md).[`constructor`](../../error/classes/CommonError.md#constructors)

## Properties

### code

> `readonly` **code**: [`HttpCommonErrorCode`](../type-aliases/HttpCommonErrorCode.md)

#### Overrides

[`CommonError`](../../error/classes/CommonError.md).[`code`](../../error/classes/CommonError.md#code)

***

### requestBody?

> `optional` `readonly` **requestBody**: `object`

***

### requestOptions?

> `optional` `readonly` **requestOptions**: `RequestOptions`

***

### responseBody?

> `optional` `readonly` **responseBody**: `string` \| `object`

***

### responseHeaders?

> `optional` `readonly` **responseHeaders**: `IncomingHttpHeaders`

***

### responseStatusCode?

> `optional` `readonly` **responseStatusCode**: `number`

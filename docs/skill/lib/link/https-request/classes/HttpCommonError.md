[**alexa-for-lg-webos-tv**](../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../modules.md) / [skill/lib/link/https-request](../README.md) / HttpCommonError

# Class: HttpCommonError

A [CommonError](../../../../../common/common-error/classes/CommonError.md) subclass for HTTP related
errors. The supported errors are given by [HttpCommonErrorCode](../type-aliases/HttpCommonErrorCode.md).

## Extends

- [`CommonError`](../../../../../common/common-error/classes/CommonError.md)

## Constructors

### new HttpCommonError()

> **new HttpCommonError**(`options`): [`HttpCommonError`](HttpCommonError.md)

#### Parameters

• **options**

• **options.cause?**: `unknown`

• **options.code**: [`HttpCommonErrorCode`](../type-aliases/HttpCommonErrorCode.md)

• **options.message?**: `string`

• **options.requestBody?**: `object`

• **options.requestHeaders?**: `Record`\<`string`, `string`\>

• **options.requestMethod?**: `"POST"` \| `"GET"`

• **options.requestUrl?**: `string`

• **options.responseBody?**: `string` \| `object`

• **options.responseHeaders?**: `Headers`

• **options.responseStatusCode?**: `number`

#### Returns

[`HttpCommonError`](HttpCommonError.md)

#### Overrides

[`CommonError`](../../../../../common/common-error/classes/CommonError.md).[`constructor`](../../../../../common/common-error/classes/CommonError.md#constructors)

## Properties

### code

> `readonly` **code**: [`HttpCommonErrorCode`](../type-aliases/HttpCommonErrorCode.md)

#### Overrides

[`CommonError`](../../../../../common/common-error/classes/CommonError.md).[`code`](../../../../../common/common-error/classes/CommonError.md#code)

***

### requestBody?

> `optional` `readonly` **requestBody**: `object`

***

### requestHeaders?

> `optional` `readonly` **requestHeaders**: `Record`\<`string`, `string`\>

***

### requestMethod?

> `optional` `readonly` **requestMethod**: `"POST"` \| `"GET"`

***

### requestUrl?

> `optional` `readonly` **requestUrl**: `string`

***

### responseBody?

> `optional` `readonly` **responseBody**: `string` \| `object`

***

### responseHeaders?

> `optional` `readonly` **responseHeaders**: `Headers`

***

### responseStatusCode?

> `optional` `readonly` **responseStatusCode**: `number`

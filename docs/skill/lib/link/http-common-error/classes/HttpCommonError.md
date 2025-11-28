[**alexa-for-lg-webos-tv**](../../../../../README.md)

***

[alexa-for-lg-webos-tv](../../../../../modules.md) / [skill/lib/link/http-common-error](../README.md) / HttpCommonError

# Class: HttpCommonError

A [CommonError](../../../../../common/common-error/classes/CommonError.md) subclass for HTTP related
errors. The supported errors are given by [HttpCommonErrorCode](../type-aliases/HttpCommonErrorCode.md).

## Extends

- [`CommonError`](../../../../../common/common-error/classes/CommonError.md)

## Constructors

### Constructor

> **new HttpCommonError**(`options`): `HttpCommonError`

#### Parameters

##### options

###### cause?

`unknown`

###### code

[`HttpCommonErrorCode`](../type-aliases/HttpCommonErrorCode.md)

###### message?

`string`

###### requestBody?

`object`

###### requestHeaders?

`Record`\<`string`, `string`\>

###### requestMethod?

`"POST"` \| `"GET"`

###### requestUrl?

`string`

###### responseBody?

`string` \| `object`

###### responseHeaders?

`Headers`

###### responseStatusCode?

`number`

#### Returns

`HttpCommonError`

#### Overrides

[`CommonError`](../../../../../common/common-error/classes/CommonError.md).[`constructor`](../../../../../common/common-error/classes/CommonError.md#constructor)

## Properties

### code

> `readonly` **code**: [`HttpCommonErrorCode`](../type-aliases/HttpCommonErrorCode.md)

#### Overrides

[`CommonError`](../../../../../common/common-error/classes/CommonError.md).[`code`](../../../../../common/common-error/classes/CommonError.md#code)

***

### requestBody?

> `readonly` `optional` **requestBody**: `object`

***

### requestHeaders?

> `readonly` `optional` **requestHeaders**: `Record`\<`string`, `string`\>

***

### requestMethod?

> `readonly` `optional` **requestMethod**: `"POST"` \| `"GET"`

***

### requestUrl?

> `readonly` `optional` **requestUrl**: `string`

***

### responseBody?

> `readonly` `optional` **responseBody**: `string` \| `object`

***

### responseHeaders?

> `readonly` `optional` **responseHeaders**: `Headers`

***

### responseStatusCode?

> `readonly` `optional` **responseStatusCode**: `number`

[**Documentation**](../../../../../../../../README.md)

***

[Documentation](../../../../../../../../README.md) / [@backinthirty/alexa-for-lg-webos-tv-bridge](../../../../../../README.md) / [lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error](../README.md) / TvCommonError

# Class: TvCommonError

Defined in: [packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error.ts:28](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error.ts#L28)

A [CommonError](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md) subclass for TV related
errors. The supported errors are given by [TvCommonErrorCode](../type-aliases/TvCommonErrorCode.md).

## Extends

- [`CommonError`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md)

## Constructors

### Constructor

> **new TvCommonError**(`options`): `TvCommonError`

Defined in: [packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error.ts:44](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error.ts#L44)

#### Parameters

##### options

###### cause?

`unknown`

###### code?

[`TvCommonErrorCode`](../type-aliases/TvCommonErrorCode.md)

###### lgtvRequest?

`Request`

###### lgtvResponse?

`Response`

###### message?

`string`

###### ssdpDescription?

`string`

###### ssdpResponse?

\{ `headers`: `SsdpHeaders`; `messageName`: `string`; \}

###### ssdpResponse.headers

`SsdpHeaders`

###### ssdpResponse.messageName

`string`

###### tv?

`Partial`\<[`TvRecord`](../../tv-record/type-aliases/TvRecord.md)\>

#### Returns

`TvCommonError`

#### Overrides

[`CommonError`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md).[`constructor`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md#constructor)

## Properties

### cause?

> `optional` **cause**: `unknown`

Defined in: node\_modules/typescript/lib/lib.es2022.error.d.ts:26

#### Inherited from

[`CommonError`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md).[`cause`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md#cause)

***

### code

> `readonly` **code**: [`TvCommonErrorCode`](../type-aliases/TvCommonErrorCode.md)

Defined in: [packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error.ts:29](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error.ts#L29)

#### Overrides

[`CommonError`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md).[`code`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md#code)

***

### lgtvRequest?

> `readonly` `optional` **lgtvRequest**: `Request`

Defined in: [packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error.ts:33](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error.ts#L33)

***

### lgtvResponse?

> `readonly` `optional` **lgtvResponse**: `Response`

Defined in: [packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error.ts:35](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error.ts#L35)

***

### message

> **message**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1077

#### Inherited from

[`CommonError`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md).[`message`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md#message)

***

### name

> **name**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1076

#### Inherited from

[`CommonError`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md).[`name`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md#name)

***

### ssdpDescription?

> `readonly` `optional` **ssdpDescription**: `string`

Defined in: [packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error.ts:42](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error.ts#L42)

***

### ssdpResponse?

> `readonly` `optional` **ssdpResponse**: `object`

Defined in: [packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error.ts:37](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error.ts#L37)

#### headers

> **headers**: `SsdpHeaders`

#### messageName

> **messageName**: `string`

***

### stack?

> `optional` **stack**: `string`

Defined in: node\_modules/typescript/lib/lib.es5.d.ts:1078

#### Inherited from

[`CommonError`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md).[`stack`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md#stack)

***

### tv?

> `readonly` `optional` **tv**: `Partial`\<[`TvRecord`](../../tv-record/type-aliases/TvRecord.md)\>

Defined in: [packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error.ts:31](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error.ts#L31)

***

### stackTraceLimit

> `static` **stackTraceLimit**: `number`

Defined in: packages/bridge/node\_modules/@types/node/globals.d.ts:68

The `Error.stackTraceLimit` property specifies the number of stack frames
collected by a stack trace (whether generated by `new Error().stack` or
`Error.captureStackTrace(obj)`).

The default value is `10` but may be set to any valid JavaScript number. Changes
will affect any stack trace captured _after_ the value has been changed.

If set to a non-number value, or set to a negative number, stack traces will
not capture any frames.

#### Inherited from

[`CommonError`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md).[`stackTraceLimit`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md#stacktracelimit)

## Methods

### captureStackTrace()

> `static` **captureStackTrace**(`targetObject`, `constructorOpt?`): `void`

Defined in: packages/bridge/node\_modules/@types/node/globals.d.ts:52

Creates a `.stack` property on `targetObject`, which when accessed returns
a string representing the location in the code at which
`Error.captureStackTrace()` was called.

```js
const myObject = {};
Error.captureStackTrace(myObject);
myObject.stack;  // Similar to `new Error().stack`
```

The first line of the trace will be prefixed with
`${myObject.name}: ${myObject.message}`.

The optional `constructorOpt` argument accepts a function. If given, all frames
above `constructorOpt`, including `constructorOpt`, will be omitted from the
generated stack trace.

The `constructorOpt` argument is useful for hiding implementation
details of error generation from the user. For instance:

```js
function a() {
  b();
}

function b() {
  c();
}

function c() {
  // Create an error without stack trace to avoid calculating the stack trace twice.
  const { stackTraceLimit } = Error;
  Error.stackTraceLimit = 0;
  const error = new Error();
  Error.stackTraceLimit = stackTraceLimit;

  // Capture the stack trace above function b
  Error.captureStackTrace(error, b); // Neither function c, nor b is included in the stack trace
  throw error;
}

a();
```

#### Parameters

##### targetObject

`object`

##### constructorOpt?

`Function`

#### Returns

`void`

#### Inherited from

[`CommonError`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md).[`captureStackTrace`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md#capturestacktrace)

***

### prepareStackTrace()

> `static` **prepareStackTrace**(`err`, `stackTraces`): `any`

Defined in: packages/bridge/node\_modules/@types/node/globals.d.ts:56

#### Parameters

##### err

`Error`

##### stackTraces

`CallSite`[]

#### Returns

`any`

#### See

https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Inherited from

[`CommonError`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md).[`prepareStackTrace`](../../../../../../../alexa-for-lg-webos-tv-common/common-error/classes/CommonError.md#preparestacktrace)

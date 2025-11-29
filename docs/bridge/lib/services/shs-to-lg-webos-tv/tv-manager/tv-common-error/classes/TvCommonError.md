[**alexa-for-lg-webos-tv**](../../../../../../../README.md)

***

[alexa-for-lg-webos-tv](../../../../../../../modules.md) / [bridge/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error](../README.md) / TvCommonError

# Class: TvCommonError

A [CommonError](../../../../../../../common/common-error/classes/CommonError.md) subclass for TV related
errors. The supported errors are given by [TvCommonErrorCode](../type-aliases/TvCommonErrorCode.md).

## Extends

- [`CommonError`](../../../../../../../common/common-error/classes/CommonError.md)

## Constructors

### Constructor

> **new TvCommonError**(`options`): `TvCommonError`

#### Parameters

##### options

###### cause?

`unknown`

###### code?

[`TvCommonErrorCode`](../type-aliases/TvCommonErrorCode.md)

###### lgtvRequest?

[`Request`](../../../../../../types/lgtv2/interfaces/Request.md)

###### lgtvResponse?

[`Response`](../../../../../../types/lgtv2/interfaces/Response.md)

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

[`CommonError`](../../../../../../../common/common-error/classes/CommonError.md).[`constructor`](../../../../../../../common/common-error/classes/CommonError.md#constructor)

## Properties

### code

> `readonly` **code**: [`TvCommonErrorCode`](../type-aliases/TvCommonErrorCode.md)

#### Overrides

[`CommonError`](../../../../../../../common/common-error/classes/CommonError.md).[`code`](../../../../../../../common/common-error/classes/CommonError.md#code)

***

### lgtvRequest?

> `readonly` `optional` **lgtvRequest**: [`Request`](../../../../../../types/lgtv2/interfaces/Request.md)

***

### lgtvResponse?

> `readonly` `optional` **lgtvResponse**: [`Response`](../../../../../../types/lgtv2/interfaces/Response.md)

***

### ssdpDescription?

> `readonly` `optional` **ssdpDescription**: `string`

***

### ssdpResponse?

> `readonly` `optional` **ssdpResponse**: `object`

#### headers

> **headers**: `SsdpHeaders`

#### messageName

> **messageName**: `string`

***

### tv?

> `readonly` `optional` **tv**: `Partial`\<[`TvRecord`](../../tv-record/type-aliases/TvRecord.md)\>

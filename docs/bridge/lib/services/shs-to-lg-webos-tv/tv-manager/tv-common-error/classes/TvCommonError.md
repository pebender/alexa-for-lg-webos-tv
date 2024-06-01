[**alexa-for-lg-webos-tv**](../../../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../../../modules.md) / [bridge/lib/services/shs-to-lg-webos-tv/tv-manager/tv-common-error](../README.md) / TvCommonError

# Class: TvCommonError

A [CommonError](../../../../../../../common/common-error/classes/CommonError.md) subclass for TV related
errors. The supported errors are given by [TvCommonErrorCode](../type-aliases/TvCommonErrorCode.md).

## Extends

- [`CommonError`](../../../../../../../common/common-error/classes/CommonError.md)

## Constructors

### new TvCommonError()

> **new TvCommonError**(`options`): [`TvCommonError`](TvCommonError.md)

#### Parameters

• **options**

• **options.cause?**: `unknown`

• **options.code?**: [`TvCommonErrorCode`](../type-aliases/TvCommonErrorCode.md)

• **options.lgtvRequest?**: [`Request`](../../../../../../types/lgtv2/namespaces/export=/interfaces/Request.md)

• **options.lgtvResponse?**: [`Response`](../../../../../../types/lgtv2/namespaces/export=/interfaces/Response.md)

• **options.message?**: `string`

• **options.ssdpDescription?**: `string`

• **options.ssdpResponse?**

• **options.ssdpResponse.headers**: [`SsdpHeaders`](../../../../../../types/node-ssdp/interfaces/SsdpHeaders.md)

• **options.ssdpResponse.messageName**: `string`

• **options.ssdpResponse.rinfo**: `RemoteInfo`

• **options.tv?**: `Partial`\<[`TvRecord`](../../tv-record/type-aliases/TvRecord.md)\>

#### Returns

[`TvCommonError`](TvCommonError.md)

#### Overrides

[`CommonError`](../../../../../../../common/common-error/classes/CommonError.md).[`constructor`](../../../../../../../common/common-error/classes/CommonError.md#constructors)

## Properties

### code

> `readonly` **code**: [`TvCommonErrorCode`](../type-aliases/TvCommonErrorCode.md)

#### Overrides

[`CommonError`](../../../../../../../common/common-error/classes/CommonError.md).[`code`](../../../../../../../common/common-error/classes/CommonError.md#code)

***

### lgtvRequest?

> `optional` `readonly` **lgtvRequest**: [`Request`](../../../../../../types/lgtv2/namespaces/export=/interfaces/Request.md)

***

### lgtvResponse?

> `optional` `readonly` **lgtvResponse**: [`Response`](../../../../../../types/lgtv2/namespaces/export=/interfaces/Response.md)

***

### ssdpDescription?

> `optional` `readonly` **ssdpDescription**: `string`

***

### ssdpResponse?

> `optional` `readonly` **ssdpResponse**: `object`

#### headers

> **headers**: [`SsdpHeaders`](../../../../../../types/node-ssdp/interfaces/SsdpHeaders.md)

#### messageName

> **messageName**: `string`

#### rinfo

> **rinfo**: `RemoteInfo`

***

### tv?

> `optional` `readonly` **tv**: `Partial`\<[`TvRecord`](../../tv-record/type-aliases/TvRecord.md)\>

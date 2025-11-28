[**alexa-for-lg-webos-tv**](../../../../../../../README.md)

***

[alexa-for-lg-webos-tv](../../../../../../../modules.md) / [bridge/lib/services/shs-to-lg-webos-tv/tv-manager/tv-control](../README.md) / TvControl

# Class: TvControl

## Extends

- `EventEmitter`

## Accessors

### tv

#### Get Signature

> **get** **tv**(): [`TvRecord`](../../tv-record/type-aliases/TvRecord.md)

##### Returns

[`TvRecord`](../../tv-record/type-aliases/TvRecord.md)

## Methods

### getPowerState()

> **getPowerState**(): `"ON"` \| `"OFF"`

#### Returns

`"ON"` \| `"OFF"`

***

### lgtvCommand()

> **lgtvCommand**(`lgtvRequest`): `Promise`\<[`Response`](../../../../../../types/lgtv2/interfaces/Response.md)\>

Sends a request to the TvRecord and returns the response.

#### Parameters

##### lgtvRequest

[`Request`](../../../../../../types/lgtv2/interfaces/Request.md)

The LGTV request to send to the TvRecord.

#### Returns

`Promise`\<[`Response`](../../../../../../types/lgtv2/interfaces/Response.md)\>

The LGTV response from the TvRecord.

#### Throws

a [CommonError](../../../../../../../common/common-error/classes/CommonError.md) with

- general: "tv", specific: "connectionRequestError",
- general: "tv", specific: "connectionResponseInvalidFormat",
- general: "tv", specific: "connectionResponseError", or
- general: "tv", specific: "lgtvApiViolation"

***

### start()

> **start**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### turnOff()

> **turnOff**(): `boolean`

#### Returns

`boolean`

***

### turnOn()

> **turnOn**(): `Promise`\<`boolean`\>

#### Returns

`Promise`\<`boolean`\>

***

### build()

> `static` **build**(`database`, `tv`): `TvControl`

#### Parameters

##### database

[`DatabaseTable`](../../../../../database/classes/DatabaseTable.md)\<[`TvRecord`](../../tv-record/type-aliases/TvRecord.md)\>

##### tv

[`TvRecord`](../../tv-record/type-aliases/TvRecord.md)

#### Returns

`TvControl`

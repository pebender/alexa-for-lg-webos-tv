[**alexa-for-lg-webos-tv**](../../../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../../../modules.md) / [bridge/lib/services/shs-to-lg-webos-tv/tv-manager/tv-control](../README.md) / TvControl

# Class: TvControl

## Extends

- `EventEmitter`

## Constructors

### new TvControl()

> `private` **new TvControl**(`_database`, `_tv`, `_connection`, `_ssdpNotify`, `_ssdpResponse`): [`TvControl`](TvControl.md)

#### Parameters

• **\_database**: [`DatabaseTable`](../../../../../database/classes/DatabaseTable.md)\<[`TvRecord`](../../tv-record/type-aliases/TvRecord.md)\>

• **\_tv**: [`TvRecord`](../../tv-record/type-aliases/TvRecord.md)

• **\_connection**: [`export=`](../../../../../../types/lgtv2/classes/export=.md)

• **\_ssdpNotify**: [`Server`](../../../../../../types/node-ssdp/classes/Server.md)

• **\_ssdpResponse**: [`Client`](../../../../../../types/node-ssdp/classes/Client.md)

#### Returns

[`TvControl`](TvControl.md)

#### Overrides

`EventEmitter.constructor`

## Properties

### \_connecting

> `private` **\_connecting**: `boolean`

***

### \_connection

> `private` `readonly` **\_connection**: [`export=`](../../../../../../types/lgtv2/classes/export=.md)

***

### \_database

> `private` `readonly` **\_database**: [`DatabaseTable`](../../../../../database/classes/DatabaseTable.md)\<[`TvRecord`](../../tv-record/type-aliases/TvRecord.md)\>

***

### \_poweredOn

> `private` **\_poweredOn**: `boolean`

***

### \_ssdpNotify

> `private` `readonly` **\_ssdpNotify**: [`Server`](../../../../../../types/node-ssdp/classes/Server.md)

***

### \_ssdpResponse

> `private` `readonly` **\_ssdpResponse**: [`Client`](../../../../../../types/node-ssdp/classes/Client.md)

***

### \_tv

> `private` `readonly` **\_tv**: [`TvRecord`](../../tv-record/type-aliases/TvRecord.md)

## Accessors

### tv

> `get` **tv**(): [`TvRecord`](../../tv-record/type-aliases/TvRecord.md)

#### Returns

[`TvRecord`](../../tv-record/type-aliases/TvRecord.md)

## Methods

### addSubscriptionEvents()

> `private` **addSubscriptionEvents**(): `void`

Adds subscriptions to TvRecord state change events. State changes communicated
from the TvRecord are shared using an EventEmitter | EventEmitter
emitting an event containing the subscription identifier, any error and any
response. The error is a [CommonError](../../../../../../../common/common-error/classes/CommonError.md)
with

- general: "tv", specific "subscriptionError",
- general: "tv", specific "lgtvApiViolation",

#### Returns

`void`

***

### getPowerState()

> **getPowerState**(): `"ON"` \| `"OFF"`

#### Returns

`"ON"` \| `"OFF"`

***

### lgtvCommand()

> **lgtvCommand**(`lgtvRequest`): `Promise`\<[`Response`](../../../../../../types/lgtv2/namespaces/export=/interfaces/Response.md)\>

Sends a request to the TvRecord and returns the response.

#### Parameters

• **lgtvRequest**: [`Request`](../../../../../../types/lgtv2/namespaces/export=/interfaces/Request.md)

The LGTV request to send to the TvRecord.

#### Returns

`Promise`\<[`Response`](../../../../../../types/lgtv2/namespaces/export=/interfaces/Response.md)\>

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

> `static` **build**(`database`, `tv`): [`TvControl`](TvControl.md)

#### Parameters

• **database**: [`DatabaseTable`](../../../../../database/classes/DatabaseTable.md)\<[`TvRecord`](../../tv-record/type-aliases/TvRecord.md)\>

• **tv**: [`TvRecord`](../../tv-record/type-aliases/TvRecord.md)

#### Returns

[`TvControl`](TvControl.md)

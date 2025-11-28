[**alexa-for-lg-webos-tv**](../../../../README.md)

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/types/lgtv2](../README.md) / export=

# Class: export=

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new export=**(`opts?`): `LGTV`

#### Parameters

##### opts?

###### clientKey?

`string`

###### keyFile?

`string`

###### reconnect?

`number`

###### saveKey?

(`key`, `callback`) => `void`

###### timeout?

`number`

###### url?

`string`

#### Returns

`LGTV`

#### Overrides

`EventEmitter.constructor`

## Properties

### clientKey

> **clientKey**: `string`

## Methods

### connect()

> **connect**(`host`): `void`

#### Parameters

##### host

`string`

#### Returns

`void`

***

### disconnect()

> **disconnect**(): `void`

#### Returns

`void`

***

### getSocket()

> **getSocket**(`url`, `callback?`): `void`

#### Parameters

##### url

`string`

##### callback?

(`error`, `response?`) => `void`

#### Returns

`void`

***

### on()

#### Call Signature

> **on**(`event`, `listener`): `this`

Adds the `listener` function to the end of the listeners array for the event
named `eventName`. No checks are made to see if the `listener` has already
been added. Multiple calls passing the same combination of `eventName` and
`listener` will result in the `listener` being added, and called, multiple times.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

By default, event listeners are invoked in the order they are added. The `emitter.prependListener()` method can be used as an alternative to add the
event listener to the beginning of the listeners array.

```js
import { EventEmitter } from 'node:events';
const myEE = new EventEmitter();
myEE.on('foo', () => console.log('a'));
myEE.prependListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

##### Parameters

###### event

`"error"` | `"close"`

###### listener

(`error`) => `void`

The callback function

##### Returns

`this`

##### Since

v0.1.101

##### Overrides

`EventEmitter.on`

#### Call Signature

> **on**(`event`, `listener`): `this`

##### Parameters

###### event

`"connect"` | `"prompt"`

###### listener

() => `void`

##### Returns

`this`

##### Overrides

`EventEmitter.on`

#### Call Signature

> **on**(`event`, `listener`): `this`

##### Parameters

###### event

`"connecting"`

###### listener

(`host`) => `void`

##### Returns

`this`

##### Overrides

`EventEmitter.on`

***

### register()

> **register**(): `void`

#### Returns

`void`

***

### request()

#### Call Signature

> **request**(`uri`, `callback?`): `void`

##### Parameters

###### uri

`string`

###### callback?

(`error`, `response?`) => `void`

##### Returns

`void`

#### Call Signature

> **request**(`uri`, `payload`, `callback`): `void`

##### Parameters

###### uri

`string`

###### payload

[`RequestPayload`](../type-aliases/RequestPayload.md)

###### callback

(`error`, `response?`) => `void`

##### Returns

`void`

***

### subscribe()

#### Call Signature

> **subscribe**(`uri`, `callback`): `void`

##### Parameters

###### uri

`string`

###### callback

(`error`, `response?`) => `void`

##### Returns

`void`

#### Call Signature

> **subscribe**(`uri`, `payload`, `callback`): `void`

##### Parameters

###### uri

`string`

###### payload

[`RequestPayload`](../type-aliases/RequestPayload.md)

###### callback

(`error`, `response?`) => `void`

##### Returns

`void`

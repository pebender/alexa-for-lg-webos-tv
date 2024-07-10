[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/types/lgtv2](../README.md) / export=

# Class: export=

## Extends

- `EventEmitter`

## Constructors

### new export=()

> **new export=**(`opts`?): [`export=`](export=.md)

#### Parameters

• **opts?**

• **opts.clientKey?**: `string`

• **opts.keyFile?**: `string`

• **opts.reconnect?**: `number`

• **opts.saveKey?**

• **opts.timeout?**: `number`

• **opts.url?**: `string`

#### Returns

[`export=`](export=.md)

#### Overrides

`EventEmitter.constructor`

## Properties

### clientKey

> **clientKey**: `string`

## Methods

### connect()

> **connect**(`host`): `void`

#### Parameters

• **host**: `string`

#### Returns

`void`

***

### disconnect()

> **disconnect**(): `void`

#### Returns

`void`

***

### getSocket()

> **getSocket**(`url`, `callback`?): `void`

#### Parameters

• **url**: `string`

• **callback?**

#### Returns

`void`

***

### on()

#### on(event, listener)

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

• **event**: `"error"` \| `"close"`

• **listener**

The callback function

##### Returns

`this`

##### Since

v0.1.101

##### Overrides

`EventEmitter.on`

#### on(event, listener)

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

• **event**: `"connect"` \| `"prompt"`

• **listener**

The callback function

##### Returns

`this`

##### Since

v0.1.101

##### Overrides

`EventEmitter.on`

#### on(event, listener)

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

• **event**: `"connecting"`

• **listener**

The callback function

##### Returns

`this`

##### Since

v0.1.101

##### Overrides

`EventEmitter.on`

***

### register()

> **register**(): `void`

#### Returns

`void`

***

### request()

#### request(uri, callback)

> **request**(`uri`, `callback`?): `void`

##### Parameters

• **uri**: `string`

• **callback?**

##### Returns

`void`

#### request(uri, payload, callback)

> **request**(`uri`, `payload`, `callback`): `void`

##### Parameters

• **uri**: `string`

• **payload**: [`RequestPayload`](../namespaces/export=/type-aliases/RequestPayload.md)

• **callback**

##### Returns

`void`

***

### subscribe()

#### subscribe(uri, callback)

> **subscribe**(`uri`, `callback`): `void`

##### Parameters

• **uri**: `string`

• **callback**

##### Returns

`void`

#### subscribe(uri, payload, callback)

> **subscribe**(`uri`, `payload`, `callback`): `void`

##### Parameters

• **uri**: `string`

• **payload**: [`RequestPayload`](../namespaces/export=/type-aliases/RequestPayload.md)

• **callback**

##### Returns

`void`

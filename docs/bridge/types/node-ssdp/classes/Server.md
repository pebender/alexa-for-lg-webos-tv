[**alexa-for-lg-webos-tv**](../../../../README.md)

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/types/node-ssdp](../README.md) / Server

# Class: Server

## Extends

- [`Base`](Base.md)

## Constructors

### Constructor

> **new Server**(`opts?`): `Server`

#### Parameters

##### opts?

[`ServerOptions`](../interfaces/ServerOptions.md)

#### Returns

`Server`

#### Overrides

[`Base`](Base.md).[`constructor`](Base.md#constructor)

## Methods

### addUSN()

> **addUSN**(`device`): `void`

#### Parameters

##### device

`string`

#### Returns

`void`

#### Inherited from

[`Base`](Base.md).[`addUSN`](Base.md#addusn)

***

### advertise()

> **advertise**(`alive?`): `void`

#### Parameters

##### alive?

`boolean`

#### Returns

`void`

***

### emit()

> **emit**(`event`, `headers`, `rinfo`): `boolean`

Synchronously calls each of the listeners registered for the event named `eventName`, in the order they were registered, passing the supplied arguments
to each.

Returns `true` if the event had listeners, `false` otherwise.

```js
import { EventEmitter } from 'node:events';
const myEmitter = new EventEmitter();

// First listener
myEmitter.on('event', function firstListener() {
  console.log('Helloooo! first listener');
});
// Second listener
myEmitter.on('event', function secondListener(arg1, arg2) {
  console.log(`event with parameters ${arg1}, ${arg2} in second listener`);
});
// Third listener
myEmitter.on('event', function thirdListener(...args) {
  const parameters = args.join(', ');
  console.log(`event with parameters ${parameters} in third listener`);
});

console.log(myEmitter.listeners('event'));

myEmitter.emit('event', 1, 2, 3, 4, 5);

// Prints:
// [
//   [Function: firstListener],
//   [Function: secondListener],
//   [Function: thirdListener]
// ]
// Helloooo! first listener
// event with parameters 1, 2 in second listener
// event with parameters 1, 2, 3, 4, 5 in third listener
```

#### Parameters

##### event

`"advertise-alive"` | `"advertise-bye"`

##### headers

[`SsdpHeaders`](../interfaces/SsdpHeaders.md)

##### rinfo

`RemoteInfo`

#### Returns

`boolean`

#### Since

v0.1.26

#### Overrides

`Base.emit`

***

### on()

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

#### Parameters

##### event

`"advertise-alive"` | `"advertise-bye"`

##### listener

(`headers`, `rinfo`) => `void`

The callback function

#### Returns

`this`

#### Since

v0.1.101

#### Overrides

`Base.on`

***

### once()

> **once**(`event`, `listener`): `this`

Adds a **one-time** `listener` function for the event named `eventName`. The
next time `eventName` is triggered, this listener is removed and then invoked.

```js
server.once('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

By default, event listeners are invoked in the order they are added. The `emitter.prependOnceListener()` method can be used as an alternative to add the
event listener to the beginning of the listeners array.

```js
import { EventEmitter } from 'node:events';
const myEE = new EventEmitter();
myEE.once('foo', () => console.log('a'));
myEE.prependOnceListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

#### Parameters

##### event

`"advertise-alive"` | `"advertise-bye"`

##### listener

(`headers`, `rinfo`) => `void`

The callback function

#### Returns

`this`

#### Since

v0.3.0

#### Overrides

`Base.once`

***

### start()

> **start**(`cb?`): `void` \| `Promise`\<`void`\>

Binds UDP socket to an interface/port and starts advertising.

#### Parameters

##### cb?

(`error`) => `void`

callback to socket.bind

#### Returns

`void` \| `Promise`\<`void`\>

promise when socket.bind is ready

***

### stop()

> **stop**(): `void`

Advertise shutdown and close UDP socket.

#### Returns

`void`

[**alexa-for-lg-webos-tv**](../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../modules.md) / [bridge](../README.md) / Bridge

# Class: Bridge

A class to build and start a bridge.

A new instance of Bridge is created/built by calling [Bridge.build](Bridge.md#build)().

## Example

Build and start a bridge:

```ts
const bridge = await Bridge.build();
await bridge.start();
```

## Constructors

### new Bridge()

> `private` **new Bridge**(`_configuration`, `_backend`, `_middle`, `_frontend`): [`Bridge`](Bridge.md)

The constructor is private. To create a Bridge, call [Bridge.build](Bridge.md#build)().

#### Parameters

• **\_configuration**: [`Configuration`](../lib/configuration/classes/Configuration.md)

• **\_backend**: [`Backend`](../lib/backend/classes/Backend.md)

• **\_middle**: [`Middle`](../lib/middle/classes/Middle.md)

• **\_frontend**: [`Frontend`](../lib/frontend/classes/Frontend.md)

#### Returns

[`Bridge`](Bridge.md)

## Properties

### \_backend

> `private` `readonly` **\_backend**: [`Backend`](../lib/backend/classes/Backend.md)

***

### \_configuration

> `private` `readonly` **\_configuration**: [`Configuration`](../lib/configuration/classes/Configuration.md)

***

### \_frontend

> `private` `readonly` **\_frontend**: [`Frontend`](../lib/frontend/classes/Frontend.md)

***

### \_middle

> `private` `readonly` **\_middle**: [`Middle`](../lib/middle/classes/Middle.md)

## Methods

### start()

> **start**(): `Promise`\<`void`\>

Starts the Bridge. When called, it

- starts the Frontend, and
- starts the Backend.

#### Returns

`Promise`\<`void`\>

***

### build()

> `static` **build**(): `Promise`\<[`Bridge`](Bridge.md)\>

Builds the Bridge. When called, it

- ensures the Configuration directory exists,
- retrieves the Configuration,
- builds a Backend using the retrieved Configuration,
- builds a Middle using the retrieved Configuration and the built Backend,
- builds a Frontend using the retrieved Configuration and the built Middle,
- builds a Bridge containing the retrieved Configuration, the built
  Backend, the built Middle and the built Frontend, and
- returns the built bridge.

#### Returns

`Promise`\<[`Bridge`](Bridge.md)\>

the Bridge built

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

> `private` **new Bridge**(`_frontend`, `_services`): [`Bridge`](Bridge.md)

The constructor is private. To create a Bridge, call [Bridge.build](Bridge.md#build)().

#### Parameters

• **\_frontend**: [`Frontend`](../lib/frontend/classes/Frontend.md)

• **\_services**: `Record`\<`string`, [`Application`](../lib/frontend/application/classes/Application.md)\>

#### Returns

[`Bridge`](Bridge.md)

## Properties

### \_frontend

> `private` `readonly` **\_frontend**: [`Frontend`](../lib/frontend/classes/Frontend.md)

***

### \_services

> `private` `readonly` **\_services**: `Record`\<`string`, [`Application`](../lib/frontend/application/classes/Application.md)\>

## Methods

### start()

> **start**(): `Promise`\<`void`\>

Starts the Bridge. When called, it

- starts the Frontend, and
- starts each Service.

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

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

> `private` **new Bridge**(`_link`, `_services`): [`Bridge`](Bridge.md)

The constructor is private. To create a Bridge, call [Bridge.build](Bridge.md#build)().

#### Parameters

• **\_link**: [`LinkManager`](../lib/link/classes/LinkManager.md)

• **\_services**: `Record`\<`string`, [`Application`](../lib/link/application/classes/Application.md)\>

#### Returns

[`Bridge`](Bridge.md)

## Properties

### \_link

> `private` `readonly` **\_link**: [`LinkManager`](../lib/link/classes/LinkManager.md)

***

### \_services

> `private` `readonly` **\_services**: `Record`\<`string`, [`Application`](../lib/link/application/classes/Application.md)\>

## Methods

### start()

> **start**(): `Promise`\<`void`\>

Starts the Bridge. When called, it

- starts the LinkManager, and
- starts each Service.

#### Returns

`Promise`\<`void`\>

***

### build()

> `static` **build**(): `Promise`\<[`Bridge`](Bridge.md)\>

Builds the Bridge. When called, it

- ensures the Configuration directory exists,
- retrieves the Configuration,
- builds the services using the retrieved Configuration,
- builds a link using the retrieved Configuration and the built services,
- builds a bridge containing the retrieved Configuration, the built
  services, the built link, and
- returns the built bridge.

#### Returns

`Promise`\<[`Bridge`](Bridge.md)\>

the Bridge built

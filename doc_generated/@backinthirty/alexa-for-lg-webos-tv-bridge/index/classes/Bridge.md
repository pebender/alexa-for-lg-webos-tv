[**Documentation**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@backinthirty/alexa-for-lg-webos-tv-bridge](../../README.md) / [index](../README.md) / Bridge

# Class: Bridge

A class to build and start a bridge.

A new instance of Bridge is created/built by calling [Bridge.build](#build)().

## Example

Build and start a bridge:

```ts
const bridge = await Bridge.build();
await bridge.start();
```

## Methods

### start()

> **start**(): `Promise`\<`void`\>

Starts the Bridge. When called, it

- starts the [LinkManager](../../lib/link/classes/LinkManager.md), and
- starts each Service ([ShsToLgWeboOsTv](../../lib/services/shs-to-lg-webos-tv/README.md)).

#### Returns

`Promise`\<`void`\>

***

### build()

> `static` **build**(): `Promise`\<`Bridge`\>

Builds the Bridge. When called, it

- ensures the Configuration directory exists,
- retrieves the Configuration,
- builds the services using the retrieved Configuration,
- builds a link using the retrieved Configuration and the built services,
- builds a bridge containing the retrieved Configuration, the built
  services, the built link, and
- returns the built bridge.

#### Returns

`Promise`\<`Bridge`\>

the Bridge built

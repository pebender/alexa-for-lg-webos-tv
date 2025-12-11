[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@backinthirty/alexa-for-lg-webos-tv-bridge](../../../README.md) / [lib/database](../README.md) / OneOf

# Type Alias: OneOf\<T, K\>

> **OneOf**\<`T`, `K`\> = `K` *extends* keyof `T` ? [`AllowOnly`](AllowOnly.md)\<`T`, `K`\> : `never`

Defined in: [packages/bridge/src/lib/database.ts:20](https://github.com/pebender/alexa-for-lg-webos-tv/blob/08f09ed88779fc1ad44c84758ae6d1b5fed7b8bb/packages/bridge/src/lib/database.ts#L20)

OneOf and [AllowOnly](AllowOnly.md) were lifted from [https://github.com/salto-io/salto/\*/packages/lowerdash/src/types.ts](https://github.com/salto-io/salto/blob/4465d201ae4881a8b3ecb42e3903eeb839ebd7c8/packages/lowerdash/src/types.ts) and
are explained by [https://amir.rachum.com/typescript-oneof/](https://amir.rachum.com/typescript-oneof/).

## Type Parameters

### T

`T`

### K

`K` = keyof `T`

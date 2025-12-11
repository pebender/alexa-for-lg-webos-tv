[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@backinthirty/alexa-for-lg-webos-tv-bridge](../../../README.md) / [lib/database](../README.md) / AllowOnly

# Type Alias: AllowOnly\<T, K\>

> **AllowOnly**\<`T`, `K`\> = `Pick`\<`T`, `K`\> & `{ [P in keyof Omit<T, K>]?: never }`

Defined in: [packages/bridge/src/lib/database.ts:10](https://github.com/pebender/alexa-for-lg-webos-tv/blob/adc71bfbaff03376c48238a820440121c9de3e7e/packages/bridge/src/lib/database.ts#L10)

AllowOnly and [OneOf](OneOf.md) were lifted from [https://github.com/salto-io/salto/\*/packages/lowerdash/src/types.ts](https://github.com/salto-io/salto/blob/4465d201ae4881a8b3ecb42e3903eeb839ebd7c8/packages/lowerdash/src/types.ts). and
are explained by [https://amir.rachum.com/typescript-oneof/](https://amir.rachum.com/typescript-oneof/).

## Type Parameters

### T

`T`

### K

`K` *extends* keyof `T`

[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/lib/database](../README.md) / AllowOnly

# Type Alias: AllowOnly\<T, K\>

> **AllowOnly**\<`T`, `K`\>: `Pick`\<`T`, `K`\> & `{ [P in keyof Omit<T, K>]?: never }`

AllowOnly and [OneOf](OneOf.md) were lifted from [https://github.com/salto-io/salto/*/packages/lowerdash/src/types.ts](https://github.com/salto-io/salto/blob/4465d201ae4881a8b3ecb42e3903eeb839ebd7c8/packages/lowerdash/src/types.ts). and
are explained by [https://amir.rachum.com/typescript-oneof/](https://amir.rachum.com/typescript-oneof/).

## Type Parameters

• **T**

• **K** *extends* keyof `T`

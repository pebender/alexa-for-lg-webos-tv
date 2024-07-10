[**alexa-for-lg-webos-tv**](../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../modules.md) / [bridge/lib/database](../README.md) / OneOf

# Type Alias: OneOf\<T, K\>

> **OneOf**\<`T`, `K`\>: `K` *extends* keyof `T` ? [`AllowOnly`](AllowOnly.md)\<`T`, `K`\> : `never`

OneOf and [AllowOnly](AllowOnly.md) were lifted from [https://github.com/salto-io/salto/*/packages/lowerdash/src/types.ts](https://github.com/salto-io/salto/blob/4465d201ae4881a8b3ecb42e3903eeb839ebd7c8/packages/lowerdash/src/types.ts) and
are explained by [https://amir.rachum.com/typescript-oneof/](https://amir.rachum.com/typescript-oneof/).

## Type Parameters

• **T**

• **K** = keyof `T`

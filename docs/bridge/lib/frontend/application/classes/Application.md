[**alexa-for-lg-webos-tv**](../../../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../../../modules.md) / [bridge/lib/frontend/application](../README.md) / Application

# Class: `abstract` Application

## Constructors

### new Application()

> **new Application**(): [`Application`](Application.md)

#### Returns

[`Application`](Application.md)

## Methods

### getRequestSkillToken()

> `abstract` **getRequestSkillToken**(`request`): `string`

#### Parameters

• **request**: `object`

#### Returns

`string`

***

### handleRequest()

> `abstract` **handleRequest**(`request`, `credentials`): `Promise`\<`object`\>

#### Parameters

• **request**: `object`

• **credentials**: [`Credentials`](../../credentials/interfaces/Credentials.md)

#### Returns

`Promise`\<`object`\>

***

### start()

> `abstract` **start**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

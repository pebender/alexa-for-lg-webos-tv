[**alexa-for-lg-webos-tv**](../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/profile](../README.md) / getUserProfile

# Function: getUserProfile()

> **getUserProfile**(`accessToken`): `Promise`\<[`UserProfile`](../type-aliases/UserProfile.md)\>

This function retrieves the user profile specified by accessToken from the
[Login with Amazon](https://developer.amazon.com/apps-and-games/login-with-amazon).
If successful, it return the [UserProfile](../type-aliases/UserProfile.md). Otherwise, it throws a
[CommonError.CommonError](../../error/classes/CommonError.md) with
general="authorization" for
any authorization related failures and
general="http" for any
others.

## Parameters

• **accessToken**: `string`

access token from a skill message.

## Returns

`Promise`\<[`UserProfile`](../type-aliases/UserProfile.md)\>

- the profile returned by the
[Login with Amazon](https://developer.amazon.com/apps-and-games/login-with-amazon)
profile server in response to accessToken.

## Throws

- a [CommonError.CommonError](../../error/classes/CommonError.md) with
general="authorization" for
any authorization related failures and
general="http" for any
others.

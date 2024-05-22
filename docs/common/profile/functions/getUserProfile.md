[**alexa-for-lg-webos-tv**](../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/profile](../README.md) / getUserProfile

# Function: getUserProfile()

> **getUserProfile**(`accessToken`): `Promise`\<[`UserProfile`](../interfaces/UserProfile.md)\>

This function retrieves the user profile specified by accessToken from the
[Login with Amazon](https://developer.amazon.com/apps-and-games/login-with-amazon).
If successful, it return the [UserProfile](../interfaces/UserProfile.md). Otherwise, it throws a
[AuthorizationCommonError](../../error/classes/AuthorizationCommonError.md) for
any authorization failures, or a
ProfileCommonError for any other errors.

## Parameters

• **accessToken**: `string`

access token from a skill message.

## Returns

`Promise`\<[`UserProfile`](../interfaces/UserProfile.md)\>

- the profile returned by the
[Login with Amazon](https://developer.amazon.com/apps-and-games/login-with-amazon)
profile server in response to accessToken.

## Throws

- a
[AuthorizationCommonError](../../error/classes/AuthorizationCommonError.md) for
any authorization failures, or a
ProfileCommonError for any other errors.

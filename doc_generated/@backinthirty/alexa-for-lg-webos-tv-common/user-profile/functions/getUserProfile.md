[**Documentation**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@backinthirty/alexa-for-lg-webos-tv-common](../../README.md) / [user-profile](../README.md) / getUserProfile

# Function: getUserProfile()

> **getUserProfile**(`accessToken`): `Promise`\<[`UserProfile`](../interfaces/UserProfile.md)\>

Defined in: [packages/common/src/user-profile.ts:51](https://github.com/pebender/alexa-for-lg-webos-tv/blob/08f09ed88779fc1ad44c84758ae6d1b5fed7b8bb/packages/common/src/user-profile.ts#L51)

This function retrieves the user profile specified by accessToken from the
[Login with Amazon](https://developer.amazon.com/apps-and-games/login-with-amazon).
If successful, it return the [UserProfile](../interfaces/UserProfile.md).
Otherwise, it throws a [UserProfileCommonError](../classes/UserProfileCommonError.md).

## Parameters

### accessToken

`string`

access token from a skill message.

## Returns

`Promise`\<[`UserProfile`](../interfaces/UserProfile.md)\>

- the profile returned by the
[Login with Amazon](https://developer.amazon.com/apps-and-games/login-with-amazon)
profile server in response to accessToken.

## Throws

- a [UserProfileCommonError](../classes/UserProfileCommonError.md).

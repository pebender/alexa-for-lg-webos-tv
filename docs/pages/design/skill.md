# The Skill

The skill works in conjunction with the [bridge](bridge.md#the-bridge) to enable Alexa support on LG webOS TVs that lack built-in Alexa support. The skill communicates with the bridge using [the Skill to Bridge Interface](./skill-to-bridge-interface.md#the-skill-to-bridge-interface).

The skill expects to be running as a lambda function on the Amazon cloud.

The skill is a [Multi-Capability Skill](https://developer.amazon.com/en-US/docs/alexa/smarthome/about-mcs.html) (MCS) that combines a [Custom Skill](https://developer.amazon.com/en-US/docs/alexa/custom-skills/understanding-custom-skills.html) (CS) and a [Smart Home Skill](https://developer.amazon.com/en-US/docs/alexa/smarthome/understand-the-smart-home-skill-api.html) (SHS). It uses the CS to establish a secure connection to the correct bridge, and it uses the SHS to control the televisions through the securely connected bridge.

## Account Linking

For the skill to work correctly, the CS and SHS must be able to share the user's bridge hostname. To do this, the skill relies on [Account Linking](https://developer.amazon.com/en-US/docs/alexa/account-linking/add-account-linking.html) using [Login With Amazon (LWA)](https://developer.amazon.com/apps-and-games/login-with-amazon). Once account linking is complete, CS request events and SHS request directives contain an access token that depends on the user but not the message. So, the skill can use the access token to link the user's CS and SHS enabling it to share the user's bridge hostname between the user's CS and SHS.

## Retrieving the User's Access Token

### Retrieving the User's Access Token from a Custom Skill Request Event

When a CS in linked to the user's Amazon account, CS request events contain an access token. The location of the access token in the CS request event is `handlerInput.requestEnvelope.context.System.user.accessToken`

### Retrieving the User's Access Token from a Smart Home Skill Request Directive

When an SHS in linked to the user's Amazon account, SHS request directives contain an access token. The location of the access token in the directive depends the type of directive. For the ["Alexa.Authorization" "AcceptGrant" directive](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-authorization.html#acceptgrant-directive-example), the location is `directive.payload.grantee.token`. For the ["Alexa.Discovery" "Discover" directive](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-discovery.html#discover-directive-example) the location is `directive.payload.scope.token`. For directives sent to a specific endpoint such as the ["Alexa.PowerController" "TurnOn" directive](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-powercontroller.html#directives), the location is `directive.endpoint.scope.token`.

The alexa-for-lg-webos-tv's SHS implements the retrieval of the access token in the [getAccessToken](../../src/common/smart-home-skill/request.ts) function.

## Retrieving the User's Identifier

While the access token links a user's CS and SHS at a given time, the access token can change with time. To track a user's CS or SHS across time, the skill uses the User's Identifier (user_id).

Retrieving user_id is a two step process. First the skill retrieves the user's access token. Next the skill uses the access token to retrieve the user's profile using the Amazon User Profile API. Contained in the profile is user_id.

After the skill [retrieves the user's access token](#retrieving-the-users-access-token), it can request the user's profile from

```text
<https://api.amazon.com/user/profile>
```

by sending a GET request to the URL with the HTTP authorization header

```http
Authorization: Bearer ACCESS_TOKEN
```

where ACCESS_TOKEN is the value of the access token. The full request would look like

```http
Host: api.amazon.com
Accept: application/json
Authorization: Bearer _apiAccessToken_
GET <https://api.amazon.com/user/profile>
```

The response contains user_id as well as any other information the user agreed to share during account linking.

## The Database

The skill uses DynamoDB as its database.

The database has a table named ForLGwebOSTV. This table uses the user's linked Amazon account identifier (userId) as its key. And it contains the userId, bridge hostname (bridgeHostname), the bridge bearer token (bridgeToken) and CS/SHS access token (skillToken) for each user. In addition, the database table has an associated Global Secondary Index (GSI) named skillToken_index. This GSI uses skillToken as its index. And it contains skillToken, userId, bridgeHostname and bridgeToken for each user.

Using userId as the table's key makes it easy to associate bridgeHostname and bridgeToken with the user even when skillToken changes.

However, it is inefficient for the the skill to look up bridgeHostname and bridgeToken using userId for every skill message requiring bridge interaction. If it used the userId to look up bridgeHostname and bridgeToken, it would first need to use skillToken to retrieve the user's profile from the LWA profile server. Retrieving the profile every time it had a message to send would add needless delay in sending the message as well as add needless load on the LWA profile server. Instead, the skill looks up bridgeHostname and bridgeToken in the GSI using the skillToken. If it does not find skillToken in the GSI, it uses the skillToken to retrieve the user's profile and uses the userId to add skillToken to the table. After adding skillToken to the table, the skill is able to look up bridgeHostname and bridgeToken in the GSI using the skillToken.

The alexa-for-lg-webos-tv skill's link user database functions are found [here](../../src/skill/lib/link/user-db.ts).

### Database Performance

[Amazon provides recommendations on how to improve the performance of lambda functions by Amazon](https://aws.amazon.com/blogs/compute/operating-lambda-performance-optimization-part-2/). First, Amazon suggests maintaining the connection to databases outside of the handler. This ensures the lambda function establishes its connection to the database outside of the handler function. Doing this causes the lambda function to connect to the database once when it is loaded rather than every time the handler function is called. Second, Amazon suggests loading needed parts of the modules. Doing this reduces the lambda function load time. Third, Amazon recommends that the [DynamoDB connection enable HTTP keep-alive](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-reusing-connections.html) to improve connections. The alexa-for-lg-webos-tv's skill implements all of these suggestions.

## Sending on the Test and Service Interfaces

Sending a request on the test or service interfaces requires a bridge token from the bridge for authorization

The skill assumes that any request it's being asked to send on either the test or the service interface on behalf of a user would be authorized by the bridge. Therefore, if the skill has no bridge token for the user or has an invalid bridge token for the user, then the skill will attempt to get a valid bridge token from the bridge before giving up.

```mermaid
stateDiagram-v2
  direction TB

  lookUpUserRecord: Look Up User Record<br>using CS/SHS Token
  checkUserRecordForUserId: Check User Record<br>for User Id
  checkUserRecordForBridgeHostname: Check User Record<br>for Bridge Hostname
  checkUserRecordForBridgeToken: Check User Record<br>for Bridge Token
  sendMessageToBridge: Send CS/SHS Message<br>to Bridge
  succeedMessage: Succeed<br>with CS/SHS Response
  [*] --> lookUpUserRecord: CS/SHS Message Received
  lookUpUserRecord --> checkUserRecordForUserId: User Record Found
  checkUserRecordForUserId --> checkUserRecordForBridgeHostname: User Id Found
  checkUserRecordForBridgeHostname --> checkUserRecordForBridgeToken: Bridge Hostname Found
  checkUserRecordForBridgeToken --> sendMessageToBridge: Bridge Token Found
  sendMessageToBridge --> succeedMessage: Received CS/SHS Response<br>from bridge
  succeedMessage --> [*]: CS/SHS Message Handled

  updateSkillTokenInUserRecord: Update CS/SHS Token<br>in User Record
  lookUpUserRecord --> updateSkillTokenInUserRecord: User Record Not Found<br>(out-of-date CS/SHS)
  updateSkillTokenInUserRecord --> lookUpUserRecord: User Record Updated

  updateBridgeTokenInUserRecord: Update Bridge Token<br>in User Record
  checkUserRecordForUserEmail --> updateSkillTokenInUserRecord: User Email Not Found<br>(this should not happen)

  failMessageNotAuthorized: Fail<br>with Not Authorized
  updateSkillTokenInUserRecord --> failMessageNotAuthorized: User Record Not Updated<br>because Authorization Failed

  failMessageNotAuthorized --> [*]: CS/SHS Message Handled

  checkUserRecordForBridgeHostname --> failMessageUnreachable: Message not Authorized<br> with Bridge Not Configured

  failMessageUnreachable: Fail<br>with Unreachable
  failMessageUnreachable --> [*]: CS/SHS Message Handled

  sendMessageToBridge --> updateBridgeTokenInUserRecord: Received Not Authorized from Bridge


  updateBridgeTokenInUserRecord --> lookUpUserRecord: Bridge Token Updated
```

### Update Skill Token in the User Record

The skill token is used as authorization to fetch the user's identifier and email address from the profile server. Assuming the fetch is successful, the skill token for the User Record associated with the user's identifier is updated/created with the value of the CS/SHS token. If the CS/SHS token fails authorization or no email address is returned, then update fails with the reason "not authorized".

```mermaid
stateDiagram-v2
    fetchUserProfile: Fetch<br>User Profile
    checkUserProfileForUserId: Check<br>User Profile<br>for User's Identifier
    checkUserProfileForUserEmail: Check<br>User Profile<br>for User's Email Address
    updateUserRecordSkillToken: Add/Update<br>User Record<br>with CS/SHS Token
    succeed: Succeed
    failAuthorization: Fail with Not Authorized

    [*] --> fetchUserProfile: Update Requested
    fetchUserProfile --> checkUserProfileForUserId: Profile Received
    checkUserProfileForUserId --> checkUserProfileForUserEmail: Identifier<br>Found
    checkUserProfileForUserEmail --> updateUserRecordSkillToken: Email Address<br>Found
    updateUserRecordSkillToken --> succeed: Update<br>Succeeded
    succeed --> [*]: Update <br>Succeeded

    fetchUserProfile --> failAuthorization: Authorization Failed
    checkUserProfileForUserId --> failAuthorization: Identifier<br>Not Found
    checkUserProfileForUserEmail --> failAuthorization: Email Address<br>Not Found

    failAuthorization --> [*]: Update Failed<br>with Not Authorized
```

### Update Bridge Token in User Record

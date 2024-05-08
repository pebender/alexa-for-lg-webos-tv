# The Skill

The skill works in conjunction with the [bridge](bridge.md#the-bridge) to enable Alexa support on LG webOS TVs that lack built-in Alexa support. The skill communicates with the bridge using [the Skill to Bridge Interface](./skill-to-bridge-interface.md#the-skill-to-bridge-interface).

The skill expects to be running as a lambda function on the Amazon cloud.

The skill is a [Multi-Capability Skill](https://developer.amazon.com/en-US/docs/alexa/smarthome/about-mcs.html) (MCS) that combines a [Custom Skill](https://developer.amazon.com/en-US/docs/alexa/custom-skills/understanding-custom-skills.html) (CS) and a [Smart Home Skill](https://developer.amazon.com/en-US/docs/alexa/smarthome/understand-the-smart-home-skill-api.html) (SHS). It uses the CS to establish a secure connection to the correct bridge, and it uses the SHS to control the televisions through the securely connected bridge.

## Account Linking

For the skill to work correctly, the CS and SHS must be able to share the user's bridge hostname. To do this, the skill relies on [Account Linking](https://developer.amazon.com/en-US/docs/alexa/account-linking/add-account-linking.html) using [Login With Amazon (LWA)](https://developer.amazon.com/apps-and-games/login-with-amazon). Once account linking is complete, CS request events and SHS request directives contain an access token that depends on the user but not the message. So, the skill can use the access token to link the user's CS and SHS enabling it to share the user's bridge hostname between the user's CS and SHS.

In addition, the skill needs the access token to generate the [login token](./skill-to-bridge-interface.md#the-login-token) used to request a [bridge token](./skill-to-bridge-interface.md#the-bridge-token) on behalf of a user.

## Retrieving the User's Access Token

### Retrieving the User's Access Token from a Custom Skill Request Event

When a CS in linked to the user's Amazon account, CS request events contain an access token. The location of the access token in the CS request event is `handlerInput.requestEnvelope.context.System.user.accessToken`.

### Retrieving the User's Access Token from a Smart Home Skill Request Directive

When an SHS in linked to the user's Amazon account, SHS request directives contain an access token. The location of the access token in the directive depends the type of directive. For the ["Alexa.Authorization" "AcceptGrant" directive](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-authorization.html#acceptgrant-directive-example), the location is `directive.payload.grantee.token`. For the ["Alexa.Discovery" "Discover" directive](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-discovery.html#discover-directive-example) the location is `directive.payload.scope.token`. For directives sent to a specific endpoint such as the ["Alexa.PowerController" "TurnOn" directive](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-powercontroller.html#directives), the location is `directive.endpoint.scope.token`.

The SHS implements the retrieval of the access token in the [getAccessToken](../../src/common/smart-home-skill/request.ts) function.

## Retrieving the User's Identifier

While the access token links a user's CS and SHS at a given time, the access token can change with time. To track a user's CS or SHS across time, the skill uses the user's linked Amazon account identifier.

Retrieving user_id is a two step process. First the skill retrieves the user's access token. Next the skill uses the access token to retrieve the user's profile using the Amazon User Profile API. Included in the profile is user_id, which is the user's linked Amazon account identifier.

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
Authorization: Bearer ACCESS_TOKEN
GET <https://api.amazon.com/user/profile>
```

The response contains user_id as well as any other information the user agreed to share during account linking.

## The Database

The skill needs to maintain a mapping between the user's linked Amazon account identifier and the user's bridge credentials (bridge hostname and bridge token) so that it can communicate with the correct bridge on behalf of the user. In addition, the skill maintains a cache of the mapping between the CS/SHS access token and the user's linked Amazon account identifier so that the skill can map CS/SHS messages to the correct user without always checking with the profile server. To do this, the skill maintains a link user database.

The skill uses DynamoDB for this database.

This database has a table named ForLGwebOSTV. This table uses the user's linked Amazon account identifier (userId) as its key. And it contains the userId, the CS/SHS access token (skillToken), the bridge hostname (bridgeHostname) and the bridge token (bridgeToken) for each user. In addition, the database table has an associated Global Secondary Index (GSI) named skillToken_index. This GSI uses skillToken as its index. And it contains skillToken, userId, bridgeHostname and bridgeToken for each user.

Using userId as the table's key makes it easy to associate bridgeHostname and bridgeToken with the user even when skillToken changes. Having a GSI with skillToken as its index makes it efficient to map a CS/SHS message to the correct bridge.

The link user database functions are found [here](../../src/skill/lib/link/user-db.ts).

### Database Performance

[Amazon provides recommendations on how to improve the performance of lambda functions by Amazon](https://aws.amazon.com/blogs/compute/operating-lambda-performance-optimization-part-2/). First, Amazon suggests maintaining the connection to databases outside of the handler. This ensures the lambda function establishes its connection to the database outside of the handler function. Doing this causes the lambda function to connect to the database once when it is loaded rather than every time the handler function is called. Second, Amazon suggests loading only needed parts of the modules. Doing this reduces the lambda function load time. Third, Amazon recommends that the [DynamoDB connection enable HTTP keep-alive](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-reusing-connections.html) to improve connections, which is the default behavior in aws-sdk v3. The skill implements all of these suggestions.

## Sending on the Test and Service Interfaces

Sending a request on the test or service interfaces requires a bridge token from the bridge for authorization

The skill assumes that any request it's being asked to send on either the test or the service interface on behalf of a user would be authorized by the bridge. Therefore, if the skill has no bridge token for the user or has an invalid bridge token for the user, then the skill will attempt to get a valid bridge token from the bridge before giving up.

```mermaid
stateDiagram-v2
  direction TB

  fetchBridgeCredentials1: Fetch Bridge Credentials
  sendMessageToBridge1: Send Request Message to Bridge

  fetchBridgeCredentials2: Fetch Bridge Credentials<br>with Bridge Token Update
  sendMessageToBridge2: Send Request Message to Bridge

  [*] --> fetchBridgeCredentials1: Request Message and Skill Token
  fetchBridgeCredentials1 --> sendMessageToBridge1: Bridge Credentials Found
  sendMessageToBridge1 --> [*]: Response Message Received
  fetchBridgeCredentials1 --> [*]: Authorizatoin Failed

  sendMessageToBridge1 --> fetchBridgeCredentials2: Authorization Failure Received
  fetchBridgeCredentials2 --> sendMessageToBridge2: Bridge Credentials Found
  sendMessageToBridge2 --> [*]:  Response Message Received
  fetchBridgeCredentials2 --> [*]: Authorizatoin Failed
```

### Fetch Bridge Credentials

The bridge credentials are the bridge hostname and bridge token. The bridge credentials are stored in the user record in the link user database. The user record contains the user's linked Amazon account identifier (userId), the skill access token (skillToken), the bridge hostname (bridgeHostname) and the bridge token (bridgeToken).

Fields in the user record can become stale. As an example, the user record may not contain user's current skill token, requiring the skill to retrieve the user's linked Amazon account profile. As another example, the user record may not contain a bridge token, requiring the skill to request a bridge token from the bridge. As part of fetching the bridge credentials, the skill makes sure the user record is not stale.

Fetching the bridge credentials has three stages:

1. updates skillToken in the user record if needed,
2. updates bridgeHostname and bridgeToken in the user record if requested,
3. updates the bridgeToken in the user record if needed.

Fetching bridge credentials updates skillToken when the user database contains no user record containing skillToken. Fetching bridge credentials updates bridgeHostname when newBridgeHostname is set to a hostname in the request to fetch bridge credentials. Fetching bridge credentials updates bridgeToken when bridgeToken is not set, skillToken was updated, bridgeHostname was updated, or newBridgeToken is set to true in the request to fetch bridge credentials.

```mermaid
stateDiagram-v2
  direction TB

fetchUserRecord1: Fetch User Record

fetchUserProfile2: Fetch User Profile
updateUserRecord2: Update/Create User Record<br>- update Skill Token<br>- delete Bridge Token
fetchUserRecord2: Fetch User Record

checkBridgeHostnameUpdateValue: Check Bridge Hostname Update Value?
updateUserRecord3: Update User Record<br>- update Bridge Hostname<br>- delete Bridge Token
fetchUserRecord3: Fetch User Record

checkBridgeTokenUpdateFlag: Check Bridge Token Update Flag?
updateUserRecord4: Update User Record<br>- delete Bridge Token
fetchUserRecord4: Fetch User Record

checkBridgeHostname5: Check For Bridge Hostname

checkBridgeToken6: Check For Bridge Token

updateUserRecord7: Update User Record<br>- delete Bridge Token

fetchBridgeToken8: Fetch Bridge Token
updateUserRecord8: Update User Record<br>- update Bridge Token
fetchUserRecord8: Fetch User Record

[*] --> fetchUserRecord1: Bridge Credentials Requested<br>- optional newBridgeHostname<br>- optional newBridgeToken

fetchUserRecord1 --> checkBridgeHostnameUpdateValue: User Record Found
fetchUserRecord1 --> fetchUserProfile2: User Record Not Found

fetchUserProfile2 --> updateUserRecord2: User Profile Retrieved
updateUserRecord2 --> fetchUserRecord2: User Record Updated

fetchUserRecord2 --> checkBridgeHostnameUpdateValue: User Record Found

checkBridgeHostnameUpdateValue --> checkBridgeTokenUpdateFlag: Bridge Hostname Updated Not Requested
checkBridgeHostnameUpdateValue --> updateUserRecord3: Bridge Hostname Update Requested

updateUserRecord3 --> fetchUserRecord3: User Record Updated

fetchUserRecord3 -->  checkBridgeTokenUpdateFlag: User Record Found

checkBridgeTokenUpdateFlag --> checkBridgeHostname5: Bridge Token Update Not Requested
checkBridgeTokenUpdateFlag --> updateUserRecord4: Bridge Token Update Requested

updateUserRecord4 --> fetchUserRecord4: User Record Updated

fetchUserRecord4 --> checkBridgeHostname5: User Record Found

checkBridgeHostname5 --> checkBridgeToken6: Bridge Hostname Found
checkBridgeHostname5 --> updateUserRecord7: Bridge Hostname Not Found

checkBridgeToken6 --> [*]: Bridge Credentials Returned
checkBridgeToken6 --> fetchBridgeToken8: Bridge Token Not Found

updateUserRecord7 --> [*]: Failed

fetchBridgeToken8 --> updateUserRecord8: Bridge Token Updated

updateUserRecord8 --> fetchUserRecord8: User Record Updated
fetchUserRecord8 --> [*]: Bridge Credentials Returned


fetchBridgeToken8 --> [*]: Authorization Failed
fetchUserProfile2 --> [*]: Authorization Failed
```

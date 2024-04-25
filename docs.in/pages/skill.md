# The Skill

The skill works in conjunction with the [bridge](bridge.md#the-bridge) to enable Alexa support on LG webOS TVs that lack built-in Alexa support. The skill communicates with the bridge using [the Skill to Bridge Interface](./skill-to-bridge-interface.md#the-skill-to-bridge-interface).

The skill expects to be running as a lambda function on the Amazon cloud.

The skill is a [Multi-Capability Skill](https://developer.amazon.com/en-US/docs/alexa/smarthome/about-mcs.html) (MCS) that combines a [Custom Skill](https://developer.amazon.com/en-US/docs/alexa/custom-skills/understanding-custom-skills.html) (CS) and a [Smart Home Skill](https://developer.amazon.com/en-US/docs/alexa/smarthome/understand-the-smart-home-skill-api.html) (SHS). It uses the CS to establish a secure connection to the correct bridge, and it uses the SHS to control the televisions through the securely connected bridge.

## Account Linking

For the skill's CS, the skill's SHS and the bridge's SHS service to work correctly, they must have a common method to identify a user. The common method used is the user's email obtained though [Account Linking](https://developer.amazon.com/en-US/docs/alexa/account-linking/add-account-linking.html) using [Login With Amazon (LWA)](https://developer.amazon.com/apps-and-games/login-with-amazon). Once the skill is linked to the user's Amazon account and the user agrees to share their email address, the skill's CS, the skill's SHS and the bridge's SHS service can retrieve the user's email address.

Amazon provides instructions on how to [Set Up Account Linking](https://developer.amazon.com/en-US/docs/alexa/smarthome/set-up-account-linking-tutorial.html). The one thing to remember is to be sure to set it up so that it requests access to the user's email address. Otherwise, neither the skill nor the bridge will have access to the user's email address through the linked account.

## Retrieving the email Address using the Custom Skill

Retrieving the user's email address is a two step process. First the CS retrieves the user's API Access Token from a CS request. Next the CS uses the API Access Token to retrieve the user's email address using the Alexa Customer Profile API.

### Retrieving the API Access Token from a Custom Skill Request Event

When a CS in linked to the user's Amazon account, request events contain an API Endpoint (apiEndpoint) and API Access Token (apiAccessToken). The CS can find the apiEndpoint in request event at `handlerInput.requestEnvelope.context.System.apiEndpoint`. The CS can find the apiAccessToken in the request event at `handlerInput.requestEnvelope.context.System.apiAccessToken`
The CS can use this apiEndpoint and apiAccessToken to retrieve the user's email address.

### Retrieving the email Address Using the Alexa Customer Profile API

Once the CS has the apiEndpoint and the user's apiAccessToken, it can request the user's email address from

```text
<https://API_ENDPOINT/v2/accounts/~current/settings/Profile.email>
```

by sending a GET request to the URL with the HTTP authorization header

```http
Authorization: Bearer API_ACCESS_TOKEN
```

where API_ENDPOINT is the value of apiEndpoint and API_ACCESS_TOKEN is the value of the apiAccessToken. The full request would look like

```http
Host: API_ENDPOINT
Accept: application/json
Authorization: Bearer API_ACCESS_TOKEN
GET <https://API_ENDPOINT/v2/accounts/~current/settings/Profile.email>
```

The alexa-for-lg-webos-tv's CS implements the retrieval of the email address in the [getUserEmail](../../src/common/profile/custom-skill.ts) function.

You can find more information at ["Request Customer Contact Information for Use in Your Skill"](https://developer.amazon.com/en-US/docs/alexa/custom-skills/request-customer-contact-information-for-use-in-your-skill.html).

## Retrieving the email Address using the Smart Home Skill

### Retrieving the Bearer Token from a Smart Home Skill Request Directive

When an SHS in linked to the user's Amazon account, request directives will contain a bearerToken (bearerToken). The SHS can use this bearerToken to retrieve the user's profile. Assuming the user granted access to their email address during account linking, the user's profile will contain user's email address.

The location of the bearerToken in the SHS request directive depends the type of directive. For the ["Alexa.Authorization" "AcceptGrant" directive](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-authorization.html#acceptgrant-directive-example), it is found at `directive.payload.grantee.token`. For the ["Alexa.Discovery" "Discover" directive](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-discovery.html#discover-directive-example) it is found at `directive.payload.scope.token`. For directives sent to a specific endpoint such as the ["Alexa.PowerController" "TurnOn" directive](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-powercontroller.html#directives), it is found at `directive.endpoint.scope.token`. The alexa-for-lg-webos-tv's SHS implements the retrieval of the bearerToken in the [getBearerToken](../../src/common/smart-home-skill/request.ts) function.

### Retrieving the email Address

Once the SHS has the user's bearerToken, it can request the user's profile from

```text
<https://api.amazon.com/user/profile>
```

by sending a GET request to the URL with the HTTP authorization header

```http
Authorization: Bearer BEARER_TOKEN
```

where BEARER_TOKEN is the value of the bearerToken. The full request would look like

```http
Host: api.amazon.com
Accept: application/json
Authorization: Bearer _apiAccessToken_
GET <https://api.amazon.com/user/profile>
```

The response contains the items the user agreed to share, including the email address.

## Linking the Custom Skill and the Smart Home Skill

For the MCS to work correctly, the CS must share the bridge hostname with the SHS. The skill does this using the user's email address as a unique key into a database. Using the user's email address as a unique key, the CS writes the user's bridge hostname to the DynamoDB database and the SHS reads the user's bridge hostname from the DynamoDB database.

## The Database

The skill uses DynamoDB as its database.

The database has a table named ForLGwebOSTV. This table uses the user's email address as its key. And it contains the user's email address (email), bridge hostname (hostname), the bridge bearer token (bridgeToken) and SHS bearer token (skillToken) for each user. In addition, the database table has an associated Global Secondary Index (GSI) named skillToken_index. This GSI uses skillToken as its index. And it contains skillToken, email, hostname and bridgeToken for each user.

Using email as the table's key makes it easy for both the CS and the SHS to look up hostname and bridgeToken after they have used their respective tokens to retrieve the user's email address. When the user configures their bridge through interaction with the skill, the CS stores the bridge hostname (hostname) and bridge bearer token (bridgeToken) in the table keyed to user's email address (email). When the SHS needs to send a message to the bridge, it can look up hostname and bridgeToken in the table using email.

However, the SHS looking up hostname and bridgeToken using email is inefficient. If it used the email to look up hostname and bridgeToken, it would first need to use its bearer token to retrieve the user's profile from LWA profile server. Retrieving the profile every time it had a message to send would add needless delay in sending the message as well as add needless load on the LWA profile server. Instead, the SHS looks up hostname and bridgeToken in the GSI using the skillToken. If it does not find skillToken in the GSI, it uses the skillToken to retrieve the user's profile and uses the uses the user's email address to add skillToken to the table. After adding skillToken to the table, the SHS as able to look up hostname and bridgeToken in the GSI using the skillToken.

The alexa-for-lg-webos-tv skill's database functions are found [here](../../src/skill/lib/database.ts).

### Database Performance

There are a three things to notice besides the functions for setting the bridge hostname (setHostname), getting the bridge hostname (getHostname), setting the bridge's bearer token (setBridgeToken), getting the bridge's bearer token (getBridgeToken) and setting the SHS's bearer token (setSkillToken).

[Amazon provides recommendations on how to improve the performance of lambda functions by Amazon](https://aws.amazon.com/blogs/compute/operating-lambda-performance-optimization-part-2/). First, Amazon suggests maintaining the connection to databases outside of the handler. This ensures the lambda function establishes its connection to the database outside of the handler function. Doing this causes the lambda function to connect to the database once when it is loaded rather than every time the handler function is called. Second, Amazon suggests loading needed parts of the modules. Doing this reduces the lambda function load time. Third, Amazon recommends that the [DynamoDB connection enable HTTP keep-alive](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-reusing-connections.html) to improve connections. The alexa-for-lg-webos-tv's skill implements all of these suggestions.

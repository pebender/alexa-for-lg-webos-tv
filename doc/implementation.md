# Software Implementation

Under the hood, the software does several things that I believe are worth documenting because I was not able to find examples on the internet.

## Linking the Custom Skill and the Smart Home Skill

The alexa-for-lg-webos-tv skill is a Multi-Capability Skill (MCS) that combines a Custom Skill (CS) and a Smart Home Skill (SHS). It uses the CS to configure the bridge hostname, and it uses the SHS to control the televisions. For this to work, the CS must share the bridge hostname with the SHS. The skill does this using a combination of [Account Linking](https://developer.amazon.com/en-US/docs/alexa/account-linking/add-account-linking.html) and a [DynamoDB database](https://aws.amazon.com/dynamodb/). The skill uses [Login With Amazon (LWA)](https://developer.amazon.com/apps-and-games/login-with-amazon) to perform account linking. Once the skill is linked to the user's Amazon account and the user agrees to share their email address, both the CS and SHS to retrieve the user's email address. Using the user's email address as a unique key, the CS can write the user's bridge hostname to the DynamoDB database and the SHS can read the user's bridge hostname from the DynamoDB database.

### Account Linking

Amazon provides instructions on how to [Set Up Account Linking](https://developer.amazon.com/en-US/docs/alexa/smarthome/set-up-account-linking-tutorial.html). The one thing to remember is to be sure to set it up so that it requests access to the user's email address. Otherwise, neither the CS nor the SHS will have access to the user's email address.

### Acquiring the email Address using the Custom Skill

Acquiring the user's email address is a two step process. First the CS retrieves the user's API Access Token from a CS request. Next the CS uses the API Access Token to retrieve the user's email address using the Alexa Customer Profile API.

#### Retrieving the API Access Token from a Custom Skill Request Event

When a CS in linked to the user's Amazon account, request events contain an API Endpoint (apiEndpoint) and API Access Token (apiAccessToken). The CS can find the apiEndpoint in request event at `handlerInput.requestEnvelope.context.System.apiEndpoint`. The CS can find the apiAccessToken in the request event at `handlerInput.requestEnvelope.context.System.apiAccessToken`
The CS can use this apiEndpoint and apiAccessToken to retrieve the user's email address.

#### Retrieving the email Address Using the Alexa Customer Profile API

Once the CS has the apiEndpoint and the user's apiAccessToken, it can request the user's email address from

> <https://API_ENDPOINT/v2/accounts/~current/settings/Profile.email>

by sending a GET request to the URL with the HTTP authorization header

> Authorization: Bearer API_ACCESS_TOKEN

where API_ENDPOINT is the value of apiEndpoint and API_ACCESS_TOKEN is the value of the apiAccessToken. The full request would look like

> Host: API_ENDPOINT
> Accept: application/json
> Authorization: Bearer API_ACCESS_TOKEN
> GET <https://API_ENDPOINT/v2/accounts/~current/settings/Profile.email>

The alexa-for-lg-webos-tv's CS implements the retrieval of the email address in the [getUserEmail](../src/common/profile/custom-skill.ts) function.

You can find more information at ["Request Customer Contact Information for Use in Your Skill"](https://developer.amazon.com/en-US/docs/alexa/custom-skills/request-customer-contact-information-for-use-in-your-skill.html).

### Acquiring the email Address using the Smart Home Skill

#### Retrieving the Bearer Token from a Smart Home Skill Request Directive

When an SHS in linked to the user's Amazon account, request directives will contain a bearerToken (bearerToken). The SHS can use this bearerToken to retrieve the user's profile. Assuming the user granted access to their email address during account linking, the user's profile will contain user's email address.

The location of the bearerToken in the SHS request directive depends the type of directive. For the ["Alexa.Authorization" "AcceptGrant" directive](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-authorization.html#acceptgrant-directive-example), it is found at `directive.payload.grantee.token`. For the ["Alexa.Discovery" "Discover" directive](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-discovery.html#discover-directive-example) it is found at `directive.payload.scope.token`. For directives sent to a specific endpoint such as the ["Alexa.PowerController" "TurnOn" directive](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-powercontroller.html#directives), it is found at `directive.endpoint.scope.token`. The alexa-for-lg-webos-tv's SHS implements the retrieval of the bearerToken in the [getBearerToken](../src/common/smart-home-skill/request.ts) function.

#### Retrieving the email Address

Once the SHS has the user's bearerToken, it can request the user's profile from

> <https://api.amazon.com/user/profile>

by sending a GET request to the URL with the HTTP authorization header

> Authorization: Bearer BEARER_TOKEN

where BEARER_TOKEN is the value of the bearerToken. The full request would look like

> Host: api.amazon.com
> Accept: application/json
> Authorization: Bearer _apiAccessToken_
> GET <https://api.amazon.com/user/profile>

The response contains the items the user agreed to share, including the email address.

### The Database

The alexa-for-lg-webos-tv's skill uses DynamoDB as its database.

The database has a table named ForLGwebOSTV. This table uses the user's email address as its key. And it contains the user's email address (email), bridge hostname (hostname), the bridge bearer token (bridgeToken) and SHS bearer token (skillToken) for each user. In addition, the database table has an associated Global Secondary Index (GSI) named skillToken_index. This GSI uses skillToken as its index. And it contains skillToken, email, hostname and bridgeToken for each user.

Using email as the table's key makes it easy for both the CS and the SHS to look up hostname and bridgeToken after they have used their respective tokens to retrieve the user's email address. When the user configures their bridge through interaction with the skill, the CS stores the bridge hostname (hostname) and bridge bearer token (bridgeToken) in the table keyed to user's email address (email). When the SHS needs to send a message to the bridge, it can look up hostname and bridgeToken in the table using email.

However, the SHS looking up hostname and bridgeToken using email is inefficient. If it used the email to look up hostname and bridgeToken, it would first need to use its bearer token to retrieve the user's profile from LWA profile server. Retrieving the profile every time it had a message to send would add needless delay in sending the message as well as add needless load on the LWA profile server. Instead, the SHS looks up hostname and bridgeToken in the GSI using the skillToken. If it does not find skillToken in the GSI, it uses the skillToken to retrieve the user's profile and uses the uses the user's email address to add skillToken to the table. After adding skillToken to the table, the SHS as able to look up hostname and bridgeToken in the GSI using the skillToken.

The alexa-for-lg-webos-tv skill's database functions are found [here](../src/skill/lib/database.ts).

#### Database Performance

There are a three things to notice besides the functions for setting the bridge hostname (setHostname), getting the bridge hostname (getHostname), setting the bridge's bearer token (setBridgeToken), getting the bridge's bearer token (getBridgeToken) and setting the SHS's bearer token (setSkillToken).

[Amazon provides recommendations on how to improve the performance of lambda functions by Amazon](https://aws.amazon.com/blogs/compute/operating-lambda-performance-optimization-part-2/). First, Amazon suggests maintaining the connection to databases outside of the handler. This ensures the lambda function establishes its connection to the database outside of the handler function. Doing this causes the lambda function to connect to the database once when it is loaded rather than every time the handler function is called. Second, Amazon suggests loading needed parts of the modules. Doing this reduces the lambda function load time. Third, Amazon recommends that the [DynamoDB connection enable HTTP keep-alive](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-reusing-connections.html) to improve connections. The alexa-for-lg-webos-tv's skill implements all of these suggestions.

## Communication Between the Smart Home Skill and the Bridge

While it is the SHS that receives the request directives, it is the bridge that processes them. Therefore, the SHS must forward the directives to the bridge.

### Authorization

Following the procedure outlined in [Acquiring the Email Address Using the Smart Home Skill](#acquiring-the-email-address-using-the-smart-home-skill), the bridge can acquire the user's email address. After that, the bridge can compare the email address to the email addresses in the configuration file to determine whether the request directive should processed. However, following this naive approach has some problems.

The first problem is the problem mentioned in [The Database](#the-database): retrieving the profile every time the bridge receives a message would add needless delay in processing the message as well as add needless load on the LWA profile server. The bridge solves this problem the same way SHS solved the problem when looking up the bridge hostname. The bridge maintains a database containing the SHS's bearer token (skillToken) and its associated user email address (email). The bridge looks up skillToken in the database. If it finds skillToken in the database, then it authorizes the request. If it doesn't then it acquires the user's email address. If the email address is in the configuration file, then it adds skillToken to the database. After that, it looks up skillToken in the database again. If it still doesn't find it, then it does not authorize the request.

The second problem is the problem of attackers misusing the bridge. The skill receives Directive messages from Amazon, so it can trust that the bearer token in a Directive message is valid. However, without further protections, the bridge can't be sure it is just receiving Directive messages forwarded from the skill. This can a problem. Suppose an attacker decides to send Directive messages and changes the bearer token each time. In this scenario, the bridge would attempt and fail to acquire an email address for every Directive message it receives. Without further protection, the attacker could launch an attack on the LWA profile server using the bridge.

To address this problem, the skill and bridge establish a bearer token that the skill uses when communicating with the bridge.

First, the skill sends the bridge a JSON Web Token (JWT). The skill sends it to a URL responsible for exchanging the JWT for a bearer token:

> <https://HOSTNAME/login>

Where HOSTNAME is the bridge's hostname. The JWT asserts that user's email address has been authorized to use the service located at the bridge's skill interface URL:

> <https://HOSTNAME/api/ForLGwebOSTV/v1>

The JWT has the form

```JSON
{
    "iss": "For LG webOS TV",
    "sub": "EMAIL",
    "aud": "https://HOSTNAME/api/ForLGwebOSTV/v1",
    "exp": "NOW + 1m"
}

where EMAIL is the user's email address and HOSTNAME is the bridge's hostname. The expiration time is just 1m into the future to reduce the chance of replay attacks. The skill signs JWT using and x509 private key. The bridge authenticates the JWT using the corresponding x509 public key.

It is important to note that the authorization to use the service is the result of the user using the skill to configure the bridge's hostname. Therefore, the bridge can only trust that the JWT came from the skill and that the skill believes the authorization is genuine. So, as part of the JWT validation, the bridge compares the email address against its list of authorized emails and the service against its URL before accepting the JWT.

If the bridge accepts the JWT, then it responds with a bearer token. The skill uses this bearer token when communicating with the bridge's skill interface.

As further protection, the bridge implements dynamic IP address blocking. After a small number of JWT authorization failures originating from an IP address, the IP address is temporarily blocked.
```

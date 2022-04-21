# Software Implementation

Under the hood, the software does several things that I believe are worth documenting because I was not able to find examples on the internet.

## Linking the Custom Skill and the Smart Home Skill

The alexa-for-lg-webos-tv skill is a Multi-Capability Skill (MCS) that combines a Custom Skill (CS) and a Smart Home Skill (SHS). It uses the CS to configure the bridge hostname, and it uses the SHS to control the televisions. For this to work, the CS must share the bridge hostname with the SHS. The skill does this a combination of [Account Linking](https://developer.amazon.com/en-US/docs/alexa/account-linking/add-account-linking.html) and a [DynamoDB database](https://aws.amazon.com/dynamodb/). The skill uses [Login With Amazon (LWA)](https://developer.amazon.com/apps-and-games/login-with-amazon) to perform account linking. Once the skill is linked to the user's Amazon account and the user agrees to share their email address, both the CS and SHS to retrieve the user's email address. Using the user's email address as a unique key, the CS can write the user's bridge hostname to the DynamoDB database and the SHS can read the user's bridge hostname from the DynamoDB database.

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

When an SMS in linked to the user's Amazon account, request directives will contain a bearerToken (bearerToken). The SMS can use this bearerToken to retrieve the user's profile. Assuming the user granted access to their email address during account linking, the user's profile will contain user's email address.

The location of the bearerToken in the SMS request directive depends the type of directive. For the ["Alexa.Authorization" "AcceptGrant" directive](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-authorization.html#acceptgrant-directive-example), it is found at `directive.payload.grantee.token`. For the ["Alexa.Discovery" "Discover" directive](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-discovery.html#discover-directive-example) it is found at `directive.payload.scope.token`. For directives sent to a specific endpoint such as the ["Alexa.PowerController" "TurnOn" directive](https://developer.amazon.com/en-US/docs/alexa/device-apis/alexa-powercontroller.html#directives), it is found at `directive.endpoint.scope.token`. The alexa-for-lg-webos-tv's SMS implements the retrieval of the bearerToken in the [getBearerToken](../src/common/smart-home-skill/request.ts) function.

#### Retrieving the email Address

Once the SMS has the user's bearerToken, it can request the user's profile from

> <https://api.amazon.com/user/profile>

by sending a GET request to the URL with the HTTP authorization header

> Authorization: Bearer BEARER_TOKEN

where BEARER_TOKEN is the value of the bearerToken. The full request would look like

> Host: api.amazon.com
> Accept: application/json
> Authorization: Bearer *apiAccessToken*
> GET <https://api.amazon.com/user/profile>

The response contains the items the user agreed to share, including the email address.

### The Database

The alexa-for-lg-webos-tv's skill uses DynamoDB as its database.

The database has a table named ForLGwebOSTV. This table uses the user's email address as its key. And it contains contains the email address, bridge hostname and SHS bearerToken for each user. In addition, the database table has an associated Global Secondary Index (GSI) named bearerToken_index. This GSI uses the user's SHS bearerToken as its index. And it contains the SHS bearerToken, email address and bridge hostname for each user.

Using the email address as the table's key makes it easy for both the CS and the SHS to look up the bridge hostname after they have used their respective tokens to retrieve the email address. When the user configures their bridge hostname through interaction with the skill, the CS stores the bridge hostname in the table keyed to email address. When the SHS needs to send a message to the bridge, it can look up the bridge hostname in the table using the email address.

However, the SHS looking up the hostname using the email address is inefficient. If it used the email address to look up the bridge hostname, it would first need to use the bearerToken to retrieve the user's profile from LWA profile server. Retrieving the profile every time it had a message to send would add needless delay in sending the message as well as add needless load on the LWA profile server. Instead, the looks up the hostname in the GSI using the bearerToken. If it does not find the bearerToken in the GSI, it uses the bearerToken to retrieve the user's profile and uses the uses the user's email address to add the bearerToken to the table. After adding bearerToken to the table, the SHS as able to look up the bridge hostname in the GSI using the bearToken.

The alexa-for-lg-webos-tv skill's database functions are found [here](../src/skill/lib/database.ts).

#### Database Performance

There are a couple things to notice besides the functions for setting the bridge hostname (setHostname), getting the bridge hostname (getHostname) and setting the bearerToken (setBearerToken).

[Amazon provides recommendations on how to improve the performance of lambda functions by Amazon](https://aws.amazon.com/blogs/compute/operating-lambda-performance-optimization-part-2/). First, Amazon suggests maintaining the connection to databases outside of the handler. This ensures the lambda function establishes its connection to the database outside of the handler function. Doing this causes the lambda function to connect to the database once when it is loaded rather than every time the handler function is called. Second, Amazon suggests loading needed parts of the modules. Doing this reduces the lambda function load time. The alexa-for-lg-webos-tv's skill implements both of these suggestions.

One thing to note, Amazon recommends that the [DynamoDB connection enable HTTP keep-alive](https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/node-reusing-connections.html) to improve connections. In AWS-SDK v3 for JavaScript in Node.js, [HTTP keep-alive is the default](https://aws.amazon.com/blogs/developer/http-keep-alive-is-on-by-default-in-modular-aws-sdk-for-javascript/). If the AWS-SDK you are using does not enable it by default, then you should enable it.

## Communication Between the Smart Home Skill and the Bridge

While it is the SHS that receives the request directives, it is the bridge that processes them. Therefore, the SHS must forward the directives to the bridge.

### Authorization

The bridge has a configuration file with the email addresses of authorized users.

Following the procedure outlined in [Acquiring the Email Address Using the Smart Home Skill](#acquiring-the-email-address-using-the-smart-home-skill), the bridge can acquire the user's email address. After that, the bridge can compare the email address to the email addresses in the configuration file to determine whether the request directive should processed.

There are two problems with this naive approach.

The first problem is that the bridge would need to parse the request directive before it could authorize the user. The alexa-for-lg-webos-tv solves this problem by using the bearerToken to authorize the HTTP request. Just as in [Retrieving the email Address](#retrieving-the-email-address), the SHS includes the HTTP authorization header

> Authorization: Bearer BEARER_TOKEN

in the HTTP POST requests to the bridge. This allows the bridge to accept or reject the request without processing the contents of the POST.

The second problem is the problem mentioned in [The Database](#the-database): retrieving the profile every time the bridge receives a message would add needless delay in processing the message as well as add needless load on the LWA profile server. The bridge solves this problem the same way SMS solved the problem when looking up the bridge hostname. The bridge maintains a database containing the bearerToken and its associated email address. The bridge looks up the bearerToken in the database. If it finds the bearerToken in the database, then it authorizes the request. If it doesn't then it acquires the user's email address. If the email address is in the configuration file, then it adds the bearerToken to the database. After that, it looks then it looks up the bearerToken in the database again. If it still doesn't find it, then it does not authorize the request.

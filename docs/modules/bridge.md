[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / bridge

# Module: bridge

# Code Structure

The bridge implements the mapping from Alexa Smart Home Skill messages to LG
webOS TV messages in three parts:

- [frontend](#frontend),
- [middle](#middle), and
- [backend](#backend).

## Frontend

The frontend handles the communication link between the bridge and the skill.
It is an HTTP server that maintains three path-differentiated communication
links: an authorization link for skill and email address authorization, a
test link for testing whether or not the skill and email address are
currently authorized and a Alexa Smart Home Skill link for sending Alexa
Smart Home Skill messages.

The frontend uses a bearer token to authorize HTTP messages sent on the test
link and the Alexa Smart Home Skill link.

The frontend uses the authorization link to authorize the skill and the email
address and to establish the bearer token. The skill sends a JWT containing
the bridge hostname and the email address and signed by the skill. The bridge
verifies the JWT, checks that the email address is authorized and creates the
bearer token. TODO: verify that the bridge hostname in the JWT matches the
bridge's hostname.

## Middle

The middle handles the translation between the Smart Home Skill communication
protocol and the LG webOS TV protocol.

The middle authorizes the Alexa Smart Home Skill messages by validating that
the bearer token in each message belongs to an email address that is
authorized to use the bridge. TODO: verify that the email address associated
with the Alexa Smart Home Skill message matches the email address associated
with the HTTP message that transported the Alexa Smart Home Skill message.

## Backend

The backend handles the communication link between the bridge and the LG
webOS TV.

## Table of contents

### Classes

- [Bridge](../classes/bridge.Bridge.md)

### Functions

- [startBridge](bridge.md#startbridge)

## Functions

### startBridge

▸ **startBridge**(): `Promise`\<`void`\>

A convenience function to build and start the Bridge.

#### Returns

`Promise`\<`void`\>

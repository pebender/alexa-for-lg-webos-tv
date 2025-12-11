# The Bridge

The bridge works in conjunction with the [skill](./skill.md#the-skill) to enable
Alexa support on LG webOS TVs that lack built-in Alexa support. The bridge
communicates with the skill using [the Skill to Bridge
Interface](./skill-to-bridge-interface.md#the-skill-to-bridge-interface).

The bridge expects to be running as a service on the same network as the LG
webOS TVs to be controlled by Alexa. The bridge expects to be accessible from
the internet through a reverse proxy.

The bridge is divided into a link and services. The link handles the
communication link between the bridge and the skill. Services is just one
service: shs-to-lg-webos-tv. The shs-to-lg-webos-tv service is divided into a
translator and a tv-manager. The translator translates between the Smart Home
Skill protocol and the LG webOS TV protocol. The tv-manager manages the
communication between the bridge and the LG webOS TVs being controlled. From the
perspective of the [Skill to Bridge
Interface](./skill-to-bridge-interface.md#the-skill-to-bridge-interface), the
link implements the link and the shs-to-lg-webos-tv implements the service.

## The Link

The link handles the communication link between the skill and the bridge. It

- implements an HTTP server,
- routes the interfaces based on HTTP request method and path,
- controls access to the interfaces based on the token in the HTTP Authorization
  request header,
- handles login interface requests,
- handles test interface requests, and
- forwards service interface requests (which are Smart Home Skill Directives) to
  the service for handling.

### Skill to Bridge Interface Authorization

#### Login Token Authorization

The link performs the authorization described in [login token
authorization](./skill-to-bridge-interface.md#the-login-token-authorization).

#### Bridge Token Authorization

The link performs the authorization described in [bridge token
authorization](./skill-to-bridge-interface.md#the-bridge-token-authorization).

## The shs-to-lg-web-os-tv Service

### The Translator

The translator translates between the Smart Home Skill signaling and the LG
webOS TV signaling. It

- translates between the Smart Home Skill signaling and the LG webOS TV
  signaling,
- controls access based on the access token in the Smart Home Skill Directives,
  and
- provides the link with skill token authorization services.

#### Smart Home Skill Service Authorization

When a skill is linked to the user's Amazon account, the user's skill messages
contain an access token that is user specific. [The skill to bridge
interface](./skill-to-bridge-interface.md#the-skill-to-bridge-interface) uses
this skill access token to authorize the user during
[login](./skill-to-bridge-interface.md#the-login-interface). The
shs-to-lg-webos-tv service uses this skill access token to authorize the Smart
Home Skill Directives before processing them.

The service has Amazon's profile server verify the skill access token and
translate the skill access token into the user's Amazon account identifier.

The translator maintains a database
(~/.ForLGwebOSTV/services/shs-to-lg-web-os-tv/user.nedb) with records containing
the skill access token (skillToken) and the user's Amazon account identifier
(userId) for mapping skillToken to and from userId. If the skillToken isn't
found in the database, then the service attempts to update (add) the mapping
using the procedure outlined in ["Retrieving the User's
Identifier"](./skill.md#retrieving-the-users-identifier). If the attempt is
successful, then the user's Amazon account identifier to skill token mapping is
updated in (added to) the database.

### The TV Manager

The TV manager is implemented by the
[TvManager](../../doc_markdown/@backinthirty/alexa-for-lg-webos-tv-bridge/lib/services/shs-to-lg-webos-tv/tv-manager/classes/TvManager.md)
class in
[packages/bridge/src/lib/services/shs-to-lg-webos-tv/index.ts](../../packages/bridge/src/lib/services/shs-to-lg-webos-tv/index.ts).

The TV manager manages the communication links between the tv manager and the LG
webOS TVs being controlled. It

- searches for LG webOS TVs on the network,
- maintains connections with the LG webOS TVs it finds and
- routes messages between the translator and the the LG webOS TVs being controlled.

The TV manager contains a TV searcher and a tv controller. The TV controller
contains a TV control for each LG webOS TV the TV manager is controlling. The TV
searcher searches for LG webOS TVs on the local network. When it finds one, it
alerts the TV controller that it found a TV. The TV controller allocates a TV
control to the TV. The TV control connects to the TV, making it possible for the
translator to send requests to and receive responses from the TV.

#### The TV Searcher

The TV searcher is implemented by the
[TvSearcher](../../doc_markdown/@backinthirty/alexa-for-lg-webos-tv-bridge/lib/services/shs-to-lg-webos-tv/tv-manager/tv-searcher/classes/TvSearcher.md)
class in
[packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-searcher.t](../../packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-searcher.ts).

The TV searcher uses UPnP discovery ([UPnP Device Architecture
1.1](https://upnp.org/specs/arch/UPnP-arch-DeviceArchitecture-v1.1.pdf)) along
with LG Electronics custom service type
`urn:lge-com:service:webos-second-screen:` to detect the LG webOS TVs on the
local network. This appears to be the most reliable way to find LG webOS TVs
because of the more targeted service type, the cleaner response headers and
cleaner device description fields. Other UPnP service types advertised by LG
webOS TVs appear to have either less consistent response headers or device
description fields making it more difficult to identify them. My LG webOS TV
advertises as [UPnP
1.0](https://upnp.org/specs/arch/UPnP-arch-DeviceArchitecture-v1.0.pdf).
However, the discovery implemented by my TV complies with [UPnP
1.1](https://upnp.org/specs/arch/UPnP-arch-DeviceArchitecture-v1.1.pdf) and my
TV accepts UPnP 1.1 as well.

When the TV searcher detects a LG webOS TV, it alerts the TV controller.

#### The TV Controller

The TV controller is implemented by the [TvController](../../doc_markdown/@backinthirty/alexa-for-lg-webos-tv-bridge/lib/services/shs-to-lg-webos-tv/tv-manager/tv-controller/classes/TvController.md`) class in [packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-controller.ts](../../packages/bridge/src/lib/services/shs-to-lg-webos-tv/tv-manager/tv-controller.ts).

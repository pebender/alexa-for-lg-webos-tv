# The Bridge

The bridge works in conjunction with the [skill](./skill.md#the-skill) to enable Alexa support on LG webOS TVs that lack built-in Alexa support. The bridge communicates with the skill using [the Skill to Bridge Interface](./skill-to-bridge-interface.md#the-skill-to-bridge-interface).

The bridge expects to be running as a service on the same network as the LG webOS TVs to be controlled by Alexa. The bridge expects to be accessible from the internet through a reverse proxy.

The bridge is divided into a frontend, a middle and a backend. The frontend handles the communication link between the bridge and the skill. The middle translates between the Smart Home Skill protocol and the LG webOS TV protocol. The backend handles the communication links between the bridge and the LG webOS TVs being controlled. From the perspective of the [Skill to Bridge Interface](./skill-to-bridge-interface.md#the-skill-to-bridge-interface), the frontend implements the link and collectively the middle and backend implement the service.

## The Frontend

The frontend handles the communication link between the skill and the bridge. It

- implements an HTTP server,
- routes the interfaces based on HTTP request method and path,
- controls access to the interfaces based on the token in the HTTP Authorization request header,
- handles login interface requests,
- handles test interface requests, and
- forwards service interface requests (which are Smart Home Skill Directives) to the middle for handling.

### Skill to Bridge Interface Authorization

#### Login Token Authorization

The frontend performs the authorization described in [login token authorization](./skill-to-bridge-interface.md#the-login-token-authorization).

#### Bridge Token Authorization

The frontend performs the authorization described in [bridge token authorization](./skill-to-bridge-interface.md#the-bridge-token-authorization).

## The Middle

The middle translates between the Smart Home Skill signaling and the LG webOS TV signaling. It

- translates between the Smart Home Skill signaling and the LG webOS TV signaling,
- controls access based on the access token in the Smart Home Skill Directives, and
- provides the frontend with skill token authorization services.

### Smart Home Skill Service Authorization

When a skill is linked to the user's Amazon account, the user's skill messages contain an access token that is user specific. [The skill to bridge interface](./skill-to-bridge-interface.md#the-skill-to-bridge-interface) uses this skill access token to authorize the user during [login](./skill-to-bridge-interface.md#the-login-interface). The SHS-LGTV service uses this skill access token to authorize the Smart Home Skill Directives before processing them. The middle is responsible for performing these authorizations.

The service has Amazon's profile server verify the skill access token and translate the skill access token into the user's Amazon account identifier.

The middle maintains a database (~/.ForLGwebOSTV/middle.nedb) with records containing the skill access token (skillToken) and the user's Amazon account identifier (userId) for mapping skillToken to and from userId. If the skillToken isn't found in the database, then the middle attempts to update (add) the mapping using the procedure outlined in ["Retrieving the User's Identifier"](./skill.md#retrieving-the-users-identifier). If the attempt is successful, then the user's Amazon account identifier to skill token mapping is updated in (added to) the database.

If skillToken is in the database (after any updates) and matches the skillToken used when requesting the transporting bearerToken, then the message is authorized. If the message is not authorized, then the middle signals the frontend that the message is not valid and the frontend failed service link authorization.

## The Backend

The backend is implemented by the [Backend](../../../docs/classes/src/bridge/lib/backend/index.ts) class in [src/bridge/lib/backend/index.ts](../../../src/bridge/lib/backend/index.ts).

The backend handles the communication links between the backend and the LG webOS TVs being controlled. It

- searches for LG webOS TVs on the network,
- maintains connections with the LG webOS TVs it finds and
- routes messages between the middle and the the LG webOS TVs being controlled.

The backend contains a searcher and a controller. The controller contains a control for each LG webOS TV the backend is controlling. The searcher searches for LG webOS TVs on the local network. When it finds one, it alerts the controller. The controller allocates a control. The control connects to the TV, making it possible for the middle to send requests to and receive responses from the TV.

### The Searcher

The searcher is implemented by the [BackendSearcher](../../../docs/classes/bridge_lib_backend_backend_searcher.BackendSearcher.md) class in [src/bridge/lib/backend/backend-searcher.ts](../../../src/bridge/lib/backend/backend-searcher.ts).

The searcher uses UPnP discovery ([UPnP Device Architecture 1.1](https://upnp.org/specs/arch/UPnP-arch-DeviceArchitecture-v1.1.pdf)) along with LG Electronics custom service type `urn:lge-com:service:webos-second-screen:` to detect the LG webOS TVs on the local network. This appears to be the most reliable way to find LG webOS TVs because of the more targeted service type, the cleaner response headers and cleaner device description fields. Other UPnP service types advertised by LG webOS TVs appear to have either less consistent response headers or device description fields making it more difficult to identify them. My LG webOS TV advertises as [UPnP 1.0](https://upnp.org/specs/arch/UPnP-arch-DeviceArchitecture-v1.0.pdf). However, the discovery implemented by my TV complies with [UPnP 1.1](https://upnp.org/specs/arch/UPnP-arch-DeviceArchitecture-v1.1.pdf) and my TV accepts UPnP 1.1 as well.

When the searcher detects a LG webOS TV, it alerts the controller.

### The Controller

The controller is implemented by the [BackendController](../../../docs/classes/bridge_lib_backend_backend_controller.BackendController.md) class in [src/bridge/lib/backend/backend-controller.ts](../../../src/bridge/lib/backend/backend-controller.ts).

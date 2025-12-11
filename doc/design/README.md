# Design

## Description

The Alexa for LG webOS TV software (alexa-for-lg-webos-tv) consists of two
[Node.js](https://nodejs.org/) packages: the skill (alexa-for-lg-webos-tv-skill)
and the bridge (alexa-for-lg-webos-tv-bridge). The skill is to be run on the
Amazon cloud. The bridge is to be run on the same local network as the TVs to be
controlled.

The skill communicates with the bridge using [the skill to bridge
interface](./skill-to-bridge-interface.md#the-skill-to-bridge-interface). [The
skill](./skill.md#the-skill) is responsible for routing Smart Home Skill
protocol messages between the Alexa Cloud and the bridge. [The
bridge](./bridge.md#the-bridge) is responsible for translating between Smart
Home Skill protocol and the LG webOS TV protocol. Both the skill and the bridge
are responsible for establishing secure communication between the skill and the
bridge.

- [The Skill to Bridge
  Interface](./skill-to-bridge-interface.md#the-skill-to-bridge-interface)
- [The Skill](./skill.md#the-skill)
- [The Bridge](./bridge.md#the-bridge)
- [Software Modules](../../../docs/)

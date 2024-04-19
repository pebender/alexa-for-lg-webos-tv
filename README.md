# Introduction

With alexa-for-lg-webos-tv, Alexa can control LG Electronics televisions that run webOS but don't have built-in Alexa support. There are two parts to the software: an Alexa skill and a bridge. The Alexa skill presents one or more TVs, each with controls relevant to the television the skill is controlling. The bridge converts between the skill's Alexa Smart Home API and the LG webOS TV's SSDP/SSAP API. The skill runs on Amazon's cloud. The bridge runs on the same local network as the LG webOS TVs. The skill and the bridge communicate with each other over a secure internet connection.

I am reasonably happy with the basic functionality

- Use account linking so both the Custom and Smart Home parts of the skill can retrieve the user's email address.
- Use Alexa to configure the bridge's hostname,
- Use JSON Web Tokens to create a bearer token that the skill and bridge use to communicate securely, and
- Control basic TV functions.

However, there are many things left to do

- Support better Alexa Smart Home Skill error handling,
- Support for multiple TVs (it has been implemented but not tested),
- Simplify installation,
- Document installation procedures, and
- Comment the code.

## Table of Contents

- [Installation](./README.d/installation.md#installation)
  - [Development Environment](./README.d/installation.md#development-environment)
  - [Compilation](./README.d/installation.md#compilation)
  - [Skill Installation](./README.d/installation.md#skill-installation)
  - [Bridge Installation](./README.d/installation.md#bridge-installation)
- [Operation](./README.d/operation.md#operation)
- [Implementation](./README.d/implementation.md#implementation)
- [LG WebOS TV Commands](./README.d/lg-webos-tv-commands.md#lg-webos-tv-commands)

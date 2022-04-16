# Introduction

With alexa-for-lg-webos-tv, Alexa can control LG Electronics televisions that run webOS but don't have built-in Alexa support. There are two parts to the software: an Alexa skill and a bridge. The Alexa skill presents one or more TVs each with controls relevant to the television the skill is controlling. The bridge converts between the skill's Alexa Smart Home API and the LG webOS TV's SSDP/SSAP API. The skill runs on Amazon's cloud. The bridge runs on the same local network as the LG webOS TVs. The skill and the bridge communicate with each other over a secure internet connection.

This software is in early development. I started the project some years ago and then put it aside to focus on other things. Now I'm working on it again. The basic functionality

- Use Alexa to configure the bridge's hostname,
- Use account linking to authenticate and authorize communication between the Alexa skill and the bridge, and
- Control basic TV functions.

However, there are many things left to do

- Support Alexa Smart Home Skill error handling,
- Support for multiple TVs,
- Simplify installation,
- Document installation procedures, and
- Comment the code.

## Table of Contents

- [Installation](./doc/installation.md#installation)
  - [Development Environment](./doc/installation.md#development-environment)
  - [Compilation](./doc/installation.md#compilation)
  - [Skill Installation](./doc/installation.md#skill-installation)
  - [Bridge Installation](./doc/installation.md#bridge-installation)
- [Operation](./doc/operation.md#operation)

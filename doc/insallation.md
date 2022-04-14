# Installation

Getting things up and running requires several steps that aren't for the faint of heart. You need to

- edit the software configuration, and
- compile the software.

To get the Alexa skill running, you need to

- create the skill,
- create the skill's account linking security profile,
- create the skill's lambda function, and
- upload the lambda functions' software.

To get the bridge running, you need to

- acquire a TLS certificate,
- set up a reverse proxy,
- install Node.js, and
- install the bridge software.

## Development Environment

Both the skill and the bridge are written in [TypeScript](https://www.typescriptlang.org) and run in a [Node.js](https://nodejs.org) v14.x environment. It uses Node.js v14.x because v14.x is the Node.js version support by Amazon for skill development. So, for software development and compilation, you need Node.js v14.x installed. All other needed Node.js modules, including the TypeScript compiler, are downloaded as part of the build process.

When developing the software, I use [Visual Studio Code](https://code.visualstudio.com) with the extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Node.js Modules Intellisense](https://marketplace.visualstudio.com/items?itemName=leizongmin.node-module-intellisense)
- [npm](https://marketplace.visualstudio.com/items?itemName=eg2.vscode-npm-script)
- [npm Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.npm-intellisense)
- [Dependency Analytics](https://marketplace.visualstudio.com/items?itemName=redhat.fabric8-analytics)
- [Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)
- [Markdown Preview Enhanced](https://marketplace.visualstudio.com/items?itemName=shd101wyy.markdown-preview-enhanced)
- [markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint)
- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
- [GitLens](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)
- [Git History](https://marketplace.visualstudio.com/items?itemName=donjayamanne.githistory)

## Compilation

Before you can compile the software, you must install Node.js version v14.x. Once you have installed Node.js, change to the [pkg/](../pkg) directory and run the command

`npm run all`

This will download the required node.js modules as well as compile and package the software. The skill software package is a zip file in [pkg/skill](../pkg/skill). The bridge software package is a tgz file in [pkg/bridge](../pkg/bridge)

## Skill Installation

The skill is in the development phase. Therefore, you will need to install your own version of skill. To do this, you will need to be familiar with skill development because to get the skill running you will use

- the [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask) to create the Alexa Multi-Capability Skill (MCS),
- the [AWS Lambda Console](https://console.aws.amazon.com/lambda) to create the skill's lambda function,
- the [Security Profile Management Console](https://developer.amazon.com/settings/console/securityprofile/overview.html) to create the security profile for the skill's account linking, and
- the [DynamoDB Dashboard](https://console.aws.amazon.com/dynamodbv2) to create the database for the skill's email address to bridge hostname mapping.

When you create them,

- name the skill "For LG webOS TV",
- name the lambda function "ForLGwebOSTV",
- name the security profile "For LG webOS TV", and
- name the database table "ForLGwebOSTV"

To install the skill, you will need to create an Alexa Smart Home skill.

## Bridge Installation

The bridge has three interfaces: an HTTP interface for communication with the Alexa skill, an SSDP/SSAP interface for communication with the LG webOS television(s), and a filesystem interface for storing a retrieving persistent configuration.

While there is no reason to expect that the bridge won't run in a Node.js environment newer than version v14.x, versions other than v14.x have not been tested. While there is no reason to expect that the bridge won't run on non-Linux operating systems, operating systems other than Linux (specifically a [Synology NAS](https://www.synology.com/en-global)) have not been tested.

Because the Alexa skill communicates with the bridge's HTTP interface, the bridge's HTTP interface must be accessible from the internet. While the bridge does not support HTTPS, the Alexa skill expects HTTPS. One way to meet this requirement is to run the bridge behind a [NGINX](https://www.nginx.com) web server acting as a [reverse proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/).

The Alexa skill expects the HTTPS interface to be listening on port 25392. The bridge expects the reverse proxy to forward the HTTP traffic to port 25391.

The Alexa skill must be able to validate the TLS certificate as well as be able to extract from the certificate the web server's Fully Qualified Domain Name (FQDN). Services such as [no-ip](https://www.noip.com) provide free FQDNs that will point to a dynamically assigned IP address. Services such as [Let's Encrypt](https://letsencrypt.org) provide free TLS certificates.

Because LG webOS televisions advertise their capabilities using the Simple Service Discovery Protocol (SSDP), the bridge listens on port 1900 for SSDP messages. There is [SSDP DDoS attack](https://www.ncsc.gov.ie/emailsfrom/DDoS/SSDP/). Therefore, be sure that none of the SSDP ports, including 1900, are not accessible from the internet.

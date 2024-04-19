# Installation

Getting things up and running requires several steps that aren't for the faint of heart. You need to

- generate and install x509 private key and public certificate, and
- compile the software.

To get the skill running, you need to

- create the Multi-Capability Skill (MCS),
- add [Custom Skill interaction model](../src/skill/lib/custom-skill/interaction-model.json) to the MCS,
- create the skill's account linking security profile,
- create the skill's lambda function, and
- upload the lambda functions' software.

To get the bridge running, you need to

- acquire a TLS certificate trusted by Amazon Web Services (e.g. a TLS certificate from [Let's Encrypt](https://letsencrypt.org)),
- set up a reverse HTTP proxy,
- install Node.js, and
- install and start the bridge software.

## Development Environment

Both the skill and the bridge are written in [TypeScript](https://www.typescriptlang.org) and run in a [Node.js](https://nodejs.org) v20.x environment. It uses Node.js v20.x because v20.x is the Node.js version supported by Amazon for skill development. So, for software development and compilation, you need Node.js v20.x installed. All other needed Node.js modules, including the TypeScript compiler, are downloaded as part of the build process.

When developing the software, I use [Visual Studio Code](https://code.visualstudio.com) with the extensions:

- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [npm Intellisense](https://marketplace.visualstudio.com/items?itemName=christian-kohler.npm-intellisense)
- [markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint)
- [Code Spell Checker](https://marketplace.visualstudio.com/items?itemName=streetsidesoftware.code-spell-checker)
- [Git History](https://marketplace.visualstudio.com/items?itemName=donjayamanne.githistory)

## Pre-Compilation

You need to do two things before you compile.

First, you need to add an x.509 RSA private / public key pair to the software. The script in [src/common/x509/x509-generate.sh](../src/common/x509/x509-generate.sh) will generate the necessary key (ForLGwebOSTV.key) and certificate (ForLGwebOSTV.crt) under Linux and MacOS. Once you have them, put the private key in [src/skill/lib/custom-skill/login](../src/skill/lib/custom-skill/login) and put the public certificate in [src/bridge/lib/frontend/authorization](../src/bridge/lib/frontend/authorization).

Second, you need to install Node.js version v20.x.

## Compilation

Once you have completed the pre-compilation steps, change to the [pkg/](../pkg) directory and run the command

`npm run all`

This will download the required node.js modules as well as compile and package the skill and bridge software. The skill software package is a zip file in [pkg/skill](../pkg/skill). The bridge software package is a tgz file in [pkg/bridge](../pkg/bridge)

## Skill Installation

The skill is in the development phase. Therefore, you need to install your own version of skill. To do this, you need to be familiar with skill development. To get the skill running you will use

- the [Alexa Developer Console](https://developer.amazon.com/alexa/console/ask) to create the Alexa Multi-Capability Skill (MCS),
- the [AWS Lambda Console](https://console.aws.amazon.com/lambda) to create the skill's lambda function,
- the [Security Profile Management Console](https://developer.amazon.com/settings/console/securityprofile/overview.html) to create the security profile for the skill's account linking, and
- the [DynamoDB Dashboard](https://console.aws.amazon.com/dynamodbv2) to create the database for the skill's email address to bridge configuration mapping.

When you create them,

- name the skill "For LG webOS TV",
- name the lambda function "ForLGwebOSTV",
- name the security profile "For LG webOS TV", and
- name the DynamoDB table "ForLGwebOSTV" and the name the corresponding Global Secondary Index 'skillToken_index'

The source code includes [the Custom Skill's interaction model](../src/skill/lib/custom-skill/interaction-model.json). If you paste this into the "JSON Editor" window under the skill's build tab, then the Custom Skill's configuration will be complete. After that, set up account linking and the skill will be complete.

The DynamoDB table has the fields: email, hostname, bridgeToken and skillToken. The email field is the key field. There is no sort field. In addition, the DynamoDB table has a corresponding Global Secondary Index (GSI) named 'skillToken_index'. The skillToken field is the index field. The GSI includes all fields from the table.

## Bridge Installation

The bridge has three interfaces: an HTTP interface for communication with the Alexa skill, an SSDP/SSAP interface for communication with the LG webOS television(s), and a filesystem interface for storing a retrieving persistent configuration.

While there is no reason to expect that the bridge won't run in a Node.js environment new than version v20.x, versions other than v20.x have not been tested. While there is no reason to expect that the bridge won't run on non-Linux operating systems, operating systems other than Linux (specifically a [Synology NAS DSM](https://www.synology.com/en-global)) have not been tested.

Because the Alexa skill communicates with the bridge's HTTP interface, the bridge's HTTP interface must be accessible from the internet. While the bridge does not support HTTPS, the Alexa skill expects HTTPS. One way to meet this requirement is to run the bridge behind a [NGINX](https://www.nginx.com) web server acting as a [reverse proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/).

The Alexa skill expects the HTTPS interface to be listening on port 25392. The bridge expects the reverse proxy to forward the HTTP traffic to port 25391.

The Alexa skill must be able to validate the TLS certificate as well as be able to extract from the certificate the web server's Fully Qualified Domain Name (FQDN). Services such as [no-ip](https://www.noip.com) provide free FQDNs that will point to a dynamically assigned IP address. Services such as [Let's Encrypt](https://letsencrypt.org) provide free TLS certificates.

Because LG webOS televisions advertise their capabilities using the Simple Service Discovery Protocol (SSDP), the bridge listens on port 1900 for SSDP messages. There is [SSDP DDoS attack](https://www.cisa.gov/news-events/alerts/2014/01/17/udp-based-amplification-attacks). Therefore, be sure that none of the SSDP ports, including 1900, are accessible from the internet.

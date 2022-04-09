# Introduction
alexa-for-lg-webos-tv enables the control of LG Electronics televisions that run webOS but do not have built-in Alexa support. There are two parts to the software: an Alexa skill and a bridge. The Alexa skill presents one or more TVs each with controls relevant to the television the skill is controlling. The bridge converts between between the Alexa skill and LG webOS TV.

Both the skill and the bridge are written in [TypeScript](https://www.typescriptlang.org) and run in a [Node.js](https://nodejs.org) version v14.x environment.
### The Bridge
The bridge has three interfaces: an HTTP interface for communication with the Alexa skill, a websocket interface for communication with the LG webOS television(s), and a filesystem interface for storing a retrieving persistent configuration.

While there is no reason to expect that the bridge won't run in a Node.js environment newer than version v14.x, versions other than v14.x have not been tested. While there is no reason to expect that the bridge won't run on non-Linux operating systems, operating systems other than Linux (specifically a [Synology NAS](https://www.synology.com/en-global)) have not been tested.

Because the Alexa skill communicates with the bridge's HTTP interface, the bridge's HTTP interface must be accessible from the internet. While the bridge does not support HTTPS, the Alexa skill expects HTTPS. One way to meet this requirement is to run the bridge behind a [NGINX](https://www.nginx.com) web server acting as a [reverse proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/).

The Alexa skill expects the HTTPS interface to be listening on port 25392. The bridge expects the reverse proxy to forward the HTTP traffic to port 25391.

The Alexa skill must be able to validate the TLS certificate as well as be able to extract from the certificate the web server's Fully Qualified Domain Name (FQDN). Services such as [no-ip](https://www.noip.com) provide free FQDNs that will point to a dynamically assigned IP address. Services such as [Let's Encrypt](https://letsencrypt.org) provide free TLS certificates.

Because LG webOS televisions advertise their capabilities using the Simple Service Discovery Protocol (SSDP), the bridge listens on port 1900 for SSDP messages. There is [SSDP DDoS attack](https://www.ncsc.gov.ie/emailsfrom/DDoS/SSDP/). Therefore, be sure that none of the SSDP ports, including 1900, are not accessible from the internet.
## The Alexa Skill
The Alexa skill 
# Operation

After setting up the skill and the bridge, you must link the skill to your Amazon account and configure the skill with the bridge's hostname and bearer token.

If the skill was set up correctly, then you will be asked to let Alexa have access to your email address. It needs your email address for two reasons.

First, your email address enables one hand to see what the other hand is doing. The skill is a Multi-Capability Skill (MCS) consisting of a Custom Skill (CS) and a Smart Home Skill (SH). The CS is responsible for acquiring your bridge's hostname and bearer token. However, it's the SHS that needs your bridge's hostname and bearer token so it can use the bridge to control your TV. Your email address is the only piece of information the CS and SHS have in common. So it is your email address that enables the CS to share your bridge's hostname and bearer token with the SHS.

Second, your email address enables you to limit who connects to your bridge. You configure your bridge with a list of email addresses that it will allow to connect. After that, your bridge will refuse connections from email addresses not in the list.

Once you have linked your Amazon account to the skill, you can configure your bridge's hostname and bearer token. You can configure it using an utterance similar to

`Alexa, ask LGTV to set my bridge's IP address to AAA dot BBB dot CCC dot DDD`

where AAA, BBB, CCC and DDD are the first, second, third and fourth octets of your bridge's IPv4 address. Alternatively, you use can configure it using an utterance similar to

`Alexa, ask LGTV to configure my bridge`

and Alexa will prompt you for AAA, BBB, CCC and DDD. The skill relies on the bridge's IPv4 address rather than the bridge's hostname because Alexa regularly fails to spell uttered hostnames correctly. Once the skill has the bridge's address, the skill translates the address into the hostname by retrieving the TLS certificate from the provided address, extracting the hostnames from the TLS certificate and asking you which hostname is the bridge's hostname.

Once the skill has your bridge's hostname, it establishes the bearer token it will use to identify itself to the bridge. It starts by sending the bridge a digitally signed JSON Web Token (JWT) containing your email address. The bridge has the public key corresponding to the skill's private key, so the bridge can verify the JWT has come from the skill. If the JWT is authentic and contains an email address in the bridge's email address list, then the bridge sends the skill a bearer token to use for all future communications. If you don't know what a bearer token is, just think of it as a very long random password. If at any time you need to reestablish the bearer token, then you will need to go through the bridge setup process again.

Once you have configured your bridge's hostname and bearer token, you can run discovery and Alexa will find your LG webOS TVs.

If there is a problem with skill to bridge communication, you can test it using an utterance similar to

`test my bridge`

The skill will test he connection and provide you debug information.

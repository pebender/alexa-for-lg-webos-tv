# Operation

After setting up the skill and the bridge, you must link the skill to your Amazon account and configure the skill with the bridge's hostname.

If the skill was set up correctly, then you will be asked to let Alexa have access to your email address. Your email address enables you to easily limit who connects to your bridge. You configure your bridge with a list of email addresses that it will allow to connect. After that, your bridge will refuse connections from email addresses not in the list.

Once you have linked your Amazon account to the skill, you can configure your bridge's hostname. You can configure it using an utterance similar to

`Alexa, ask LGTV to set my bridge's IP address to AAA dot BBB dot CCC dot DDD`

where AAA, BBB, CCC and DDD are the first, second, third and fourth octets of your bridge's IPv4 address. Alternatively, you use can configure it using an utterance similar to

`Alexa, ask LGTV to configure my bridge`

and Alexa will prompt you for AAA, BBB, CCC and DDD. The skill relies on the bridge's IPv4 address rather than the bridge's hostname because Alexa regularly fails to spell uttered hostnames correctly. Once the skill has the bridge's address, the skill translates the address into the hostname by retrieving the TLS certificate from the provided address, extracting the hostnames from the TLS certificate and asking you which hostname is the bridge's hostname.

Once the skill has your bridge's hostname, it establishes security credentials with your bridge.

Once you have configured your bridge's hostname, you can run discovery and Alexa will find your LG webOS TVs.

If there is a problem with skill to bridge communication, you can test it using an utterance similar to

`test my bridge`

The skill will test he connection and provide you debug information.

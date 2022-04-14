# Operation

After setting up the skill and the bridge, you must link the skill to your Amazon account and configure the skill with the bridge's hostname.
You can configure the bridge's hostname by uttering:

`Alexa, ask LGTV to set my bridge's address to AAA dot BBB dot CCC dot DDD`

where AAA, BBB, CCC and DDD are the first, second, third and fourth octets of your bridge's IPv4 address.
The bridge's hostname is configured by providing its address because Alexa regularly fails to spell uttered hostnames correctly.
The skill is in the development phase.
As a result, you will need to be familiar with skill development to use it.

Once you have configured your bridge's hostname, you can run discover and Alexa will find your LG webOS TVs.

Both the skill and the bridge are written in [TypeScript](https://www.typescriptlang.org) and run in a [Node.js](https://nodejs.org) version v14.x environment.

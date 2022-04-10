export const constants = {
  application: {
    // The individual / company responsible for the skill and bridge software..
    vendor: 'Back in Thirty',
    // The name of the skill and bridge. 'LG webOS TV' is a reasonably descriptive name.
    // It is prefaced with 'For' to comply with Amazon's requirement that skills containing
    // company/product names not misrepresent themselves as being official skills.
    name: {
      // A version of the name that is safe to use for things such as directory names.
      // Use of special characters or whitespace might cause unexpected behavior..
      safe: 'ForLGwebOSTV',
      // A version of the name that is displayed to the user.
      pretty: 'For LG webOS TV'
    }
  },
  // Parameters the skill users when communicating with the bridge.
  bridge: {
    // The hostname that the skill uses to locate and communicate with the bridge.
    hostname: 'home.backinthirty.net',
    // The username the bridge uses when authenticating communications from the skill.
    username: 'LGTV',
    // The password the bridge uses when authenticating communications from the skill.
    // You should change the password. To generate a random, 128-character password,
    // you can use the command:
    //   openssl rand -base64 256 | head -c 128 -
    password: '3ke+jTULj8w2CezBWFAKc51itIKcUd1CZM6xvqart6yZ+W6Wgx7lKgeyBS+pyegShbW2rU6KiQ55hr3E1mBEeiHeMDdzG2W0quGymhFPHy5TX3J+P2//GfQbRFnBCrmW'
  }
}

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
  user: {
    // List of valid email addresses. These email address is the email address associated with your Amazon account.
    emails: [
      'pebender@gmail.com'
    ]
  }
}

export const constants = {
  application: {
    // The individual / company responsible for the skill and bridge software..
    vendor: 'Back in Thirty',
    // The name of the skill and bridge. 'LG webOS TV' is a reasonably descriptive name.
    // It is prefaced with 'For' to comply with Amazon's requirement that skills containing
    // company/product names not misrepresent themselves as being official skills.
    name: {
      // A version of the name that is safe to use for things such as directory and database names.
      // Use of special characters or whitespace might cause unexpected behavior.
      //
      safe: 'ForLGwebOSTV',
      // A version of the name that is displayed to the user.
      pretty: 'For LG webOS TV'
    }
  },
  bridge: {
    path: {
      // The POST UR
      base: '/ForLGwebOSTV',
      // The HTTP PATH for Alexa Smart Home (ASH) skill messages is `${base}/${relativeASH}`.
      // The HTTP PATH for ASH skill messages must not be a substring of the HTTP PATH for log messages.
      relativeASH: 'ASH',
      // The HTTP PATH for log messages is `${base}/$relativeLog}`
      // The HTTP PATH for log messages must not be a substring of the HTTP PATH for ASH skill messages.
      relativeLog: 'LOG'
    }
  }
}

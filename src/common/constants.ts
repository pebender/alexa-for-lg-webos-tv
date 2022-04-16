const applicationNamePretty = 'For LG webOS TV'
const applicationNameSafe = 'ForLGwebOSTV'

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
      safe: applicationNameSafe,
      // A version of the name that is displayed to the user.
      pretty: applicationNamePretty
    }
  },
  aws: {
    // The skill, the skill's lamba function and skill's dynamoDB must be in the same region.
    region: 'us-east-1',
    dynamoDB: {
      tableName: applicationNameSafe,
      indexName: 'ashToken_index'
    }
  },
  bridge: {
    port: {
      http: 25391,
      https: 25392
    },
    path: `/${applicationNameSafe}`
  }
}

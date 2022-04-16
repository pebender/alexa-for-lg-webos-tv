import * as ASH from '../../../common/alexa'
import * as Bridge from '../bridge-api'

async function handler (alexaRequest: ASH.Request): Promise<ASH.Response> {
  return await Bridge.sendSkillDirective(alexaRequest)
}

export { handler }

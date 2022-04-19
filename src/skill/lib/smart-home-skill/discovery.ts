import * as ASH from '../../../common/smart-home-skill'
import * as Bridge from './bridge-api'

async function handler (alexaRequest: ASH.AlexaRequest): Promise<ASH.AlexaResponse> {
  return await Bridge.sendSkillDirective(alexaRequest)
}

export { handler }

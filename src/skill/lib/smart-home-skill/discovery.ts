import * as Common from '../../../common'
import * as Bridge from './bridge-api'

async function handler (alexaRequest: Common.SHS.AlexaRequest): Promise<Common.SHS.AlexaResponse> {
  return await Bridge.sendSkillDirective(alexaRequest)
}

export { handler }

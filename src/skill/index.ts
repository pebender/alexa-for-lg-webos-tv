import * as ASKModel from 'ask-sdk-model'
import * as AWSLambda from 'aws-lambda'
import * as Common from '../common'
import { handler as customSkillHandler } from './lib/custom-skill'
import { handler as smartHomeSkillHandler } from './lib/smart-home-skill'

async function skillHandler (request: ASKModel.RequestEnvelope | Common.SHS.AlexaRequest, context: ASKModel.Context | AWSLambda.Context): Promise<ASKModel.ResponseEnvelope | Common.SHS.AlexaResponse> {
  Common.Debug.debugJSON(request)
  let response: ASKModel.ResponseEnvelope | Common.SHS.AlexaResponse
  if ('session' in request) {
    response = await customSkillHandler((request as ASKModel.RequestEnvelope), (context as ASKModel.Context))
    Common.Debug.debugJSON(response)

    return response
  }

  if ('directive' in request) {
    response = await smartHomeSkillHandler((request as Common.SHS.AlexaRequest), (context as AWSLambda.Context))
    Common.Debug.debugJSON(response)

    return response
  }

  throw new Error('Unhandled request')
}

export { skillHandler as handler }

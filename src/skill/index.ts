import * as ASKModel from 'ask-sdk-model'
import * as ASH from '../common/smart-home-skill'
import * as AWSLambda from 'aws-lambda'
import { handler as customSkillHandler } from './lib/custom-skill'
import { handler as smartHomeSkillHandler } from './lib/smart-home-skill'
import * as Debug from './../common/debug'

async function skillHandler (request: ASKModel.RequestEnvelope | ASH.AlexaRequest, context: ASKModel.Context | AWSLambda.Context): Promise<ASKModel.ResponseEnvelope | ASH.AlexaResponse> {
  Debug.debugJSON(request)
  let response: ASKModel.ResponseEnvelope | ASH.AlexaResponse
  if ('session' in request) {
    response = await customSkillHandler((request as ASKModel.RequestEnvelope), (context as ASKModel.Context))
    Debug.debugJSON(response)

    return response
  }

  if ('directive' in request) {
    response = await smartHomeSkillHandler((request as ASH.AlexaRequest), (context as AWSLambda.Context))
    Debug.debugJSON(response)

    return response
  }

  throw new Error('Unhandled request')
}

export { skillHandler as handler }

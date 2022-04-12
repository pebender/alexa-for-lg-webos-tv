import * as ASKModel from 'ask-sdk-model'
import * as ASH from '../common/alexa'
import * as AWSLambda from 'aws-lambda'
import { handler as customSkillHandler } from './lib/custom'
import { handler as smartHomeSkillHandler } from './lib/smart-home'

async function skillHandler (request: ASKModel.RequestEnvelope | ASH.Request, context: ASKModel.Context | AWSLambda.Context): Promise<ASKModel.ResponseEnvelope | ASH.Response> {
  let response: ASKModel.ResponseEnvelope | ASH.Response
  if ('session' in request) {
    response = await customSkillHandler((request as ASKModel.RequestEnvelope), (context as ASKModel.Context))

    return response
  }

  if ('directive' in request) {
    response = await smartHomeSkillHandler((request as ASH.Request), (context as AWSLambda.Context))

    return response
  }

  throw new Error('Unhandled request')
}

export { skillHandler as handler }

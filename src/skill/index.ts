import * as ASH from '../common/alexa'
import * as AWSLambda from 'aws-lambda'
import { handler as smartHomeSkillHandler } from './lib/smart-home-skill'

async function skillHandler (request: ASH.Request, context: AWSLambda.Context): Promise<ASH.Response> {
  let response: ASH.Response
  if ('directive' in request) {
    response = await smartHomeSkillHandler((request as ASH.Request), (context as AWSLambda.Context))

    return response
  }

  throw new Error('Unhandled request')
}

export { skillHandler as handler }

import { constants } from '../../../common/constants'
import * as ASKCore from 'ask-sdk-core'
import * as ASKModel from 'ask-sdk-model'
import { DynamoDB } from 'aws-sdk'
import * as https from 'https'
import tls from 'tls'
const certnames = require('certnames')

async function getUserEmail (bearerToken: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      hostname: 'api.amazonalexa.com',
      path: '/v2/accounts/~current/settings/Profile.email',
      headers: {
        Authorization: `Bearer ${bearerToken}`
      }
    }
    const req = https.request(options, (response) => {
      let returnData = ''

      response.on('data', (chunk) => {
        returnData += chunk
      })

      response.on('end', () => {
        resolve(JSON.parse(returnData))
      })

      response.on('error', (error) => {
        reject(error)
      })
    })
    req.end()
  })
}

const SetHostnameIntentHandler = {
  canHandle (handlerInput: ASKCore.HandlerInput): boolean {
    return ASKCore.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
        ASKCore.getIntentName(handlerInput.requestEnvelope) === 'LGTV_SetHostnameIntent'
  },
  async handle (handlerInput: ASKCore.HandlerInput): Promise<ASKModel.Response> {
    function getHostnames (ipAddress: string, ipPort: number): Promise<string[]> {
      return new Promise((resolve, reject): void => {
        const sock = tls.connect(ipPort, ipAddress, { rejectUnauthorized: false })
        sock.on('secureConnect', (): void => {
          const cert = sock.getPeerCertificate().raw
          sock.on('close', (): void => {
            const hostnames = certnames.getCommonNames(cert)
            return resolve(hostnames)
          })
          sock.end()
        })
        sock.on('error', (error): void => {
          reject(error)
        })
      })
    }
    console.log(JSON.stringify(handlerInput.requestEnvelope))

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()

    if (typeof handlerInput.requestEnvelope.request === 'undefined') {
      const errorMessage = 'LGTV_SetHostnameIntent: invalid code path: request undefined'
      console.log(errorMessage)
      throw new Error(errorMessage)
    }

    const intentRequest = (handlerInput.requestEnvelope.request as ASKModel.IntentRequest)

    if (typeof intentRequest.intent.slots === 'undefined') {
      const errorMessage = 'LGTV_SetHostnameIntent: invalid code path: intents has no slots'
      console.log(errorMessage)
      throw new Error(errorMessage)
    }

    if ((typeof intentRequest.intent.slots.ipAddressValid === 'undefined') ||
        (typeof intentRequest.intent.slots.ipAddressA === 'undefined') ||
        (typeof intentRequest.intent.slots.ipAddressB === 'undefined') ||
        (typeof intentRequest.intent.slots.ipAddressC === 'undefined') ||
        (typeof intentRequest.intent.slots.ipAddressD === 'undefined') ||
        (typeof intentRequest.intent.slots.hostnameIndex === 'undefined')) {
      const errorMessage = 'LGTV_SetHostnameIntent: invalid code path: missing slot(s)'
      console.log(errorMessage)
      throw new Error(errorMessage)
    }

    const dialogState: ASKModel.DialogState = ASKCore.getDialogState(handlerInput.requestEnvelope)
    console.log(`dialogState: ${dialogState}`)

    const ipAddressValidString: String | undefined = ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressValid')
    const ipAddressAString: String | undefined = ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressA')
    const ipAddressBString: String | undefined = ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressB')
    const ipAddressCString: String | undefined = ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressC')
    const ipAddressDString: String | undefined = ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressD')
    const hostnameIndexString: String | undefined = ASKCore.getSlotValue(handlerInput.requestEnvelope, 'hostnameIndex')
    console.log(`(dirty) set: ${ipAddressValidString}, address: ${ipAddressAString}.${ipAddressBString}.${ipAddressCString}.${ipAddressDString}, hostnameIndex: ${hostnameIndexString}`)

    const ipAddressA: Number = Number(ipAddressAString)
    const ipAddressB: Number = Number(ipAddressBString)
    const ipAddressC: Number = Number(ipAddressCString)
    const ipAddressD: Number = Number(ipAddressDString)
    const hostnameIndex: Number = Number(hostnameIndexString)
    const ipAddressValid: Boolean = (typeof ipAddressValidString !== 'undefined') && (ipAddressValidString.toLowerCase() === 'yes')

    console.log(`(clean) set: ${ipAddressValid}, address: ${ipAddressA}.${ipAddressB}.${ipAddressC}.${ipAddressD}, hostnameIndex: ${hostnameIndex}`)

    if (dialogState === 'STARTED') {
      Reflect.deleteProperty(sessionAttributes, 'ipAddress')
      Reflect.deleteProperty(sessionAttributes, 'hostnames')
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes)
    }

    if ((dialogState === 'STARTED') || (dialogState === 'IN_PROGRESS')) {
      if ((dialogState === 'STARTED') &&
          (typeof ipAddressAString === 'undefined') &&
          (typeof ipAddressBString === 'undefined') &&
          (typeof ipAddressCString === 'undefined') &&
          (typeof ipAddressDString === 'undefined')) {
        return handlerInput.responseBuilder
          .addDelegateDirective()
          .getResponse()
      }

      if ((typeof ipAddressAString === 'undefined') ||
          (typeof ipAddressBString === 'undefined') ||
          (typeof ipAddressCString === 'undefined') ||
          (typeof ipAddressDString === 'undefined')) {
        const cardTitle = `${constants.application.name.pretty} Error`
        const cardContent = 'I heard the I.P. Address: ' +
                            `${ipAddressAString}.${ipAddressBString}.${ipAddressBString}.${ipAddressBString}`
        const speechOutput = 'I missed some of the numbers in the I.P. address. ' +
                             'An I.P. address is four numbers separated from each other by the word \'dot\'. '
        const reprompt = 'Please tell me your bridge\'s I.P. address again.'
        return handlerInput.responseBuilder
          .addElicitSlotDirective('ipAddressValid')
          .speak(speechOutput)
          .reprompt(reprompt)
          .withSimpleCard(cardTitle, cardContent)
          .getResponse()
      }

      if (((!Number.isInteger(ipAddressA)) || (ipAddressA < 0) || (ipAddressA > 255)) ||
          ((!Number.isInteger(ipAddressB)) || (ipAddressB < 0) || (ipAddressB > 255)) ||
          ((!Number.isInteger(ipAddressC)) || (ipAddressC < 0) || (ipAddressC > 255)) ||
          ((!Number.isInteger(ipAddressD)) || (ipAddressD < 0) || (ipAddressD > 255))) {
        const cardTitle = `${constants.application.name.pretty} Error`
        const cardContent = 'I heard the I.P. Address: ' +
                            `${ipAddressAString}.${ipAddressBString}.${ipAddressBString}.${ipAddressBString}`
        const speechOutput = 'There is a problem with some numbers in the I.P. addresses. ' +
                             'The numbers must be integers between 0 and 255. '
        const reprompt = 'Please tell me your bridge\'s I.P. address again.'
        return handlerInput.responseBuilder
          .addElicitSlotDirective('ipAddressValid')
          .speak(speechOutput)
          .reprompt(reprompt)
          .withSimpleCard(cardTitle, cardContent)
          .getResponse()
      }

      intentRequest.intent.slots.ipAddressValid.value = 'yes'

      if (typeof hostnameIndexString === 'undefined') {
        sessionAttributes.ipAddress = `${ipAddressA}.${ipAddressB}.${ipAddressC}.${ipAddressD}`
        Reflect.deleteProperty(sessionAttributes, 'hostnames')
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes)
        console.log(`LGTV_SetHostnameIntent: IPv4 address is ${sessionAttributes.hostname}`)
        try {
          sessionAttributes.hostnames = await getHostnames(sessionAttributes.ipAddress, 25392)
        } catch (error) {
          console.log(`LGTV_SetHostnameIntent: cannot connect to IPv4 address '${sessionAttributes.ipAddress}'`)
          if (error instanceof Error) {
            const cardTitle = `${constants.application.name.pretty} Error`
            const cardContent = 'I heard the I.P. Address: ' +
                                `${ipAddressAString}.${ipAddressBString}.${ipAddressBString}.${ipAddressBString}`
            const speechOutput = 'I had a problem connecting to the I.P. address. ' +
                                 'A card in the ASK App shows more.'
            return handlerInput.responseBuilder
              .withSimpleCard(cardTitle, cardContent)
              .speak(speechOutput)
              .getResponse()
          } else {
            const cardTitle = `${constants.application.name.pretty} Error`
            const cardContent = 'Unknown: Unknown'
            const speechOutput = 'I had a problem connecting to the I.P. address.' +
                                 'A card in the Alexa App shows more.'
            return handlerInput.responseBuilder
              .withSimpleCard(cardTitle, cardContent)
              .speak(speechOutput)
              .getResponse()
          }
        }
        console.log(`LGTV_SetHostnameIntent: bridge FQDNs: ${sessionAttributes.hostnames}`)
        const cardTitle = 'Bridge  Hostname Configuration'
        let cardContent: string = ''
        let index = 0
        while (index < sessionAttributes.hostnames.length) {
          cardContent += `${index}: ${sessionAttributes.hostnames[index]}\n`
          index += 1
        }
        cardContent += `\n${index}: My bridge is not in the list of hostnames.`
        index += 1
        cardContent += `\n${index}: My IP address is not '${sessionAttributes.ipAddress}'.`
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes)
        console.log(`LGTV_SetHostnameIntent: bridge FQDN prompt: ${cardContent}`)
        const speechOutput = 'Thank you. ' +
            'Now, could you look at the card in your Alexa App and ' +
            'tell me the number next to your bridge\'s hostname?'
        return handlerInput.responseBuilder
          .speak(speechOutput)
          .withSimpleCard(cardTitle, cardContent)
          .addElicitSlotDirective('hostnameIndex')
          .getResponse()
      }

      const hostnameIndex: Number = Number(hostnameIndexString)

      if ((!Number.isInteger(hostnameIndex)) ||
          (hostnameIndex >= sessionAttributes.hostnames.length + 2) ||
          (hostnameIndex < 0)) {
        const speechOutput = 'I think I misheard you. ' +
                             `I heard ${hostnameIndexString}, which is not an index on the card.`
        const reprompt = ' Could you repeat your index?'
        return handlerInput.responseBuilder
          .speak(speechOutput)
          .reprompt(reprompt)
          .addElicitSlotDirective('hostnameIndex')
          .getResponse()
      }
      if (hostnameIndex === (sessionAttributes.hostnames.length + 1)) {
        return handlerInput.responseBuilder
          .speak('I\'m sorry I misheard your bridge\'s I.P. address.' +
                          'Maybe we could try again.')
          .getResponse()
      }
      if (hostnameIndex === sessionAttributes.hostnames.length) {
        return handlerInput.responseBuilder
          .speak('I\'m sorry I could not discover your bridge\'s hostname.')
          .getResponse()
      }
      if ((handlerInput.requestEnvelope.request as ASKModel.IntentRequest).intent.confirmationStatus === 'NONE') {
        return handlerInput.responseBuilder
          .speak(`Is your hostname ${sessionAttributes.hostnames[ASKCore.getSlotValue(handlerInput.requestEnvelope, 'hostnameIndex')]}?`)
          .addConfirmIntentDirective()
          .getResponse()
      }
    }

    if (ASKCore.getDialogState(handlerInput.requestEnvelope) === 'COMPLETED') {
      if (intentRequest.intent.confirmationStatus === 'CONFIRMED') {
        const apiAccessToken = ASKCore.getApiAccessToken(handlerInput.requestEnvelope)
        console.log(`apiAccessToken: ${apiAccessToken}`)
        const email = await getUserEmail(apiAccessToken)
        console.log(`email: ${JSON.stringify(email, null, 2)}`)
        const hostname = sessionAttributes.hostnames[ASKCore.getSlotValue(handlerInput.requestEnvelope, 'hostnameIndex') as string]
        const dynamoDBDocumentClient = new DynamoDB.DocumentClient({ region: constants.aws.region })
        const hostnameUpdateParams = {
          TableName: constants.aws.dynamoDB.tableName,
          Key: { email },
          UpdateExpression: 'set hostname = :newHostname',
          ExpressionAttributeValues: { ':newHostname': hostname }
        }
        try {
          await dynamoDBDocumentClient.update(hostnameUpdateParams).promise()
          console.log('success')
        } catch (error) {
          let message: string = 'Unknown'
          if (error instanceof Error) {
            message = `${error.name} - ${error.message}`
          } else {
            if ('code' in (error as any)) {
              message = (error as any).code
            }
          }
          console.log(`LGTV_SetHostnameIntent Error: update hostname: ${message}`)
        }

        Reflect.deleteProperty(sessionAttributes, 'ipAddress')
        Reflect.deleteProperty(sessionAttributes, 'hostnames')
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes)
        return handlerInput.responseBuilder
          .speak('Your bridge\'s hostname has been set.')
          .getResponse()
      } else if ((handlerInput.requestEnvelope.request as ASKModel.IntentRequest).intent.confirmationStatus === 'DENIED') {
        Reflect.deleteProperty(sessionAttributes, 'ipAddress')
        Reflect.deleteProperty(sessionAttributes, 'hostnames')
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes)
        return handlerInput.responseBuilder
          .speak('Your bridge\'s hostname has not been set.')
          .getResponse()
      }
      return handlerInput.responseBuilder
        .addDelegateDirective(intentRequest.intent)
        .getResponse()
    }
    return handlerInput.responseBuilder
      .addDelegateDirective(intentRequest.intent)
      .getResponse()
  }
}

const handlers = [
  SetHostnameIntentHandler
]

export { handlers }

import * as Common from '../../../common'
import { HandlerInput as ASKHandlerInput } from 'ask-sdk-core/dist/dispatcher/request/handler/HandlerInput'
import * as ASKRequestEnvelope from 'ask-sdk-core/dist/util/RequestEnvelopeUtils'
import * as ASKModel from 'ask-sdk-model'
import * as Database from '../database'
import tls from 'tls'
const certnames = require('certnames')

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

const SetHostnameIntentHandler = {
  canHandle (handlerInput: ASKHandlerInput): boolean {
    return ASKRequestEnvelope.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
        ASKRequestEnvelope.getIntentName(handlerInput.requestEnvelope) === 'LGTV_SetHostnameIntent'
  },
  async handle (handlerInput: ASKHandlerInput): Promise<ASKModel.Response> {
    Common.Debug.debugJSON(handlerInput.requestEnvelope)

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()

    if (typeof handlerInput.requestEnvelope.request === 'undefined') {
      const errorMessage = 'LGTV_SetHostnameIntent: invalid code path: request undefined'
      const error = new Error(errorMessage)
      Common.Debug.debugErrorWithStack(error)
      throw error
    }

    const intentRequest = (handlerInput.requestEnvelope.request as ASKModel.IntentRequest)

    if (typeof intentRequest.intent.slots === 'undefined') {
      const errorMessage = 'LGTV_SetHostnameIntent: invalid code path: intents has no slots'
      const error = new Error(errorMessage)
      Common.Debug.debugErrorWithStack(error)
      throw error
    }

    if ((typeof intentRequest.intent.slots.ipAddressValid === 'undefined') ||
        (typeof intentRequest.intent.slots.ipAddressA === 'undefined') ||
        (typeof intentRequest.intent.slots.ipAddressB === 'undefined') ||
        (typeof intentRequest.intent.slots.ipAddressC === 'undefined') ||
        (typeof intentRequest.intent.slots.ipAddressD === 'undefined') ||
        (typeof intentRequest.intent.slots.hostnameIndex === 'undefined')) {
      const errorMessage = 'LGTV_SetHostnameIntent: invalid code path: missing slot(s)'
      const error = new Error(errorMessage)
      Common.Debug.debugErrorWithStack(error)
      throw error
    }

    const dialogState: ASKModel.DialogState = ASKRequestEnvelope.getDialogState(handlerInput.requestEnvelope)
    Common.Debug.debug(`dialogState: ${dialogState}`)

    const ipAddressValidString: String | undefined = ASKRequestEnvelope.getSlotValue(handlerInput.requestEnvelope, 'ipAddressValid')
    const ipAddressAString: String | undefined = ASKRequestEnvelope.getSlotValue(handlerInput.requestEnvelope, 'ipAddressA')
    const ipAddressBString: String | undefined = ASKRequestEnvelope.getSlotValue(handlerInput.requestEnvelope, 'ipAddressB')
    const ipAddressCString: String | undefined = ASKRequestEnvelope.getSlotValue(handlerInput.requestEnvelope, 'ipAddressC')
    const ipAddressDString: String | undefined = ASKRequestEnvelope.getSlotValue(handlerInput.requestEnvelope, 'ipAddressD')
    const hostnameIndexString: String | undefined = ASKRequestEnvelope.getSlotValue(handlerInput.requestEnvelope, 'hostnameIndex')
    Common.Debug.debug(`(dirty) set: ${ipAddressValidString}, address: ${ipAddressAString}.${ipAddressBString}.${ipAddressCString}.${ipAddressDString}, hostnameIndex: ${hostnameIndexString}`)

    const ipAddressA: Number = Number(ipAddressAString)
    const ipAddressB: Number = Number(ipAddressBString)
    const ipAddressC: Number = Number(ipAddressCString)
    const ipAddressD: Number = Number(ipAddressDString)
    const hostnameIndex: Number = Number(hostnameIndexString)
    const ipAddressValid: Boolean = (typeof ipAddressValidString !== 'undefined') && (ipAddressValidString.toLowerCase() === 'yes')

    Common.Debug.debug(`(clean) set: ${ipAddressValid}, address: ${ipAddressA}.${ipAddressB}.${ipAddressC}.${ipAddressD}, hostnameIndex: ${hostnameIndex}`)

    if (dialogState === 'STARTED') {
      Reflect.deleteProperty(sessionAttributes, 'ipAddress')
      Reflect.deleteProperty(sessionAttributes, 'hostnames')
      Reflect.deleteProperty(sessionAttributes, 'hostnameIndex')
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
        const cardTitle = `${Common.constants.application.name.pretty} Error`
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
        const cardTitle = `${Common.constants.application.name.pretty} Error`
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
        Common.Debug.debug(`LGTV_SetHostnameIntent: IPv4 address is ${sessionAttributes.hostname}`)
        try {
          sessionAttributes.hostnames = await getHostnames(sessionAttributes.ipAddress, 25392)
        } catch (error) {
          Common.Debug.debug(`LGTV_SetHostnameIntent: cannot connect to IPv4 address '${sessionAttributes.ipAddress}'`)
          if (error instanceof Error) {
            const cardTitle = `${Common.constants.application.name.pretty} Error`
            const cardContent = 'I heard the I.P. Address: ' +
                                `${ipAddressAString}.${ipAddressBString}.${ipAddressBString}.${ipAddressBString}`
            const speechOutput = 'I had a problem connecting to the I.P. address. ' +
                                 'A card in the ASK App shows more.'
            return handlerInput.responseBuilder
              .withSimpleCard(cardTitle, cardContent)
              .speak(speechOutput)
              .getResponse()
          } else {
            const cardTitle = `${Common.constants.application.name.pretty} Error`
            const cardContent = 'Unknown: Unknown'
            const speechOutput = 'I had a problem connecting to the I.P. address.' +
                                 'A card in the Alexa App shows more.'
            return handlerInput.responseBuilder
              .withSimpleCard(cardTitle, cardContent)
              .speak(speechOutput)
              .getResponse()
          }
        }
        Common.Debug.debug(`LGTV_SetHostnameIntent: bridge FQDNs: ${sessionAttributes.hostnames}`)
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
        Common.Debug.debug(`LGTV_SetHostnameIntent: bridge FQDN prompt: ${cardContent}`)
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
          .speak(`Is your hostname ${sessionAttributes.hostnames[ASKRequestEnvelope.getSlotValue(handlerInput.requestEnvelope, 'hostnameIndex')]}?`)
          .addConfirmIntentDirective()
          .getResponse()
      }
    }

    if (ASKRequestEnvelope.getDialogState(handlerInput.requestEnvelope) === 'COMPLETED') {
      if (intentRequest.intent.confirmationStatus === 'CONFIRMED') {
        const apiEndpoint = handlerInput.requestEnvelope.context.System.apiEndpoint
        const apiAccessToken = handlerInput.requestEnvelope.context.System.apiAccessToken
        if (typeof apiAccessToken === 'undefined') {
          return handlerInput.responseBuilder
            .speak('An error occurred with account linking. Please re-link the skill and try again.')
            .withShouldEndSession(true)
            .getResponse()
        }
        Common.Debug.debug(`apiAccessToken: ${apiAccessToken}`)
        let email
        try {
          email = await Common.Profile.CS.getUserEmail(apiEndpoint, apiAccessToken)
          Common.Debug.debug(`LGTV_SetHostnameIntent: getUserEmail: success: email: ${email}`)
        } catch (error: any) {
          Common.Debug.debug(`LGTV_SetHostnameIntent: ${error.message}`)
          return handlerInput.responseBuilder
            .speak('Error encountered retrieving your user profile. Your bridge\'s hostname has not been set.')
            .withShouldEndSession(true)
            .getResponse()
        }
        const hostname = sessionAttributes.hostnames[ASKRequestEnvelope.getSlotValue(handlerInput.requestEnvelope, 'hostnameIndex') as string]
        try {
          await Database.setHostname(email, hostname)
          Common.Debug.debug('LGTV_SetHostnameIntent: setHostname: success')
        } catch (error) {
          Common.Debug.debug('LGTV_SetHostnameIntent setHostname: error:')
          Common.Debug.debugError(error)
          return handlerInput.responseBuilder
            .speak('Error encountered setting your bridge\'s hostname. Your bridge\'s hostname has not been set.')
            .withShouldEndSession(true)
            .getResponse()
        }

        Reflect.deleteProperty(sessionAttributes, 'ipAddress')
        Reflect.deleteProperty(sessionAttributes, 'hostnames')
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes)
        return handlerInput.responseBuilder
          .speak('Your bridge\'s hostname has been set.')
          .withShouldEndSession(true)
          .getResponse()
      } else if ((handlerInput.requestEnvelope.request as ASKModel.IntentRequest).intent.confirmationStatus === 'DENIED') {
        Reflect.deleteProperty(sessionAttributes, 'ipAddress')
        Reflect.deleteProperty(sessionAttributes, 'hostnames')
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes)
        return handlerInput.responseBuilder
          .speak('Your bridge\'s hostname has not been set.')
          .withShouldEndSession(true)
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
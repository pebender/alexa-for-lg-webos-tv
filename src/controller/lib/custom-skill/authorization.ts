// eslint-disable-next-line @typescript-eslint/no-var-requires
import * as ASKCore from 'ask-sdk-core'
import * as ASKModel from 'ask-sdk-model'
import { Gateway } from '../gateway-api'
import { constants } from '../../../common/constants'
import crypto from 'crypto'
import tls from 'tls'
const certnames = require('certnames')

const SetHostnameIntentHandler = {
  canHandle (handlerInput: ASKCore.HandlerInput): boolean {
    return ASKCore.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest' &&
        ASKCore.getIntentName(handlerInput.requestEnvelope) === 'Authorization_SetHostnameIntent'
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
      const errorMessage = 'Authorization_SetHostnameIntent: invalid code path: request undefined'
      console.log(errorMessage)
      throw new Error(errorMessage)
    }

    const intentRequest = (handlerInput.requestEnvelope.request as ASKModel.IntentRequest)

    if (typeof intentRequest.intent.slots === 'undefined') {
      const errorMessage = 'Authorization_SetHostnameIntent: invalid code path: intents has no slots'
      console.log(errorMessage)
      throw new Error(errorMessage)
    }

    if ((typeof intentRequest.intent.slots.ipAddressValid === 'undefined') ||
        (typeof intentRequest.intent.slots.ipAddressA === 'undefined') ||
        (typeof intentRequest.intent.slots.ipAddressB === 'undefined') ||
        (typeof intentRequest.intent.slots.ipAddressC === 'undefined') ||
        (typeof intentRequest.intent.slots.ipAddressD === 'undefined') ||
        (typeof intentRequest.intent.slots.hostnameIndex === 'undefined')) {
      const errorMessage = 'Authorization_SetHostnameIntent: invalid code path: missing slot(s)'
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
        const cardTitle = 'LG webOS TV Controller Error'
        const cardContent = 'I heard the I.P. Address: ' +
                            `${ipAddressAString}.${ipAddressBString}.${ipAddressBString}.${ipAddressBString}`
        const speechOutput = 'I missed some of the numbers in the I.P. address. ' +
                             'An I.P. address is four numbers separated from each other by the word \'dot\'. '
        const reprompt = 'Please tell me your gateway\'s I.P. address again.'
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
        const cardTitle = 'LG webOS TV Controller Error'
        const cardContent = 'I heard the I.P. Address: ' +
                            `${ipAddressAString}.${ipAddressBString}.${ipAddressBString}.${ipAddressBString}`
        const speechOutput = 'There is a problem with some numbers in the I.P. addresses. ' +
                             'The numbers must be integers between 0 and 255. '
        const reprompt = 'Please tell me your gateway\'s I.P. address again.'
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
        console.log(`Authorization_SetHostnameIntent: IPv4 address is ${sessionAttributes.hostname}`)
        try {
          sessionAttributes.hostnames = await getHostnames(sessionAttributes.ipAddress, 25392)
        } catch (error) {
          console.log(`Authorization_SetHostnameIntent: cannot connect to IPv4 address '${sessionAttributes.ipAddress}'`)
          if (error instanceof Error) {
            const cardTitle = 'LG webOS TV Controller Error'
            const cardContent = 'I heard the I.P. Address: ' +
                                `${ipAddressAString}.${ipAddressBString}.${ipAddressBString}.${ipAddressBString}`
            const speechOutput = 'I had a problem connecting to the I.P. address. ' +
                                 'A card in the ASK App shows more.'
            return handlerInput.responseBuilder
              .withSimpleCard(cardTitle, cardContent)
              .speak(speechOutput)
              .getResponse()
          } else {
            const cardTitle = 'LG webOS TV Controller Error'
            const cardContent = 'Unknown: Unknown'
            const speechOutput = 'I had a problem connecting to the I.P. address.' +
                                 'A card in the Alexa App shows more.'
            return handlerInput.responseBuilder
              .withSimpleCard(cardTitle, cardContent)
              .speak(speechOutput)
              .getResponse()
          }
        }
        console.log(`Authorization_SetHostnameIntent: gateway FQDNs: ${sessionAttributes.hostnames}`)
        const cardTitle = 'Gateway Hostname Configuration'
        let cardContent: string = ''
        let index = 0
        while (index < sessionAttributes.hostnames.length) {
          cardContent += `${index}: ${sessionAttributes.hostnames[index]}\n`
          index += 1
        }
        cardContent += `\n${index}: My gateway is not in the list of hostnames.`
        index += 1
        cardContent += `\n${index}: My IP address is not '${sessionAttributes.ipAddress}'.`
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes)
        console.log(`Authorization_SetHostnameIntent: gateway FQDN prompt: ${cardContent}`)
        const speechOutput = 'Thank you. ' +
            'Now, could you look at the card in your Alexa App and ' +
            'tell me the number next to your gateway\'s hostname?'
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
          .speak('I\'m sorry I misheard your gateway\'s I.P. address.' +
                          'Maybe we could try again.')
          .getResponse()
      }
      if (hostnameIndex === sessionAttributes.hostnames.length) {
        return handlerInput.responseBuilder
          .speak('I\'m sorry I could not discover your gateway\'s hostname.')
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
        let persistentAttributes: {
          hostname?: string;
        } = {}
        try {
          persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes()
        } catch (error) {
          if (error instanceof Error) {
            return handlerInput.responseBuilder
              .speak('I had a problem and we will have to start over.' +
                              ' A card in the Alexa App shows more.')
              .withSimpleCard('Error', `${error.name}: ${error.message}`)
              .getResponse()
          } else {
            return handlerInput.responseBuilder
              .speak('I had a problem and we will have to start over.' +
                              ' A card in the Alexa App shows more.')
              .withSimpleCard('Error', 'Unknown: Unknown')
              .getResponse()
          }
        }
        Reflect.deleteProperty(persistentAttributes, 'hostname')
        Reflect.deleteProperty(persistentAttributes, 'password')
        Reflect.deleteProperty(persistentAttributes, 'tvmap')
        persistentAttributes.hostname = sessionAttributes.hostnames[ASKCore.getSlotValue(handlerInput.requestEnvelope, 'hostnameIndex') as string]
        try {
          await handlerInput.attributesManager.savePersistentAttributes()
        } catch (error) {
          if (error instanceof Error) {
            return handlerInput.responseBuilder
              .speak('I had a problem and we will have to start over.' +
                              ' A card in the Alexa App shows more.')
              .withSimpleCard('Error', `${error.name}: ${error.message}`)
              .getResponse()
          } else {
            return handlerInput.responseBuilder
              .speak('I had a problem and we will have to start over.' +
                              ' A card in the Alexa App shows more.')
              .withSimpleCard('Error', 'Unknown: Unknown')
              .getResponse()
          }
        }
        Reflect.deleteProperty(sessionAttributes, 'ipAddress')
        Reflect.deleteProperty(sessionAttributes, 'hostnames')
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes)
        return handlerInput.responseBuilder
          .speak('Your gateway\'s hostname has been set.')
          .getResponse()
      } else if ((handlerInput.requestEnvelope.request as ASKModel.IntentRequest).intent.confirmationStatus === 'DENIED') {
        Reflect.deleteProperty(sessionAttributes, 'ipAddress')
        Reflect.deleteProperty(sessionAttributes, 'hostnames')
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes)
        return handlerInput.responseBuilder
          .speak('Your gateway\'s hostname has not been set.')
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
const SetPasswordIntentHandler = {
  canHandle (handlerInput: ASKCore.HandlerInput): boolean {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name === 'Authorization_SetPasswordIntent'
  },
  async handle (handlerInput: ASKCore.HandlerInput): Promise<ASKModel.Response> {
    let persistentAttributes: {
      hostname?: string;
      password?: string;
    } = {}
    persistentAttributes = await handlerInput.attributesManager.getPersistentAttributes()
    if (typeof persistentAttributes.hostname === 'undefined') {
      return handlerInput.responseBuilder
        .speak('You need to set your gateway\'s hostname before you can set its password.')
        .getResponse()
    }
    const password = crypto.randomBytes(64).toString('hex')
    try {
      try {
        const options = {
          hostname: persistentAttributes.hostname,
          path: '/HTTP',
          username: 'HTTP',
          password: constants.gatewayRootPassword
        }
        const request = {
          command: {
            name: 'passwordSet',
            value: password
          }
        }
        const gateway = new Gateway('')
        await gateway.send(options, request)
      } catch (error) {
        if (error instanceof Error) {
          return handlerInput.responseBuilder
            .speak('I had a problem talking with the gateway. The Alexa App will show you more.')
            .withSimpleCard('Gateway Communication Error', `${error.name}; ${error.message}`)
            .getResponse()
        } else {
          return handlerInput.responseBuilder
            .speak('I had a problem talking with the gateway. The Alexa App will show you more.')
            .withSimpleCard('Gateway Communication Error', 'Unknown: Unknown')
            .getResponse()
        }
      }
      persistentAttributes.password = password
      Reflect.deleteProperty(persistentAttributes, 'tvmap')
      handlerInput.attributesManager.setPersistentAttributes(persistentAttributes)
      try {
        await handlerInput.attributesManager.savePersistentAttributes()
      } catch (error) {
        if (error instanceof Error) {
          return handlerInput.responseBuilder
            .speak('I had a problem and we will have to start over.' +
                          ' A card in the Alexa App shows more.')
            .withSimpleCard('Error', `${error.name}: ${error.message}`)
            .getResponse()
        } else {
          return handlerInput.responseBuilder
            .speak('I had a problem and we will have to start over.' +
                          ' A card in the Alexa App shows more.')
            .withSimpleCard('Error', 'Unknown: Unknown')
            .getResponse()
        }
      }
      return handlerInput.responseBuilder
        .speak('Your password has been set.')
        .getResponse()
    } catch (error) {
      if (error instanceof Error) {
        return handlerInput.responseBuilder
          .speak('I had a problem talking to the gateway. The Alexa App will show you more.')
          .withSimpleCard('Error', `${error.name}: ${error.message}`)
          .getResponse()
      } else {
        return handlerInput.responseBuilder
          .speak('I had a problem talking to the gateway. The Alexa App will show you more.')
          .withSimpleCard('Error', 'Unknown: Unknown')
          .getResponse()
      }
    }
  }
}

const handlers = [
  SetHostnameIntentHandler,
  SetPasswordIntentHandler
]

export { handlers }

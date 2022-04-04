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
    console.log(JSON.stringify(handlerInput))

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes()
    if (typeof handlerInput.requestEnvelope.request === 'undefined') {
      console.log('Authorization_SetHostnameIntent: request undefined')
      throw new Error('invalid code path')
    }
    const intentRequest = (handlerInput.requestEnvelope.request as ASKModel.IntentRequest)

    if (ASKCore.getDialogState(handlerInput.requestEnvelope) === 'STARTED') {
      console.log('Authorization_SetHostnameIntent: STARTED')
      Reflect.deleteProperty(sessionAttributes, 'ipAddress')
      Reflect.deleteProperty(sessionAttributes, 'hostnames')
      handlerInput.attributesManager.setSessionAttributes(sessionAttributes)

      return handlerInput.responseBuilder
        .addDelegateDirective(intentRequest.intent)
        .getResponse()
    } else if (ASKCore.getDialogState(handlerInput.requestEnvelope) === 'IN_PROGRESS') {
      console.log('Authorization_SetHostnameIntent: IN_PROGRESS')
      console.log(`ipAddressA: ${ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressA')}`)
      console.log(`ipAddressB: ${ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressB')}`)
      console.log(`ipAddressC: ${ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressC')}`)
      console.log(`ipAddressD: ${ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressD')}`)
      if (typeof ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressA') === 'undefined') {
        console.log('Authorization_SetHostnameIntent: ipAddressA is undefined')
        return handlerInput.responseBuilder
          .addDelegateDirective(intentRequest.intent)
          .getResponse()
      } else if (parseInt(ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressA'), 10) < 0 ||
          parseInt(ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressA'), 10) > 255) {
        console.log('Authorization_SetHostnameIntent: ipAddressA out of range')
        return handlerInput.responseBuilder
          .speak('I think I misheard you.' +
                        ' I.P. v four address numbers need to be between 0 and 255.' +
                        ' Could you tell me the first number again?')
          .addElicitSlotDirective('ipAddressA')
          .getResponse()
      } else if (typeof ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressB') === 'undefined') {
        console.log('Authorization_SetHostnameIntent: ipAddressB is undefined')

        return handlerInput.responseBuilder
          .addDelegateDirective(intentRequest.intent)
          .getResponse()
      } else if (parseInt(ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressB'), 10) < 0 ||
          parseInt(ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressB'), 10) > 255) {
        console.log('Authorization_SetHostnameIntent: ipAddressB out of range')
        return handlerInput.responseBuilder
          .speak('I think I misheard you.' +
                        ' I.P. v four address numbers need to be between 0 and 255.' +
                        ' Could you tell me the second number again?')
          .addElicitSlotDirective('ipAddressB')
          .getResponse()
      } else if (typeof ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressC') === 'undefined') {
        console.log('Authorization_SetHostnameIntent: ipAddressC is undefined')
        return handlerInput.responseBuilder
          .addDelegateDirective(intentRequest.intent)
          .getResponse()
      } else if (parseInt(ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressC'), 10) < 0 ||
          parseInt(ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressC'), 10) > 255) {
        console.log('Authorization_SetHostnameIntent: ipAddressC out of range')
        return handlerInput.responseBuilder
          .speak('I think I misheard you.' +
                        ' I.P. v four address numbers need to be between 0 and 255.' +
                        ' Could you tell me the third number again?')
          .addElicitSlotDirective('ipAddressC')
          .getResponse()
      } else if (typeof ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressD') === 'undefined') {
        console.log('Authorization_SetHostnameIntent: ipAddressD is undefined')
        return handlerInput.responseBuilder
          .addDelegateDirective(intentRequest.intent)
          .getResponse()
      } else if (parseInt(ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressD'), 10) < 0 ||
          parseInt(ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressD'), 10) > 255) {
        console.log('Authorization_SetHostnameIntent: ipAddressD out of range')
        return handlerInput.responseBuilder
          .speak('I think I misheard you.' +
                        ' I.P. v four address numbers need to be between 0 and 255.' +
                        ' Could you tell me the fourth number again?')
          .addElicitSlotDirective('ipAddressD')
          .getResponse()
      } else if (typeof ASKCore.getSlotValue(handlerInput.requestEnvelope, 'hostnameIndex') !== 'undefined') {
        console.log('Authorization_SetHostnameIntent: hostnameIndex is defined')
        sessionAttributes.ipAddress =
                    `${ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressA')}.` +
                    `${ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressB')}.` +
                    `${ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressC')}.` +
                    `${ASKCore.getSlotValue(handlerInput.requestEnvelope, 'ipAddressD')}`
        Reflect.deleteProperty(sessionAttributes, 'hostnames')
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes)
        console.log(`Authorization_SetHostnameIntent: IPv4 address is ${sessionAttributes.hostname}`)
        try {
          sessionAttributes.hostnames = await getHostnames(sessionAttributes.ipAddress, 25392)
        } catch (error) {
          console.log(`Authorization_SetHostnameIntent: cannot connect to IPv4 address '${sessionAttributes.ipAddress}'`)
          if (error instanceof Error) {
            return handlerInput.responseBuilder
              .speak('I had a problem connecting to the I.P. address.' +
                              ' A card in the ASK App shows more.')
              .withSimpleCard('LG webOS TV Controller Error', `${error.name}: ${error.message}`)
              .getResponse()
          } else {
            return handlerInput.responseBuilder
              .speak('I had a problem connecting to the I.P. address.' +
                              ' A card in the Alexa App shows more.')
              .withSimpleCard('LG webOS TV Controller Error', 'Unknown: Unknown')
              .getResponse()
          }
        }
        console.log(`Authorization_SetHostnameIntent: gateway FQDNs: ${sessionAttributes.hostnames}`)
        const cardTitle = 'Gateway Hostname Configuration'
        let cardContent = ''
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
        return handlerInput.responseBuilder
          .speak('Thank you.' +
                        ' Now, could you look at the card in your Alexa App and' +
                        ' tell me the number next to your gateway\'s hostname?')
          .withSimpleCard(cardTitle, cardContent)
          .addElicitSlotDirective('hostnameIndex')
          .getResponse()
      } else if ((ASKCore.getSlotValue(handlerInput.requestEnvelope, 'hostnameIndex') >= sessionAttributes.hostnames.length + 2) ||
          (((ASKCore.getSlotValue(handlerInput.requestEnvelope, 'hostnameIndex') as unknown) as number) < 0)) {
        return handlerInput.responseBuilder
          .speak('I think I misheard you.' +
                        ` I heard ${ASKCore.getSlotValue(handlerInput.requestEnvelope, 'hostnameIndex')}, which is not an index on the card.` +
                        ' Could you repeat your index?')
          .addElicitSlotDirective('hostnameIndex')
          .getResponse()
      } else if (ASKCore.getSlotValue(handlerInput.requestEnvelope, 'hostnameIndex') === sessionAttributes.hostnames.length + 1) {
        return handlerInput.responseBuilder
          .speak('I\'m sorry I misheard your gateway\'s I.P. address.' +
                        'Maybe we could try again.')
          .getResponse()
      } else if (ASKCore.getSlotValue(handlerInput.requestEnvelope, 'hostnameIndex') === sessionAttributes.hostnames.length) {
        return handlerInput.responseBuilder
          .speak('I\'m sorry I could not discover your gateway\'s hostname.')
          .getResponse()
      } else if ((handlerInput.requestEnvelope.request as ASKModel.IntentRequest).intent.confirmationStatus === 'NONE') {
        return handlerInput.responseBuilder
          .speak(`Is your hostname ${sessionAttributes.hostnames[ASKCore.getSlotValue(handlerInput.requestEnvelope, 'hostnameIndex')]}?`)
          .addConfirmIntentDirective()
          .getResponse()
      }
    } else if (ASKCore.getDialogState(handlerInput.requestEnvelope) === 'COMPLETED') {
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

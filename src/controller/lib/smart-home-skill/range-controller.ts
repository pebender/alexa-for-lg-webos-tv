import * as ASH from '../../../common/alexa'

function ipAddressOctetCapability (octet: 'A' | 'B' | 'C' | 'D'): Promise<ASH.ResponseEventPayloadEndpointCapability> {
  const textsList: {[x: string]: string[]} = {
    A: [
      'Alpha',
      'A'
    ],
    B: [
      'Bravo',
      'B'
    ],
    C: [
      'Charlie',
      'C'
    ],
    D: [
      'Delta',
      'D'
    ]
  }
  const texts: string[] = textsList[octet]
  const instance = octet
  const friendlyNames = texts.map((text: string): {
    '@type': 'text';
    'value': {
      'text': string;
      'locale': 'en-US';
    };
  } => {
    const friendlyName: {
      '@type': 'text';
      'value': {
        'text': string;
        'locale': 'en-US';
      };
    } = {
      '@type': 'text',
      value: {
        text: text,
        locale: 'en-US'
      }
    }
    return friendlyName
  })

  return Promise.resolve({
    type: 'AlexaInterface',
    interface: 'Alexa.RangeController',
    version: '3',
    instance: instance,
    properties: {
      supported: [
        {
          name: 'rangeValue'
        }
      ],
      proactivelyReported: false,
      retrievable: true
    },
    capabilityResources: {
      friendlyNames: friendlyNames
    },
    configuration: {
      supportedRange: {
        minimumValue: 0,
        maximumValue: 255,
        precision: 1
      }
    }
  })
}

function capabilities (): Promise<ASH.ResponseEventPayloadEndpointCapability>[] {
  return [
    ipAddressOctetCapability('A'),
    ipAddressOctetCapability('B'),
    ipAddressOctetCapability('C'),
    ipAddressOctetCapability('D')
  ]
}

function states (): Promise<ASH.ResponseContextProperty>[] {
  function valueA (): string {
    return '0'
  }
  function valueB (): string {
    return '0'
  }
  function valueC (): string {
    return '0'
  }
  function valueD (): string {
    return '0'
  }
  const rangeValueStateA = ASH.Response.buildContextProperty({
    namespace: 'Alexa.RangeController',
    instance: 'A',
    name: 'rangeValue',
    value: valueA
  })
  const rangeValueStateB = ASH.Response.buildContextProperty({
    namespace: 'Alexa.RangeController',
    instance: 'B',
    name: 'rangeValue',
    value: valueB
  })
  const rangeValueStateC = ASH.Response.buildContextProperty({
    namespace: 'Alexa.RangeController',
    instance: 'C',
    name: 'rangeValue',
    value: valueC
  })
  const rangeValueStateD = ASH.Response.buildContextProperty({
    namespace: 'Alexa.RangeController',
    instance: 'D',
    name: 'rangeValue',
    value: valueD
  })
  return [
    rangeValueStateA,
    rangeValueStateB,
    rangeValueStateC,
    rangeValueStateD
  ]
}

function setRangeValueInstanceHandler (alexaRequest: ASH.Request): Promise<ASH.Response> {
  return Promise.resolve(new ASH.Response({
    namespace: 'Alexa',
    name: 'Response',
    correlationToken: alexaRequest.getCorrelationToken(),
    endpointId: alexaRequest.getEndpointId()
  }))
}

function adjustRangeValueInstanceHandler (alexaRequest: ASH.Request): Promise<ASH.Response> {
  return Promise.resolve(new ASH.Response({
    namespace: 'Alexa',
    name: 'Response',
    correlationToken: alexaRequest.getCorrelationToken(),
    endpointId: alexaRequest.getEndpointId()
  }))
}

function unknownInstanceError (alexaRequest: ASH.Request): ASH.Response {
  const message = `I do not know the Range Controller instance ${alexaRequest.directive.header.instance}`
  return ASH.errorResponse(alexaRequest, 'INTERNAL_ERROR', message)
}

function setRangeValueHandler (alexaRequest: ASH.Request): Promise<ASH.Response> {
  switch (alexaRequest.directive.header.instance) {
    case 'A':
      return setRangeValueInstanceHandler(alexaRequest)
    case 'B':
      return setRangeValueInstanceHandler(alexaRequest)
    case 'C':
      return setRangeValueInstanceHandler(alexaRequest)
    case 'D':
      return setRangeValueInstanceHandler(alexaRequest)
    default:
      return Promise.resolve(unknownInstanceError(alexaRequest))
  }
}

function adjustRangeValueHandler (alexaRequest: ASH.Request): Promise<ASH.Response> {
  switch (alexaRequest.directive.header.instance) {
    case 'A':
      return adjustRangeValueInstanceHandler(alexaRequest)
    case 'B':
      return adjustRangeValueInstanceHandler(alexaRequest)
    case 'C':
      return adjustRangeValueInstanceHandler(alexaRequest)
    case 'D':
      return adjustRangeValueInstanceHandler(alexaRequest)
    default:
      return Promise.resolve(unknownInstanceError(alexaRequest))
  }
}

function handler (alexaRequest: ASH.Request): Promise<ASH.Response> {
  if (alexaRequest.directive.header.namespace !== 'Alexa.RangeController') {
    return Promise.resolve(ASH.errorResponseForWrongNamespace(alexaRequest, alexaRequest.directive.header.namespace))
  }
  switch (alexaRequest.directive.header.name) {
    case 'SetRangeValue':
      return Promise.resolve(setRangeValueHandler(alexaRequest))
    case 'AdjustRangeValue':
      return Promise.resolve(adjustRangeValueHandler(alexaRequest))
    default:
      return Promise.resolve(ASH.errorResponseForUnknownDirective(alexaRequest))
  }
}

export { capabilities, states, handler }

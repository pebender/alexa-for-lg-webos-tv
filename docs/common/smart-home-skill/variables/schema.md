[**alexa-for-lg-webos-tv**](../../../README.md) • **Docs**

***

[alexa-for-lg-webos-tv](../../../modules.md) / [common/smart-home-skill](../README.md) / schema

# Variable: schema

> **schema**: `object`

## Type declaration

### $schema

> **$schema**: `string` = `"https://json-schema.org/draft/2019-09/schema#"`

### definitions

> **definitions**: `object`

### definitions.common

> **common**: `object`

### definitions.common.model.Context

> **Context**: `object`

### definitions.common.model.Context.additionalProperties

> **additionalProperties**: `boolean` = `false`

### definitions.common.model.Context.properties

> **properties**: `object`

### definitions.common.model.Context.properties.properties

> **properties**: `object`

### definitions.common.model.Context.properties.properties.$ref

> **$ref**: `string` = `"#/definitions/state.properties"`

### definitions.common.model.Context.type

> **type**: `string` = `"object"`

### definitions.common.model.CorrelationToken

> **CorrelationToken**: `object`

### definitions.common.model.CorrelationToken.minLength

> **minLength**: `number` = `1`

### definitions.common.model.CorrelationToken.type

> **type**: `string` = `"string"`

### definitions.common.model.Endpoint

> **Endpoint**: `object`

### definitions.common.model.Endpoint.properties

> **properties**: `object`

### definitions.common.model.Endpoint.properties.endpointId

> **endpointId**: `object`

### definitions.common.model.Endpoint.properties.endpointId.$ref

> **$ref**: `string` = `"#/definitions/common/model.EndpointId"`

### definitions.common.model.Endpoint.properties.scope

> **scope**: `object`

### definitions.common.model.Endpoint.properties.scope.$ref

> **$ref**: `string` = `"#/definitions/common/model.Scope"`

### definitions.common.model.Endpoint.required

> **required**: `string`[]

### definitions.common.model.Endpoint.type

> **type**: `string` = `"object"`

### definitions.common.model.EndpointId

> **EndpointId**: `object`

### definitions.common.model.EndpointId.maxLength

> **maxLength**: `number` = `256`

### definitions.common.model.EndpointId.minLength

> **minLength**: `number` = `1`

### definitions.common.model.EndpointId.pattern

> **pattern**: `string` = `"^[a-zA-Z0-9_\\-=#;:?@&]*$"`

### definitions.common.model.EndpointId.type

> **type**: `string` = `"string"`

### definitions.common.model.MessageId

> **MessageId**: `object`

### definitions.common.model.MessageId.maxLength

> **maxLength**: `number` = `127`

### definitions.common.model.MessageId.minLength

> **minLength**: `number` = `1`

### definitions.common.model.MessageId.pattern

> **pattern**: `string` = `"^[a-zA-Z0-9\\-]*$"`

### definitions.common.model.MessageId.type

> **type**: `string` = `"string"`

### definitions.common.model.PayloadVersion

> **PayloadVersion**: `object`

### definitions.common.model.PayloadVersion.enum

> **enum**: `string`[]

### definitions.common.model.PayloadVersion.type

> **type**: `string` = `"string"`

### definitions.common.model.Scope

> **Scope**: `object`

### definitions.common.model.Scope.properties

> **properties**: `object`

### definitions.common.model.Scope.properties.token

> **token**: `object`

### definitions.common.model.Scope.properties.token.minLength

> **minLength**: `number` = `1`

### definitions.common.model.Scope.properties.token.type

> **type**: `string` = `"string"`

### definitions.common.model.Scope.properties.type

> **type**: `object`

### definitions.common.model.Scope.properties.type.enum

> **enum**: `string`[]

### definitions.common.model.Scope.required

> **required**: `string`[]

### definitions.common.model.Scope.type

> **type**: `string` = `"object"`

### definitions.common.model.StatePropertyBase.TimeOfSample

> **TimeOfSample**: `object`

### definitions.common.model.StatePropertyBase.TimeOfSample.pattern

> **pattern**: `string` = `"^(?:[1-9]\\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)T(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:.\\d{1,3}|)Z$"`

### definitions.common.model.StatePropertyBase.TimeOfSample.type

> **type**: `string` = `"string"`

### definitions.common.model.StatePropertyBase.UncertaintyInMilliseconds

> **UncertaintyInMilliseconds**: `object`

### definitions.common.model.StatePropertyBase.UncertaintyInMilliseconds.minimum

> **minimum**: `number` = `0`

### definitions.common.model.StatePropertyBase.UncertaintyInMilliseconds.type

> **type**: `string` = `"number"`

### definitions.endpoint.capabilities

> **capabilities**: `object`

### definitions.endpoint.capabilities.items

> **items**: `object`

### definitions.endpoint.capabilities.items.anyOf

> **anyOf**: (`object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object`)[]

### definitions.endpoint.capabilities.minItems

> **minItems**: `number` = `1`

### definitions.endpoint.capabilities.type

> **type**: `string` = `"array"`

### definitions.endpoint.capabilities.uniqueItems

> **uniqueItems**: `boolean` = `true`

### definitions.state.properties

> **properties**: `object`

### definitions.state.properties.items

> **items**: `object`

### definitions.state.properties.items.anyOf

> **anyOf**: (`object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object`)[]

### definitions.state.properties.type

> **type**: `string` = `"array"`

### definitions.state.properties.uniqueItems

> **uniqueItems**: `boolean` = `true`

### description

> **description**: `string` = `"A JSON message sent from a skill to Alexa, either proactively or as a response to a directive"`

### oneOf

> **oneOf**: (`object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object` \| `object`)[]

### title

> **title**: `string` = `"Alexa Smart Home Message Schema"`

[**Documentation**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@backinthirty/alexa-for-lg-webos-tv-common](../../README.md) / [constants](../README.md) / constants

# Variable: constants

> `const` **constants**: `object`

Defined in: [packages/common/src/constants.ts:4](https://github.com/pebender/alexa-for-lg-webos-tv/blob/08f09ed88779fc1ad44c84758ae6d1b5fed7b8bb/packages/common/src/constants.ts#L4)

## Type Declaration

### application

> **application**: `object`

#### application.name

> **name**: `object`

#### application.name.pretty

> **pretty**: `string` = `applicationNamePretty`

#### application.name.safe

> **safe**: `string` = `applicationNameSafe`

#### application.vendor

> **vendor**: `string` = `"Back in Thirty"`

### aws

> **aws**: `object`

#### aws.dynamoDB

> **dynamoDB**: `object`

#### aws.dynamoDB.indexName

> **indexName**: `string` = `"skillToken_index"`

#### aws.dynamoDB.tableName

> **tableName**: `string` = `applicationNameSafe`

#### aws.region

> **region**: `string` = `"us-east-1"`

### bridge

> **bridge**: `object`

#### bridge.host

> **host**: `string` = `"0.0.0.0"`

#### bridge.jwt

> **jwt**: `object`

#### bridge.jwt.iss

> **iss**: `string` = `applicationNamePretty`

#### bridge.jwt.x509PrivateKeyFile

> **x509PrivateKeyFile**: `string`

#### bridge.jwt.x509PublicCertFile

> **x509PublicCertFile**: `string`

#### bridge.path

> **path**: `object`

#### bridge.path.login

> **login**: `string` = `"/login"`

#### bridge.path.service

> **service**: `string`

#### bridge.path.test

> **test**: `string` = `"/test"`

#### bridge.port

> **port**: `object`

#### bridge.port.http

> **http**: `number` = `25_391`

#### bridge.port.https

> **https**: `number` = `25_392`

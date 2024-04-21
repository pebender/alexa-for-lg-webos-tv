[alexa-for-lg-webos-tv](../README.md) / [Modules](../modules.md) / common/constants

# Module: common/constants

## Table of contents

### Variables

- [constants](common_constants.md#constants)

## Variables

### constants

• `Const` **constants**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `application` | \{ `name`: \{ `pretty`: `string` = applicationNamePretty; `safe`: `string` = applicationNameSafe } ; `vendor`: `string` = "Back in Thirty" } |
| `application.name` | \{ `pretty`: `string` = applicationNamePretty; `safe`: `string` = applicationNameSafe } |
| `application.name.pretty` | `string` |
| `application.name.safe` | `string` |
| `application.vendor` | `string` |
| `aws` | \{ `dynamoDB`: \{ `indexName`: `string` = "skillToken\_index"; `tableName`: `string` = applicationNameSafe } ; `region`: `string` = "us-east-1" } |
| `aws.dynamoDB` | \{ `indexName`: `string` = "skillToken\_index"; `tableName`: `string` = applicationNameSafe } |
| `aws.dynamoDB.indexName` | `string` |
| `aws.dynamoDB.tableName` | `string` |
| `aws.region` | `string` |
| `bridge` | \{ `host`: `string` = "0.0.0.0"; `jwt`: \{ `iss`: `string` = applicationNamePretty; `x509PrivateKeyFile`: `string` ; `x509PublicCertFile`: `string`  } ; `path`: \{ `login`: `string` = "/login"; `skill`: `string` ; `test`: `string` = "/test" } ; `port`: \{ `http`: `number` = 25391; `https`: `number` = 25392 }  } |
| `bridge.host` | `string` |
| `bridge.jwt` | \{ `iss`: `string` = applicationNamePretty; `x509PrivateKeyFile`: `string` ; `x509PublicCertFile`: `string`  } |
| `bridge.jwt.iss` | `string` |
| `bridge.jwt.x509PrivateKeyFile` | `string` |
| `bridge.jwt.x509PublicCertFile` | `string` |
| `bridge.path` | \{ `login`: `string` = "/login"; `skill`: `string` ; `test`: `string` = "/test" } |
| `bridge.path.login` | `string` |
| `bridge.path.skill` | `string` |
| `bridge.path.test` | `string` |
| `bridge.port` | \{ `http`: `number` = 25391; `https`: `number` = 25392 } |
| `bridge.port.http` | `number` |
| `bridge.port.https` | `number` |

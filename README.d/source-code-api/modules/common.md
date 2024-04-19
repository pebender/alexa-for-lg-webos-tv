[alexa-for-lg-webos-tv](../README.md) / common

# Module: common

## Table of contents

### Namespaces

- [Debug](common.Debug.md)
- [HTTPSRequest](common.HTTPSRequest.md)
- [Profile](common.Profile.md)
- [SHS](common.SHS.md)

### Variables

- [constants](common.md#constants)

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

#### Defined in

[common/constants.ts:4](https://github.com/pebender/alexa-for-lg-webos-tv/blob/ed6e832de9301ef89b625820a22ad4e5b6c0e1d9/src/common/constants.ts#L4)

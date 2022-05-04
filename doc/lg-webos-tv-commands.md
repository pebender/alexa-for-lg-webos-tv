# LG webOS TV Commands

At least some LGTV webOS TV's support the commands in the table below.

I generated the [schemas](../src/bridge/lib/backend/schemas/schemas/) [ExtendsClass's JSON Schema Validator and Generator](https://extendsclass.com/json-schema-validator.html) from my LG webOS TV's [output](../src/bridge/lib/backend/schemas/examples/) using [ExtendsClass's JSON Schema Validator and Generator](https://extendsclass.com/json-schema-validator.html). Since my TV's outputs are limited my TV's hardware, configuration and installed applications, the schemas are no doubt more limited, more restricted and less restricted than the actual schemas. However, I have not found the actual schemas anywhere, so this is the best I can do. If anyone has an output that fail to validate against its schema, please forward it to me so that I can use it to update the schema. You can validate your output against the schema using the same site I used to generate the schema. Alternatively, you can use [JSON Schema Validator](https://www.jsonschemavalidator.net).

Also, if you know of any other commands, pleas let me know so that I can add them to the table.

| Command                                           | Payload                   | Response Schema |
|---                                                |---                        |--        |
| api/getServiceList                                |                           | [service-list](../src/bridge/lib/backend/schemas/schemas/service-list.json) |
| audio/getStatus                                   |                           | [audio-status](../src/bridge/lib/backend/schemas/schemas/audio-status.json) |
| audio/getVolume                                   |                           | [audio-status](../src/bridge/lib/backend/schemas/schemas/audio-status.json) |
| audio/setMute                                     | { ???: }                  | [success](../src/bridge/lib/backend/schemas/schemas/success.json)          |
| audio/setVolume                                   | { ???: }                  |
| audio/volumeDown                                  |                           | [success](../src/bridge/lib/backend/schemas/schemas/success.json)          |
| audio/volumeUp                                    |                           | [success](../src/bridge/lib/backend/schemas/schemas/success.json)          |
| com.webos.applicationManager/getForegroundAppInfo |                           | [foreground-app-info](../src/bridge/lib/backend//schemas/schemas/foreground-app-info.json)    |
| com.webos.applicationManager/launch               | { ???: }                  |
| com.webos.applicationManager/listApps             |                           | [application-list](../src/bridge/lib/backend/schemas/schemas/application-list.json) |
| com.webos.applicationManager/listLaunchPoints     |                           | [launch-point-list](../src/bridge/lib/backend/schemas/schemas/launch-point-list.json) |
| com.webos.service.appStatus/getAppStatus          |                           | [application-status](../src/bridge/lib/backend/schemas/schemas/???)
| com.webos.service.ime/deleteCharacters            | { count: integer }
| com.webos.service.ime/sendEnterKey                |                           | [success](../src/bridge/lib/backend/schemas/schemas/success.json)
| com.webos.service.tv.display/set3DOff             |                           |
| com.webos.service.tv.display/set3DOn              |                           |
| com.webos.service.update/getCurrentSWInformation  |                           | [sw-information](../src/bridge/lib/backend/schemas/schemas/sw-information.json) |
| media.controls/fastForward                        |                           | [success](../src/bridge/lib/backend/schemas/schemas/success.json)
| media.controls/pause                              |                           | [success](../src/bridge/lib/backend/schemas/schemas/success.json)
| media.controls/play                               |                           | [success](../src/bridge/lib/backend/schemas/schemas/success.json)
| media.controls/rewind                             |                           | [success](../src/bridge/lib/backend/schemas/schemas/success.json)
| media.controls/stop                               |                           | [success](../src/bridge/lib/backend/schemas/schemas/success.json)
| media.viewer/close                                |                           | ??? |
| system/turnOff                                    |                           | ??? |
| system.launcher/close                             |                           | ??? |
| system.launcher/getAppState                       |                           | ??? |
| system.launcher/launch                            | { ???: ??? }              | ??? |
| system.launcher/open                              | { ???: ??? }              | ??? |
| system.notifications/createToast                  | { message: string }       | ??? |
| tv/channelDown                                    |                           | [success](../src/bridge/lib/backend/schemas/schemas/success.json)
| tv/channelUp                                      |                           | [success](../src/bridge/lib/backend/schemas/schemas/success.json)
| tv/getChannelList                                 |                           | [channel-list](../src/bridge/lib/backend/schemas/schemas/channel-list.json) |
| tv/getChannelProgramInfo                          | ???                       | ??? |
| tv/getCurrentChannel                              |                           | ??? |
| tv/getExternalInputList                           |                           | [external-input-list](../src/bridge/lib/backend/schemas/schemas/external-input-list.json) |
| tv/openChannel                                    | { channelNumber: string } | ??? |
|                                                   | { channelId: string }     |     |
| tv/switchInput                                    | { inputId: string }       | ??? |
| webapp/closeWebApp                                | ???                       | ??? |

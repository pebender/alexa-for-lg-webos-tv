# LG webOS TV Commands

At least some LGTV webOS TV's support the commands in the table below.

I generated the [schemas](../../src/bridge/lib/backend/schemas/schemas/) [ExtendsClass's JSON Schema Validator and Generator](https://extendsclass.com/json-schema-validator.html) from my LG webOS TV's [output](../../src/bridge/lib/backend/schemas/examples/) using [ExtendsClass's JSON Schema Validator and Generator](https://extendsclass.com/json-schema-validator.html). Since my TV's outputs are limited my TV's hardware, configuration and installed applications, the schemas are no doubt more limited, more restricted and less restricted than the actual schemas. However, I have not found the actual schemas anywhere, so this is the best I can do. If anyone has an output that fails to validate against its schema, please forward it to me so that I can use it to update the schema. You can validate your output against the schema using the same site I used to generate the schema. Alternatively, you can use [JSON Schema Validator](https://www.jsonschemavalidator.net).

Also, if you know of any other commands, please let me know so that I can add them to the table.

| Command                                           | Subscribable | Payload                   | Response Schema |
|---                                                |---           |---                        |-- |
| api/getServiceList                                |              |                           | [service-list](../../src/bridge/lib/backend/schemas/schemas/service-list.json) |
| audio/getStatus                                   | X[^1]        |                           | [audio-status](../../src/bridge/lib/backend/schemas/schemas/audio-status.json) |
| audio/getVolume                                   | X[^1]        |                           | [audio-status](../../src/bridge/lib/backend/schemas/schemas/audio-status.json) |
| audio/setMute                                     |              | { mute: boolean }         | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
| audio/setVolume                                   |              | { volume: number }        | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
| audio/volumeDown                                  |              |                           | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
| audio/volumeUp                                    |              |                           | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
| com.webos.applicationManager/getForegroundAppInfo | X            |                           | [foreground-app-info](../../src/bridge/lib/backend//schemas/schemas/foreground-app-info.json) |
| com.webos.applicationManager/launch               |              | { id: string }            | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
| com.webos.applicationManager/listApps             |              |                           | [application-list](../../src/bridge/lib/backend/schemas/schemas/application-list.json) |
| com.webos.applicationManager/listLaunchPoints     |              |                           | [launch-point-list](../../src/bridge/lib/backend/schemas/schemas/launch-point-list.json) |
| com.webos.service.appstatus/getAppStatus          |              |                           | ??? |
| com.webos.service.ime/deleteCharacters            |              | { count: integer }        | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
| com.webos.service.ime/sendEnterKey                |              |                           | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
| com.webos.service.tv.display/set3DOff             |              |                           | ??? |
| com.webos.service.tv.display/set3DOn              |              |                           | ??? |
| com.webos.service.update/getCurrentSWInformation  |              |                           | [sw-information](../../src/bridge/lib/backend/schemas/schemas/sw-information.json) |
| media.controls/fastForward                        |              |                           | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
| media.controls/pause                              |              |                           | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
| media.controls/play                               |              |                           | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
| media.controls/rewind                             |              |                           | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
| media.controls/stop                               |              |                           | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
| media.viewer/close                                |              | ???                       | ??? |
| system/turnOff                                    |              |                           | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
| system.launcher/close                             |              | ???                       | ??? |
| system.launcher/getAppState                       |              | ???                       | ??? |
| system.launcher/launch                            |              | { id: string }            | ??? |
| system.launcher/open                              |              | { id: string }            | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
|                                                   |              |                           | [launcher-open](../../src/bridge/lib/backend/schemas/schemas/launcher-open.json) |
| system.notifications/createToast                  |              | { message: string }       | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
| tv/channelDown                                    |              |                           | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
| tv/channelUp                                      |              |                           | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
| tv/getChannelList                                 |              |                           | [channel-list](../../src/bridge/lib/backend/schemas/schemas/channel-list.json) |
| tv/getChannelProgramInfo                          |              | ???                       | ??? |
| tv/getCurrentChannel                              | X[^2]        |                           | [current-channel](../../src/bridge/lib/backend/schemas/schemas/current-channel.json)[^3] |
| tv/getExternalInputList                           |              |                           | [external-input-list](../../src/bridge/lib/backend/schemas/schemas/external-input-list.json) |
| tv/openChannel                                    |              | { channelNumber: string } | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
|                                                   |              | { channelId: string }     | |
| tv/switchInput                                    |              | { inputId: string }       | [success](../../src/bridge/lib/backend/schemas/schemas/success.json) |
| webapp/closeWebApp                                |              | ???                       | ??? |

[^1]: Includes the action that triggered the response in subscribed responses.
[^2]: Subscription fails when the TV isn't watching channels. And, subscription ends when the TV switches away from watching channels. To work around this, register for 'com.webos.applicationManager/getForegroundAppInfo' and register for 'tv/getCurrentChannel' when 'appId' is 'com.webos.app.livetv'.
[^3]: Doesn't include 'returnValue' in subscribed responses. In addition, sometimes it includes 'isInvisible' and sometimes it includes 'isinvisible'. If you are getting the idea that 'tv/getCurrentChannel' is very poorly implemented, you are not alone.

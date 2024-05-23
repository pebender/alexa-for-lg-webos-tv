import * as fs from "node:fs/promises";
import persistPath from "persist-path";
import type LGTV from "lgtv2";
import * as Common from "../../common";
import { Configuration, Backend, type TV } from "../../bridge";

export async function getBackend(): Promise<Backend> {
  const configurationDirectory = persistPath(
    Common.constants.application.name.safe,
  );

  try {
    await fs.mkdir(configurationDirectory, { recursive: true });
  } catch (error) {
    const commonError = new Common.GeneralCommonError({ cause: error });
    Common.Debug.debugError(commonError);
    throw commonError;
  }

  const configuration = await Configuration.build();

  //
  // I keep long term information needed to connect to each TV in a database.
  // The long term information is the TV's unique device name (udn), friendly name
  // (name), Internet Protocol address (ip), media access control address (mac)
  // and client key (key).
  //

  const backend = await Backend.build(configuration);
  backend.on("error", (error: Error, id: string): void => {
    Common.Debug.debug(id);
    Common.Debug.debugError(error);
  });
  await backend.start();

  return backend;
}

function getSortedTVList(backend: Backend): TV.TV[] {
  const backendControls = backend.controls();
  const udnList = backendControls
    .map((backendControl) => backendControl.tv.udn)
    .sort();
  const tvList = udnList.map((udn) => backend.control(udn).tv);
  return tvList;
}

function lgtvCmdsCommand(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  backend: Backend,
): void {
  console.log("Known Commands");
  const cmds: Record<string, object | null> = {
    "api/getServiceList": null,
    "audio/getStatus": null,
    "audio/getVolume": null,
    "audio/setMute": { mute: "boolean" },
    "audio/setVolume:": { volume: "number" },
    "audio/volumeDown": null,
    "audio/volumeUp": null,
    "com.webos.applicationManager/getForegroundAppInfo": null,
    "com.webos.applicationManager/launch": { id: "string" },
    "com.webos.applicationManager/listApps": null,
    "com.webos.applicationManager/listLaunchPoints": null,
    "com.webos.service.appstatus/getAppStatus": null,
    "com.webos.service.ime/deleteCharacters": { count: "integer" },
    "com.webos.service.ime/sendEnterKey": null,
    "com.webos.service.tv.display/set3DOff": null,
    "com.webos.service.tv.display/set3DOn": null,
    "com.webos.service.update/getCurrentSWInformation": null,
    "media.controls/fastForward": null,
    "media.controls/pause": null,
    "media.controls/play": null,
    "media.controls/rewind": null,
    "media.controls/stop": null,
    "media.viewer/close": { "???": "???" },
    "system/turnOff": null,
    "system.launcher/close": { "???": "???" },
    "system.launcher/getAppState": { "???": "???" },
    "system.launcher/launch": { id: "string" },
    "system.launcher/open": { id: "string" },
    "system.notifications/createToast": { message: "string" },
    "tv/channelDown": null,
    "tv/channelUp": null,
    "tv/getChannelList": null,
    "tv/getChannelProgramInfo": { "???": "???" },
    "tv/getCurrentChannel": null,
    "tv/getExternalInputList": null,
    "tv/openChannel": [{ channelNumber: "string" }, { channelId: "string" }],
    "tv/switchInput": { inputId: "string" },
    "webapp/closeWebApp": { "???": "???" },
    // luna commands that work at with ssap as well.
    "com.webos.audio/getVolume": null,
    "com.webos.audio/volumeDown": null,
    "com.webos.audio/volumeUp": null,
  };

  console.log("known commands:");
  for (const cmd of Object.keys(cmds).sort()) {
    if (cmds[cmd] === null) {
      console.log(`  command='${cmd}`);
    } else {
      console.log(`  command='${cmd}, payload='${JSON.stringify(cmds[cmd])}`);
    }
  }
  console.log('"???" means the payload is unknown.');
  console.log(
    "Some commands return values on my TV, so I do whether they work.",
  );
}

function lgtvUdnsCommand(backend: Backend): void {
  const tvList = getSortedTVList(backend);
  for (const [index, element] of tvList.entries()) {
    console.log(`${index.toString()}: ${element.udn}: ${element.name}`);
  }
}

function lgtvRunCommand(backend: Backend): void {
  const argv: string[] = process.argv;
  if (argv.length === 5 || argv.length === 6) {
    const tvList = getSortedTVList(backend);
    const tv = tvList[Number.parseInt(argv[3])];
    console.log(`udn: ${tv.udn}`);
    const backendControl = backend.control(tv.udn);
    backendControl.on("connect", () => {
      const asyncConnect = async (): Promise<void> => {
        const uri = `ssap://${argv[4]}`;
        if (argv.length === 5) {
          const lgtvRequest: LGTV.Request = {
            uri,
          };
          console.log(JSON.stringify(lgtvRequest, null, 2));
          try {
            const lgtvResponse = await backendControl.lgtvCommand(lgtvRequest);
            console.log(JSON.stringify(lgtvResponse, null, 2));
          } catch (error) {
            if (error instanceof Error) {
              console.log(`error: ${error.message} (${error.name})`);
            }
          }
          return;
        }
        if (argv.length === 6) {
          const payload = JSON.parse(argv[5]) as LGTV.RequestPayload;
          const lgtvRequest: LGTV.Request = {
            uri,
            payload,
          };
          console.log(JSON.stringify(lgtvRequest, null, 2));
          try {
            const lgtvResponse = await backendControl.lgtvCommand(lgtvRequest);
            console.log(JSON.stringify(lgtvResponse, null, 2));
          } catch (error) {
            if (error instanceof Error) {
              console.log(`error: ${error.message} (${error.name})`);
            }
          }
        }
      };

      asyncConnect().catch((error: unknown) => {
        if (error instanceof Error) {
          console.log(`error: ${error.message} (${error.name})`);
        }
      });
    });
  } else {
    console.log("usage:");
    console.log("  lgtv run <udn-index> <command> [<payload>]");
    console.log("example:");
    console.log(
      "  lgtv run 0 'com.webos.applicationManager/launch' '{ \"id\": \"amazon\" }'",
    );
  }
}

async function lgtvCommand(): Promise<void> {
  const argv: string[] = process.argv;

  const backend = await getBackend();
  if (argv.length === 2) {
    console.log("usage:");
    console.log("  lgtv udns|cmds|run [..]");
    console.log("example:");
    console.log("  lgtv udns");
    return;
  }

  switch (argv[2]) {
    case "cmds": {
      lgtvCmdsCommand(backend);
      break;
    }
    case "udns": {
      lgtvUdnsCommand(backend);
      break;
    }
    case "run": {
      lgtvRunCommand(backend);
      break;
    }
    default: {
      console.log("usage:");
      console.log("  lgtv cmds|udns|run [..]");
      console.log("example:");
      console.log("  lgtv udns");
    }
  }
}

lgtvCommand().catch(Common.Debug.debugError);

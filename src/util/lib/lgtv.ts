/* eslint-disable no-console -- This is a command line utility */
import * as fs from "node:fs/promises";
import persistPath from "persist-path";
import type LGTV from "lgtv2";
import * as Common from "../../common";
import { TvManager, type TvRecord } from "../../bridge";

export async function getTvManager(): Promise<TvManager> {
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

  //
  // I keep long term information needed to connect to each TvRecord in a database.
  // The long term information is the TvRecord's unique device name (udn), friendly name
  // (name), Internet Protocol address (ip), media access control address (mac)
  // and client key (key).
  //

  const tvManager = await TvManager.build(configurationDirectory);
  tvManager.on("error", (error: Error, id: string): void => {
    Common.Debug.debug(id);
    Common.Debug.debugError(error);
  });
  await tvManager.start();

  return tvManager;
}

function getSortedTVList(tvManager: TvManager): TvRecord.TvRecord[] {
  const tvControls = tvManager.controls();
  const udnList = tvControls.map((tvControl) => tvControl.tv.udn).sort();
  const tvList = udnList.map((udn) => tvManager.control(udn).tv);
  return tvList;
}

function lgtvCmdsCommand(tvManager: TvManager): void {
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
    "Some commands return values on my TvRecord, so I do whether they work.",
  );
}

function lgtvUdnsCommand(tvManager: TvManager): void {
  const tvList = getSortedTVList(tvManager);
  for (const [index, element] of tvList.entries()) {
    console.log(`${index.toString()}: ${element.udn}: ${element.name}`);
  }
}

function lgtvRunCommand(tvManager: TvManager): void {
  const argv: string[] = process.argv;
  if (argv.length === 5 || argv.length === 6) {
    const tvList = getSortedTVList(tvManager);
    const tv = tvList[Number.parseInt(argv[3], 10)];
    console.log(`udn: ${tv.udn}`);
    const tvControl = tvManager.control(tv.udn);
    tvControl.on("connect", () => {
      const asyncConnect = async (): Promise<void> => {
        const uri = `ssap://${argv[4]}`;
        if (argv.length === 5) {
          const lgtvRequest: LGTV.Request = {
            uri,
          };
          console.log(JSON.stringify(lgtvRequest, null, 2));
          try {
            const lgtvResponse = await tvControl.lgtvCommand(lgtvRequest);
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
            const lgtvResponse = await tvControl.lgtvCommand(lgtvRequest);
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

  const tvManager = await getTvManager();
  if (argv.length === 2) {
    console.log("usage:");
    console.log("  lgtv udns|cmds|run [..]");
    console.log("example:");
    console.log("  lgtv udns");
    return;
  }

  switch (argv[2]) {
    case "cmds": {
      lgtvCmdsCommand(tvManager);
      break;
    }
    case "udns": {
      lgtvUdnsCommand(tvManager);
      break;
    }
    case "run": {
      lgtvRunCommand(tvManager);
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

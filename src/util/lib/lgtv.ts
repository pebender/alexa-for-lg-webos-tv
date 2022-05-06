import * as fs from "fs/promises";
import LGTV from "lgtv2";
import * as Common from "../../common";
import { Configuration } from "../../bridge/lib/configuration";
import { TV } from "../../bridge/lib/tv";
import { Backend } from "../../bridge/lib/backend";

const persistPath = require("persist-path");

export async function getBackend(): Promise<Backend> {
  const configurationDir = persistPath(Common.constants.application.name.safe);

  try {
    await fs.mkdir(configurationDir, { recursive: true });
  } catch (error) {
    Common.Debug.debugErrorWithStack(error);
    throw Error;
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
    Common.Debug.debugErrorWithStack(error);
  });
  await backend.start();

  return backend;
}

function getSortedTVList(backend: Backend): TV[] {
  const backendControls = backend.controls();
  const udnList = backendControls
    .map((backendControl) => backendControl.tv.udn)
    .sort();
  const tvList = udnList.map((udn) => backend.control(udn).tv);
  return tvList;
}

function lgtvUdnCommand(backend: Backend) {
  const tvList = getSortedTVList(backend);
  for (let i = 0; i < tvList.length; i++) {
    console.log(`${i}: ${tvList[i].udn}: ${tvList[i].name}`);
  }
}

async function lgtvRunCommand(backend: Backend) {
  const argv: string[] = process.argv;
  if (argv.length === 5 || argv.length === 6) {
    const tvList = getSortedTVList(backend);
    const tv = tvList[parseInt(argv[3])];
    console.log(`udn: ${tv.udn}`);
    const backendControl = backend.control(tv.udn);
    backendControl.on("connect", async () => {
      const uri = `ssap://${argv[4]}`;
      if (argv.length === 5) {
        const lgtvRequest: LGTV.Request = {
          uri,
        };
        console.log(JSON.stringify(lgtvRequest, null, 2));
        try {
          const lgtvResponse = await backendControl.lgtvCommand(lgtvRequest);
          console.log(JSON.stringify(lgtvResponse, null, 2));
        } catch (error: any) {
          console.log(`error: ${error.message} (${error.name})`);
        }
        return;
      }
      if (argv.length === 6) {
        const payload = JSON.parse(argv[5]);
        const lgtvRequest: LGTV.Request = {
          uri,
          payload,
        };
        console.log(JSON.stringify(lgtvRequest, null, 2));
        try {
          const lgtvResponse = await backendControl.lgtvCommand(lgtvRequest);
          console.log(JSON.stringify(lgtvResponse, null, 2));
        } catch (error: any) {
          console.log(`error: ${error.message} (${error.name})`);
        }
      }
    });
  } else {
    console.log(
      "node lgtv.js run <udn-index> <ssap_command> [<ssap_command_payload>"
    );
    console.log("example:");
    console.log(
      "  node lgtv.js run 0 'com.webos.applicationManager/launch' '{ \"id\": \"amazon\" }'"
    );
  }
}

async function lgtvCommand() {
  const argv: string[] = process.argv;

  const backend = await getBackend();
  if (argv.length === 2) {
    console.log("commands: 'udn', 'run'");
    return;
  }

  switch (argv[2]) {
    case "udn":
      await lgtvUdnCommand(backend);
      break;
    case "run":
      await lgtvRunCommand(backend);
      break;
  }
}

lgtvCommand();

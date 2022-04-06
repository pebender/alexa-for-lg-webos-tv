//
// I found the 'ssap://*' LG webOS TV commands in
// <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
// These commands may be incomplete/inaccurate as the LG Connect SDK team
// <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
// since the 1.6.0 release on 09 September 2015.
//

import { Backend } from './lib/backend'
import { CustomSkill } from './lib/custom-skill'
import { DatabaseTable } from './lib/database'
import { Frontend } from './lib/frontend'
import { SmartHomeSkill } from './lib/smart-home-skill'
import fs from 'fs-extra'
const persistPath = require('persist-path')

export async function startGateway (): Promise<void> {
  const configurationDir = persistPath('UnofficialLGwebOSTVGateway')

  /*
    // This operation is synchronous. It is both expected and desired because it
    // occurs once at startup and because the directory is needed before the Unofficial
    // LG webOS TV Gateway can run.
     */
  try {
    fs.mkdirSync(configurationDir)
  } catch (error) {
    if ((error as any).code !== 'EEXIST') {
      throw error
    }
  }

  //
  // I keep long term information needed to connect to each TV in a database.
  // The long term information is the TV's unique device name (udn), friendly name
  // (name), Internet Protocol address (ip), media access control address (mac)
  // and client key (key).
  //
  const backendDb = new DatabaseTable(configurationDir, 'backend', ['udn'], 'udn')
  await backendDb.initialize()
  const frontendDb = new DatabaseTable(configurationDir, 'frontend', ['username'], 'username')
  await frontendDb.initialize()
  const backend = new Backend(backendDb)
  backend.on('error', (error: Error, id: string): void => {
    console.log(id)
    console.log(error)
  })
  await backend.initialize()
  const customSkill = new CustomSkill(backend)
  const smartHomeSkill = new SmartHomeSkill(backend)
  const frontend = new Frontend(frontendDb, customSkill, smartHomeSkill)
  await frontend.initialize()
  await frontend.start()
  await backend.start()
}

//
// I found the 'ssap://*' LG webOS TV commands in
// <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
// These commands may be incomplete/inaccurate as the LG Connect SDK team
// <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
// since the 1.6.0 release on 09 September 2015.
//

import { Backend } from './lib/backend'
import { constants } from '../common/constants'
import { DatabaseTable } from './lib/database'
import { Frontend } from './lib/frontend'
import { SmartHomeSkill } from './lib/skill'
import * as fs from 'fs/promises'
const persistPath = require('persist-path')

export async function startBridge (): Promise<void> {
  const configurationDir = persistPath(constants.application.name.safe)

  try {
    await fs.mkdir(configurationDir, { recursive: true })
  } catch (error) {
    if (error instanceof Error) {
      console.log(`error: ${error.name}: ${error.message}`)
    } else {
      if ('code' in (error as any)) {
        console.log(`error: ${(error as any).code}`)
      } else {
        console.log('error: unknown')
      }
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
  const frontendDb = new DatabaseTable(configurationDir, 'frontend', ['email', 'bearerToken'], 'email')
  await frontendDb.initialize()
  const backend = new Backend(backendDb)
  backend.on('error', (error: Error, id: string): void => {
    console.log(id)
    console.log(error)
  })
  await backend.initialize()
  const smartHomeSkill = new SmartHomeSkill(frontendDb, backend)
  const frontend = new Frontend(smartHomeSkill)
  await frontend.initialize()
  await frontend.start()
  await backend.start()
}

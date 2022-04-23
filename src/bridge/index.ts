//
// I found the 'ssap://*' LG webOS TV commands in
// <https://github.com/ConnectSDK/Connect-SDK-Android-Core/blob/master/src/com/connectsdk/service/WebOSTVService.java>.
// These commands may be incomplete/inaccurate as the LG Connect SDK team
// <http://www.svlconnectsdk.com> has not provided an update to the Connect SDK
// since the 1.6.0 release on 09 September 2015.
//

import * as Common from '../common'
import { Backend } from './lib/backend'
import { DatabaseTable } from './lib/database'
import { Frontend } from './lib/frontend'
import { Middle } from './lib/middle'
import * as fs from 'fs/promises'
const persistPath = require('persist-path')

export async function startBridge (): Promise<void> {
  const configurationDir = persistPath(Common.constants.application.name.safe)

  try {
    await fs.mkdir(configurationDir, { recursive: true })
  } catch (error) {
    Common.Debug.debugErrorWithStack(error)
    throw Error
  }

  let hostname: string = ''
  let authorizedEmails: string[] = []
  try {
    const raw = await fs.readFile(`${configurationDir}/config.json`)
    const config = JSON.parse(raw as any)

    if (typeof config.hostname === 'undefined') {
      const error = new Error('config.json is missing "hostname".')
      Common.Debug.debugErrorWithStack(error)
      process.exit(1)
    }
    hostname = config.hostname
    if (typeof config.authorizedEmails === 'undefined') {
      const error = new Error('config.json is missing "authorizedEmails".')
      Common.Debug.debugErrorWithStack(error)
      process.exit(1)
    }
    authorizedEmails = config.authorizedEmails
  } catch (error) {
    Common.Debug.debugErrorWithStack(error)
    process.exit(1)
  }

  //
  // I keep long term information needed to connect to each TV in a database.
  // The long term information is the TV's unique device name (udn), friendly name
  // (name), Internet Protocol address (ip), media access control address (mac)
  // and client key (key).
  //
  const backendDb = new DatabaseTable(configurationDir, 'backend', ['udn'], 'udn')
  await backendDb.initialize()
  const middleDb = new DatabaseTable(configurationDir, 'middle', ['email', 'bearerToken'], 'email')
  await middleDb.initialize()
  const backend = new Backend(backendDb)
  backend.on('error', (error: Error, id: string): void => {
    Common.Debug.debug(id)
    Common.Debug.debugErrorWithStack(error)
  })
  await backend.initialize()
  const middle = new Middle(authorizedEmails, middleDb, backend)
  const frontend = new Frontend(hostname, authorizedEmails, middle)
  await frontend.initialize()
  await frontend.start()
  await backend.start()
}

import { constants } from '../../../../common/constants'
import * as fs from 'fs'
import * as path from 'path'
import jwt from 'jsonwebtoken'

export const x509Key = fs.readFileSync(path.join(__dirname, constants.bridge.jwt.x509KeyFile))

export function create (x509Key: Buffer, email: string, hostname: string): Promise<string> {
  const payload: jwt.JwtPayload = {
    iss: constants.bridge.jwt.iss,
    sub: email,
    aud: `https://${hostname}/`
  }
  const options: jwt.SignOptions = {
    algorithm: 'RS256',
    expiresIn: '1m'
  }

  return new Promise((resolve, reject) => {
    jwt.sign(payload, x509Key, options, function (err, encoded) {
      if (err === null) {
        if (typeof encoded !== 'undefined') {
          resolve(encoded)
        } else {
          reject(new Error())
        }
      } else {
        reject(err)
      }
    })
  })
}

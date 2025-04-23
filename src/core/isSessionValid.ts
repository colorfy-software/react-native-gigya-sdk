import { NativeModules } from 'react-native'
const { GigyaSdk } = NativeModules

import handleSdkCall from '../internals/handleSdkCall'

export default function (): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await handleSdkCall<boolean>(GigyaSdk.isSessionValid(), {
        noParsing: true,
      })

      resolve(response)
    } catch (e) {
      reject(e)
    }
  })
}

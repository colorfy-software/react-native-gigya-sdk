import { NativeModules } from 'react-native'
const { GigyaSdk } = NativeModules

import clearState from '../internals/clearState'

export default function (): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      const isLoggedIn = await GigyaSdk.isLoggedIn()
      let response = true

      if (isLoggedIn) {
        try {
          response = await GigyaSdk.logout()
        } catch (err) {}
      }

      await clearState()

      resolve(response)
    } catch (e) {
      reject(e)
    }
  })
}

import { NativeModules } from 'react-native'
const { GigyaSdk } = NativeModules

import type { GigyaSdkStateType } from '../types'

import { initialState, setState } from '../internals/state'

interface ConfigType {
  dataCenter: string
  lang?: GigyaSdkStateType['lang']
  apiKey: GigyaSdkStateType['apiKey']
  encryptedStorageKey?: GigyaSdkStateType['encryptedStorageKey']
}

export default function (config: ConfigType): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      const newState: Partial<GigyaSdkStateType> = {
        apiKey: config.apiKey,
        lang: config.lang || initialState.lang,
        encryptedStorageKey: config.encryptedStorageKey,
      }

      await setState(newState)

      resolve(GigyaSdk.initialize(config))
    } catch (e) {
      reject(e)
    }
  })
}

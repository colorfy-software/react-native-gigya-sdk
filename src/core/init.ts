import { NativeModules } from 'react-native'
const { GigyaSdk } = NativeModules

import type { GigyaSdkStateType } from '../types'

import getState from './getState'
import { setState } from '../internals/state'

interface ConfigType {
  lang?: GigyaSdkStateType['lang']
  apiKey?: GigyaSdkStateType['apiKey']
  storage?: GigyaSdkStateType['storage']
  dataCenter?: GigyaSdkStateType['dataCenter']
  storageKey?: GigyaSdkStateType['storageKey']
}

export default function (config: ConfigType): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      await setState(config)

      const updatedState = await getState()

      const updatedConfig: ConfigType = {
        lang: updatedState.lang,
        apiKey: updatedState.apiKey,
        storage: updatedState.storage!,
        dataCenter: updatedState.dataCenter,
        storageKey: updatedState.storageKey,
      }

      resolve(GigyaSdk.initialize(updatedConfig))
    } catch (e) {
      reject(e)
    }
  })
}

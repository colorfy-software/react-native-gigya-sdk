import { NativeModules } from 'react-native'
const { GigyaSdk } = NativeModules

import type { GigyaSdkSessionType } from '../types'

import handleSdkCall from '../internals/handleSdkCall'

export default function <OutputType extends GigyaSdkSessionType>(): Promise<OutputType> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await handleSdkCall<OutputType>(GigyaSdk.getSession())

      resolve(response)
    } catch (e) {
      reject(e)
    }
  })
}

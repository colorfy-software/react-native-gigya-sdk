import { NativeModules } from 'react-native'
const { GigyaSdk } = NativeModules

import type { GigyaSdkAccountInfoType } from '../types'

import handleSdkCall from '../internals/handleSdkCall'

export default function <
  OutputType extends GigyaSdkAccountInfoType
>(): Promise<OutputType> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await handleSdkCall<OutputType>(GigyaSdk.getAccount())

      resolve(response)
    } catch (e) {
      reject(e)
    }
  })
}

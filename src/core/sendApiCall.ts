import { NativeModules } from 'react-native'
const { GigyaSdk } = NativeModules

import handleSdkCall from '../internals/handleSdkCall'

export default function <
  OutputType,
  ParamsType extends Record<string | number, unknown> = Record<string | number, unknown>
>(apiEndPoint: string, params?: ParamsType): Promise<OutputType> {
  return new Promise(async (resolve, reject) => {
    const values = params || ({} as ParamsType)

    try {
      for (let key in values) {
        if (typeof values[key] === 'object') {
          values[key] = JSON.stringify(values[key]) as any
        }
      }

      const response = await handleSdkCall(GigyaSdk.sendApiCall(apiEndPoint, JSON.stringify(values)))

      resolve(response as OutputType)
    } catch (e) {
      reject(e)
    }
  })
}

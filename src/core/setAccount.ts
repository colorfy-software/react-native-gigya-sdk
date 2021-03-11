import { NativeModules } from 'react-native'
const { GigyaSdk } = NativeModules

import handleSdkCall from '../internals/handleSdkCall'

export default function <
  OutputType,
  DataType extends Record<string | number, unknown>
>(data: DataType): Promise<OutputType> {
  return new Promise(async (resolve, reject) => {
    let values = data

    try {
      for (let key in values) {
        if (typeof values[key] === 'object') {
          values[key] = JSON.stringify(values[key]) as any
        }
      }

      const response = await handleSdkCall<OutputType>(
        GigyaSdk.setAccount(JSON.stringify(values))
      )

      resolve(response)
    } catch (e) {
      reject(e)
    }
  })
}

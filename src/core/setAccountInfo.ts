import type { GigyaSdkApiResponseType } from '../types'

import sendApiCall from './sendApiCall'

export default function <DataType>(
  data: DataType
): Promise<GigyaSdkApiResponseType> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await sendApiCall<
        GigyaSdkApiResponseType,
        Record<keyof DataType, unknown>
      >('accounts.setAccountInfo', data)

      resolve(response)
    } catch (e) {
      reject(e)
    }
  })
}

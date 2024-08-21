import type { GigyaSdkApiResponseType } from '../types'

import getState from './getState'
import sendApiCall from './sendApiCall'

type OptionsType = {
  UID?: string
  noUID?: boolean
  regToken?: string
}

export default function <DataType>(data: DataType, options?: OptionsType): Promise<GigyaSdkApiResponseType> {
  return new Promise(async (resolve, reject) => {
    try {
      const state = await getState()
      const UID = options?.UID || state.UID

      const response = await sendApiCall<
        GigyaSdkApiResponseType,
        Record<keyof DataType, unknown> | Omit<OptionsType, 'noUID'>
      >('accounts.setAccountInfo', {
        ...(options?.noUID && {
          regToken: options?.regToken || state.regToken?.value,
        }),
        ...(!options?.noUID && UID && { UID }),
        ...(data ?? {}),
      })

      resolve(response)
    } catch (e) {
      reject(e)
    }
  })
}

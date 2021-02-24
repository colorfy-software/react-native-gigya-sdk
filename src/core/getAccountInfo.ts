import type { GigyaSdkAccountInfoType } from '../types'

import getState from './getState'
import sendApiCall from './sendApiCall'
import { setState } from '../internals/state'

type OptionsType = {
  UID?: string
  noUID?: boolean
  include?: string
  regToken?: string
  extraProfileFields?: string
}

export default function (
  options?: OptionsType
): Promise<GigyaSdkAccountInfoType> {
  return new Promise(async (resolve, reject) => {
    try {
      const state = await getState()

      const response = await sendApiCall<GigyaSdkAccountInfoType, OptionsType>(
        'accounts.getAccountInfo',
        {
          ...(options?.noUID && {
            regToken: options?.regToken || state.regToken?.value,
          }),
          ...(!options?.noUID && { UID: options?.UID || state.UID }),
          ...(options?.include && { include: options?.include }),
          ...(options?.extraProfileFields && {
            extraProfileFields: options?.extraProfileFields,
          }),
        }
      )

      await setState({ UID: response.UID })

      resolve(response)
    } catch (e) {
      reject(e)
    }
  })
}

import type { GigyaSdkApiResponseType } from '../types'
import getState from './getState'
import sendApiCall from './sendApiCall'

type OptionsType = {
  UID?: string
  regToken?: string
  noUID?: boolean
}

export default function (options?: OptionsType): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      const state = await getState()

      await sendApiCall<GigyaSdkApiResponseType>(
        'accounts.resendVerificationCode',
        {
          ...(options?.noUID && {
            regToken: options?.regToken || state.regToken?.value,
          }),
          ...(!options?.noUID && { UID: options?.UID || state.UID }),
        }
      )

      resolve(true)
    } catch (e) {
      reject(e)
    }
  })
}

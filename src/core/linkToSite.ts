import type { GigyaSdkAccountInfoType } from '../types'

import getState from './getState'
import sendApiCall from './sendApiCall'

type ApiCallParamsType = {
  UID?: string
  loginID: string
  password: string
  include?: string
  regToken?: string
  targetEnv: 'mobile'
}

type OptionsType = {
  UID?: string
  noUID?: boolean
  include?: string
  regToken?: string
}

export default function (loginID: string, password: string, options?: OptionsType): Promise<GigyaSdkAccountInfoType> {
  return new Promise(async (resolve, reject) => {
    try {
      const state = await getState()

      const response = await sendApiCall<GigyaSdkAccountInfoType, ApiCallParamsType>('accounts.linkAccounts', {
        loginID,
        password,
        targetEnv: 'mobile',
        ...(options?.noUID && {
          regToken: options?.regToken || state.regToken?.value,
        }),
        ...(!options?.noUID && { UID: options?.UID || state.UID }),
        ...(options?.include && { include: options?.include }),
      })

      resolve(response)
    } catch (e) {
      reject(e)
    }
  })
}

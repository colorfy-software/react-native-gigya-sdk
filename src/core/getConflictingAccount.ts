import type { GigyaSdkConflictingAccountType } from '../types'
import getState from './getState'

import sendApiCall from './sendApiCall'

export default function (): Promise<GigyaSdkConflictingAccountType | null> {
  return new Promise(async (resolve, reject) => {
    const state = await getState()

    try {
      const response = await sendApiCall<
        { conflictingAccount: GigyaSdkConflictingAccountType },
        { regToken: string | undefined }
      >('accounts.getConflictingAccount', {
        regToken: state.regToken?.value,
      })

      if (response.conflictingAccount) {
        return resolve(response.conflictingAccount)
      }

      reject(response)
    } catch (e) {
      reject(e)
    }
  })
}

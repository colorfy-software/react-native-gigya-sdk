import type { GigyaSdkConflictingAccountType } from '../types'

import sendApiCall from './sendApiCall'
import getState from './getState'

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

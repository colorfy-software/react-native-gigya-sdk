import type { GigyaSdkRegisteredAccountType } from '../types'

import getAccountInfo from './getAccountInfo'
import sendApiCall from './sendApiCall'
import setSession from './setSession'
import getState from './getState'

export default function (options?: {
  noSetSession?: boolean
}): Promise<GigyaSdkRegisteredAccountType> {
  return new Promise(async (resolve, reject) => {
    try {
      const state = await getState()

      const response = await sendApiCall<
        GigyaSdkRegisteredAccountType,
        { regToken: string | undefined; targetEnv: 'mobile' }
      >('accounts.finalizeRegistration', {
        regToken: state.regToken?.value,
        targetEnv: 'mobile',
      })

      const { sessionToken, sessionSecret } = response?.sessionInfo

      if (options?.noSetSession) {
        return resolve(response)
      }

      await setSession(sessionToken, sessionSecret)

      const account = await getAccountInfo({ noUID: true })

      resolve({ ...account, sessionInfo: response.sessionInfo })
    } catch (e) {
      reject(e)
    }
  })
}

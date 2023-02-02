import type { GigyaSdkRegisteredAccountType } from '../types'

import getState from './getState'
import isLoggedIn from './isLoggedIn'
import sendApiCall from './sendApiCall'

type ParamsType = {
  include?: string
}

export default function (params?: ParamsType): Promise<GigyaSdkRegisteredAccountType | false> {
  return new Promise(async (resolve, reject) => {
    try {
      const state = await getState()

      if (await isLoggedIn()) {
        const response = await sendApiCall<GigyaSdkRegisteredAccountType, ParamsType & { targetEnv: 'mobile' }>(
          'accounts.verifyLogin',
          {
            ...(state.UID && { UID: state.UID }),
            ...(params?.include && { include: params?.include }),
            targetEnv: 'mobile',
          }
        )

        return resolve(response)
      }

      resolve(false)
    } catch (e) {
      reject(e)
    }
  })
}

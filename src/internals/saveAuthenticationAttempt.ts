import type { GigyaSdkErrorType, GigyaSdkStateType } from '../types'

import getState from '../core/getState'
import { setState } from './state'

type ProviderType = Exclude<
  Exclude<GigyaSdkStateType['authenticationAttempt'], undefined>['type'],
  undefined
>

// TODO: Use on socialLogin/smsLogin error.

export default function (
  type: ProviderType,
  error: GigyaSdkErrorType
): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const state = await getState()
      await setState({
        error: error ?? state.error,
        authenticationAttempt: { type },
        regToken: {
          value: error?.payload?.regToken ?? state.regToken?.value,
          expirationDate: error?.payload?.regToken
            ? new Date(new Date().setHours(new Date().getHours() + 1))
            : state.regToken?.expirationDate,
          isStillValid: error?.payload?.regToken
            ? true
            : new Date().getTime() >=
              new Date(state.regToken?.expirationDate as Date).getTime(),
        },
      })

      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

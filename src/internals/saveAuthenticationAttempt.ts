import type { GigyaSdkErrorType, GigyaSdkStateType } from '../types'

import { setState } from './state'
import getState from '../core/getState'

type ProviderType = Exclude<
  Exclude<GigyaSdkStateType['authenticationAttempt'], undefined>['type'],
  undefined
>

// TODO: Use on smsLogin error.

export default function (
  type: ProviderType,
  error: GigyaSdkErrorType
): Promise<void> {
  return new Promise<void>(async (resolve, reject) => {
    try {
      const state = await getState()
      const incomingRegToken = error?.payload?.regToken
      const existingRegToken = state.regToken?.value

      const value = incomingRegToken || existingRegToken
      const expirationDate =
        incomingRegToken && incomingRegToken !== existingRegToken
          ? new Date(new Date().setHours(new Date().getHours() + 1))
          : state.regToken?.expirationDate
      const isStillValid =
        expirationDate &&
        new Date(expirationDate).getTime() >= new Date().getTime()

      await setState({
        error: error ?? state.error,
        authenticationAttempt: { type },
        regToken: { value, expirationDate, isStillValid },
      })

      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

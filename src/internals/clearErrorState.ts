import type { GigyaSdkStateType } from '../types'

import { setState } from './state'

// TODO: Use on smsLogin success.

export default function (): Promise<GigyaSdkStateType> {
  return new Promise(async (resolve, reject) => {
    try {
      const output = await setState({
        error: undefined,
        regToken: undefined,
        authenticationAttempt: undefined,
      })

      resolve(output)
    } catch (e) {
      reject(e)
    }
  })
}

import type { GigyaSdkStateType } from '../types'

import { setState } from './state'
import getState from '../core/getState'

export default function (): Promise<GigyaSdkStateType> {
  return new Promise(async (resolve, reject) => {
    try {
      const state = await getState()

      const output = await setState({
        UID: undefined,
        error: undefined,
        regToken: undefined,
        lang: state.lang || 'en',
        authenticationAttempt: undefined,
      })

      resolve(output)
    } catch (e) {
      reject(e)
    }
  })
}

import { NativeModules } from 'react-native'
const { GigyaSdk } = NativeModules

import type { GigyaSdkAccountInfoType } from '../types'

import logout from './logout'
import isGigyaError from './isGigyaError'
import { setState } from '../internals/state'
import formatParams from '../internals/formatParams'
import handleSdkCall from '../internals/handleSdkCall'
import clearErrorState from '../internals/clearErrorState'
import saveAuthenticationAttempt from '../internals/saveAuthenticationAttempt'

export default function <ParamsType extends Record<string, unknown>>(
  email: string,
  password: string,
  params?: ParamsType
): Promise<GigyaSdkAccountInfoType> {
  return new Promise(async (resolve, reject) => {
    try {
      await logout()

      const response = await handleSdkCall<GigyaSdkAccountInfoType>(
        GigyaSdk.login(email, password, formatParams(params || {}))
      )

      await setState({ UID: response.UID })

      try {
        await clearErrorState()
      } catch (err) {}

      resolve(response)
    } catch (e) {
      if (await isGigyaError(e)) {
        try {
          await saveAuthenticationAttempt('email', e)
        } catch (err) {
          return reject(err)
        }
      }

      reject(e)
    }
  })
}

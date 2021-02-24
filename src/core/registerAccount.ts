import { NativeModules } from 'react-native'
const { GigyaSdk } = NativeModules

import type { GigyaSdkRegisteredAccountType } from '../types'

import logout from './logout'
import getState from './getState'
import isGigyaError from './isGigyaError'
import handleSdkCall from '../internals/handleSdkCall'
import saveAuthenticationAttempt from '../internals/saveAuthenticationAttempt'
import clearErrorState from '../internals/clearErrorState'

interface DefaultParamsType {
  lang?: string
}

export default function <ParamsType extends DefaultParamsType>(
  email: string,
  password: string,
  params?: ParamsType
): Promise<GigyaSdkRegisteredAccountType> {
  return new Promise(async (resolve, reject) => {
    try {
      await logout()
      const state = await getState()

      let values = params || ({} as ParamsType)
      values.lang = values?.lang || state.lang

      const response = await handleSdkCall<GigyaSdkRegisteredAccountType>(
        GigyaSdk.registerAccount(email, password, JSON.stringify(values))
      )

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

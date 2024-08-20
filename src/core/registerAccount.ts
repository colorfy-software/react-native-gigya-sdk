import { NativeModules } from 'react-native'
const { GigyaSdk } = NativeModules

import type { GigyaSdkRegisteredAccountType } from '../types'

import logout from './logout'
import getState from './getState'
import isGigyaError from './isGigyaError'
import formatParams from '../internals/formatParams'
import handleSdkCall from '../internals/handleSdkCall'
import clearErrorState from '../internals/clearErrorState'
import saveAuthenticationAttempt from '../internals/saveAuthenticationAttempt'

interface DefaultParamsType {
  lang?: string
}

export default function <ParamsType extends Record<string, unknown>>(
  email: string,
  password: string,
  params?: ParamsType
): Promise<GigyaSdkRegisteredAccountType> {
  return new Promise(async (resolve, reject) => {
    try {
      await logout()

      const state = await getState()

      let values: DefaultParamsType = params || {}
      values.lang = values?.lang || state.lang

      const response = await handleSdkCall<GigyaSdkRegisteredAccountType>(
        GigyaSdk.registerAccount(email, password, formatParams(values))
      )

      try {
        await clearErrorState()
      } catch (err) {}

      resolve(response)
    } catch (e) {
      if (await isGigyaError(e)) {
        try {
          await saveAuthenticationAttempt('site', e)
        } catch (err) {
          return reject(err)
        }
      }
      reject(e)
    }
  })
}

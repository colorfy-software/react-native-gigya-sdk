import { NativeModules } from 'react-native'
const { GigyaSdk } = NativeModules

import type { GigyaSdkAccountInfoType, GigyaSdkLoginType } from '../types'

import logout from './logout'
import getState from './getState'
import isGigyaError from './isGigyaError'
import { setState } from '../internals/state'
import handleSdkCall from '../internals/handleSdkCall'
import clearErrorState from '../internals/clearErrorState'
import saveAuthenticationAttempt from '../internals/saveAuthenticationAttempt'

export default function <ParamsType extends Record<string, unknown>>(
  provider: Exclude<GigyaSdkLoginType['loginProvider'], 'site'>,
  params?: ParamsType
): Promise<GigyaSdkAccountInfoType> {
  return new Promise(async (resolve, reject) => {
    if (params?.loginMode && !params.regToken) {
      reject(
        new Error(
          "regToken is required when using loginMode. Use GigyaSdk.linkToSocialProvider() instead if you're trying to resolve an account conflict."
        )
      )
    }

    try {
      const state = await getState()
      const { lang, ...rest } = params || { lang: state.lang }

      await logout()

      const response = await handleSdkCall<GigyaSdkAccountInfoType>(
        GigyaSdk.socialLogin(
          provider,
          JSON.stringify({ lang, ...(rest && rest) })
        )
      )

      await setState({ UID: response.UID })

      try {
        await clearErrorState()
      } catch (err) {}

      resolve(response)
    } catch (e) {
      if (await isGigyaError(e)) {
        try {
          await saveAuthenticationAttempt(provider, e)
        } catch (err) {
          return reject(err)
        }
      }

      reject(e)
    }
  })
}

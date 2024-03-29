import { NativeModules } from 'react-native'
const { GigyaSdk } = NativeModules

import type { GigyaSdkAccountInfoType, GigyaSdkSocialProvidersType } from '../types'

import getState from './getState'
import isGigyaError from './isGigyaError'
import { setState } from '../internals/state'
import formatParams from '../internals/formatParams'
import handleSdkCall from '../internals/handleSdkCall'
import clearErrorState from '../internals/clearErrorState'
import saveAuthenticationAttempt from '../internals/saveAuthenticationAttempt'

export default function <ParamsType extends Record<string, unknown>>(
  provider: GigyaSdkSocialProvidersType,
  params?: ParamsType
): Promise<GigyaSdkAccountInfoType> {
  return new Promise(async (resolve, reject) => {
    try {
      const state = await getState()
      const { regToken, ...rest } = params || {
        regToken: state.regToken?.value,
      }

      const response = await handleSdkCall<GigyaSdkAccountInfoType>(
        GigyaSdk.socialLogin(provider, formatParams({ regToken, loginMode: 'link', ...(rest && rest) }))
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

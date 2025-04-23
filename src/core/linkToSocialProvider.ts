import { NativeModules } from 'react-native'
const { GigyaSdk } = NativeModules

import {
  GigyaSdkErrorType,
  GigyaSdkAccountInfoType,
  GigyaSdkLinkAccountVersions,
  GigyaSdkSocialProvidersType,
  GigyaSdkLoginErrorPayloadType,
} from '../types'

import getState from './getState'
import sendApiCall from './sendApiCall'
import isGigyaError from './isGigyaError'
import { setState } from '../internals/state'
import getAccountInfo from './getAccountInfo'
import formatParams from '../internals/formatParams'
import handleSdkCall from '../internals/handleSdkCall'
import clearErrorState from '../internals/clearErrorState'
import saveAuthenticationAttempt from '../internals/saveAuthenticationAttempt'

export default function <
  ParamsType extends Record<string, unknown> & {
    regToken?: GigyaSdkLoginErrorPayloadType['regToken']
    sessionInfo?: GigyaSdkLoginErrorPayloadType['sessionInfo']
  }
>(provider: GigyaSdkSocialProvidersType, params?: ParamsType): Promise<GigyaSdkAccountInfoType> {
  return new Promise(async (resolve, reject) => {
    const resolvePromise = async (output: GigyaSdkAccountInfoType) => {
      try {
        await clearErrorState()
      } catch (err) {}

      resolve(output)
    }

    try {
      const state = await getState()
      let { sessionInfo, regToken, ...rest } = params || {
        sessionInfo: state.sessionInfo,
        regToken: state.regToken?.value,
      }
      sessionInfo = params?.sessionInfo || state.sessionInfo

      if (state.linkAccountVersion === GigyaSdkLinkAccountVersions.V1) {
        const responseV1 = await handleSdkCall<GigyaSdkAccountInfoType>(
          GigyaSdk.socialLogin(provider, formatParams({ regToken, loginMode: 'link', ...(rest && rest) }))
        )
        await setState({ UID: responseV1.UID })
        return resolvePromise(responseV1)
      } else {
        if (!sessionInfo?.provider) throw new Error("no 'sessionInfo.provider' param provided")
        else if (!sessionInfo?.access_token) throw new Error("no 'sessionInfo.access_token' param provided")

        const existingAccount = await GigyaSdk.socialLogin(provider, formatParams({ ...(rest && rest) }))

        await setState({ UID: existingAccount.UID })

        await sendApiCall('accounts.notifySocialLogin', {
          targetEnv: 'mobile',
          loginMode: 'connect',
          providerSessions: {
            [sessionInfo.provider]: {
              authToken: sessionInfo.access_token,
            },
          },
        })

        return resolvePromise(await getAccountInfo())
      }
    } catch (e) {
      if (await isGigyaError(e as GigyaSdkErrorType)) {
        try {
          await saveAuthenticationAttempt(provider, e as GigyaSdkErrorType)
        } catch (err) {
          return reject(err)
        }
      }

      reject(e)
    }
  })
}

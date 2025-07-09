import { NativeModules } from 'react-native'
const { GigyaSdk } = NativeModules

import {
  GigyaSdkErrorType,
  GigyaSdkAccountInfoType,
  GigyaSdkLinkAccountVersions,
  GigyaSdkLoginErrorPayloadType,
} from '../types'

import getState from './getState'
import sendApiCall from './sendApiCall'
import isGigyaError from './isGigyaError'
import getAccountInfo from './getAccountInfo'
import { setState } from '../internals/state'
import handleSdkCall from '../internals/handleSdkCall'
import clearErrorState from '../internals/clearErrorState'
import saveAuthenticationAttempt from '../internals/saveAuthenticationAttempt'

type ApiCallParamsType = {
  UID?: string
  loginID: string
  password: string
  include?: string
  regToken?: string
  targetEnv: 'mobile'
}

type OptionsType = {
  UID?: string
  noUID?: boolean
  include?: string
  regToken?: string
  sessionInfo?: GigyaSdkLoginErrorPayloadType['sessionInfo']
}

export default function (loginID: string, password: string, options?: OptionsType): Promise<GigyaSdkAccountInfoType> {
  return new Promise(async (resolve, reject) => {
    const state = await getState()
    const isUsingLinkAccountV1 = state.linkAccountVersion === GigyaSdkLinkAccountVersions.V1

    const resolvePromise = async (output: GigyaSdkAccountInfoType) => {
      try {
        await clearErrorState()
      } catch (err) {}

      resolve(output)
    }

    try {
      const sessionInfo = options?.sessionInfo || state.sessionInfo

      if (isUsingLinkAccountV1) {
        const response = await sendApiCall<GigyaSdkAccountInfoType, ApiCallParamsType>('accounts.linkAccounts', {
          loginID,
          password,
          targetEnv: 'mobile',
          ...(options?.noUID && {
            regToken: options?.regToken || state.regToken?.value,
          }),
          ...(!options?.noUID && { UID: options?.UID || state.UID }),
          ...(options?.include && { include: options?.include }),
        })

        return resolvePromise(response)
      } else {
        if (!sessionInfo?.provider) throw new Error("no 'sessionInfo.provider' param provided")
        else if (!sessionInfo?.access_token) throw new Error("no 'sessionInfo.access_token' param provided")

        const existingAccount = await handleSdkCall<GigyaSdkAccountInfoType>(GigyaSdk.login(loginID, password, '{}'))

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
      if (!isUsingLinkAccountV1 && (await isGigyaError(e as GigyaSdkErrorType))) {
        try {
          await saveAuthenticationAttempt('site', e as GigyaSdkErrorType)
        } catch (err) {
          return reject(err)
        }
      }

      reject(e)
    }
  })
}

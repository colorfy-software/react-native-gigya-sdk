import {
  GigyaSdkErrors,
  GigyaSdkStateType,
  GigyaSdkErrorType,
  GigyaSdkErrorCodes,
  GigyaSdkAccountInfoType,
  GigyaSdkRegisteredAccountType,
  GigyaSdkConflictingAccountType,
} from '../types'

import getState from './getState'
import setSession from './setSession'
import isGigyaError from './isGigyaError'
import getAccountInfo from './getAccountInfo'
import finalizeRegistration from './finalizeRegistration'
import clearErrorState from '../internals/clearErrorState'
import getConflictingAccount from './getConflictingAccount'
import grantRequiredConsents from './grantRequiredConsents'
import resendVerificationEmail from './resendVerificationEmail'
import getUnacceptedConsentSchemas from './getUnacceptedConsentSchemas'
import saveAuthenticationAttempt from '../internals/saveAuthenticationAttempt'

type ProviderType = Exclude<Exclude<GigyaSdkStateType['authenticationAttempt'], undefined>['type'], undefined>

type OptionsType = {
  noFinalize?: boolean
  noSetSession?: boolean
  isRegistration?: boolean
  error?: GigyaSdkErrorType
}

type ActionRequiredType =
  | { type: 'emailVerification' }
  | {
      type: 'acceptToS'
      callback: () => Promise<InternalOutputType>
    }
  | {
      type: 'conflictingAccount'
      loginId?: GigyaSdkConflictingAccountType['loginID']
      loginProviders?: GigyaSdkConflictingAccountType['loginProviders']
    }

type InternalOutputType =
  | {
      handled: false
      error: GigyaSdkErrorType | undefined
    }
  | {
      handled: true
      account: GigyaSdkAccountInfoType | GigyaSdkRegisteredAccountType
    }
  | {
      handled: true
      regTokenExpired: true
      error: GigyaSdkErrorType | undefined
    }
  | {
      handled: true
      actionRequired: ActionRequiredType
      error: GigyaSdkErrorType | undefined
    }

type OutputType = {
  handled: boolean
  regTokenExpired?: boolean
  actionRequired?: {
    loginId?: string
    callback: () => Promise<InternalOutputType>
    loginProviders?: GigyaSdkConflictingAccountType['loginProviders']
    type: 'acceptToS' | 'conflictingAccount' | 'emailVerification'
  }
  error: GigyaSdkErrorType | undefined
  account?: GigyaSdkAccountInfoType | GigyaSdkRegisteredAccountType
}

const handleExpiredRegToken = (error?: GigyaSdkErrorType): Promise<InternalOutputType> =>
  new Promise(async (resolve) => {
    resolve({
      error,
      handled: true,
      regTokenExpired: true,
    })
  })

const handlePendingVerification = (error?: GigyaSdkErrorType): Promise<InternalOutputType> =>
  new Promise(async (resolve) => {
    await resendVerificationEmail({ noUID: true })
    resolve({
      error,
      handled: true,
      actionRequired: { type: 'emailVerification' },
    })
  })

const handleConflictingAccount = (error?: GigyaSdkErrorType): Promise<InternalOutputType> =>
  new Promise(async (resolve) => {
    try {
      const conflictingAccount = error?.payload?.loginProviders ? error.payload : await getConflictingAccount()

      resolve({
        error,
        handled: true,
        actionRequired: {
          type: 'conflictingAccount',
          loginId: conflictingAccount?.loginID,
          loginProviders: conflictingAccount?.loginProviders,
        },
      })
    } catch (e) {
      resolve({
        error,
        handled: true,
        actionRequired: { type: 'conflictingAccount' },
      })
    }
  })

const onConsentSchemasAcceptance = (options?: OptionsType): Promise<InternalOutputType> =>
  new Promise(async (resolve, reject) => {
    try {
      try {
        await grantRequiredConsents(options)
      } catch (e) {}

      const account = await getAccountInfo({ noUID: true })

      if (!account.isVerified) {
        const state = await getState()
        return resolve({
          handled: true,
          error: state.error,
          actionRequired: { type: 'emailVerification' },
        })
      }

      if (!account.isRegistered && !options?.noFinalize) {
        const response = await finalizeRegistration(options)

        if (!options?.noSetSession) {
          try {
            await setSession(response.sessionInfo.sessionToken, response.sessionInfo.sessionSecret)
          } catch (e) {}
        }

        await clearErrorState()

        return resolve({ handled: true, account: response })
      }

      await clearErrorState()

      resolve({ handled: true, account })
    } catch (e) {
      reject(e)
    }
  })

const handlePendingRegistration = (error?: GigyaSdkErrorType, options?: OptionsType): Promise<InternalOutputType> =>
  new Promise(async (resolve, reject) => {
    try {
      const unacceptedConsentSchemas = await getUnacceptedConsentSchemas()

      if (unacceptedConsentSchemas !== null) {
        if (options?.isRegistration) {
          return resolve(await onConsentSchemasAcceptance(options))
        }

        return resolve({
          error,
          handled: true,
          actionRequired: { type: 'acceptToS', callback: onConsentSchemasAcceptance },
        })
      }

      const account = await getAccountInfo({ noUID: true })

      if (!account.isVerified) {
        return resolve(await handlePendingVerification(error))
      }

      if (!account.isRegistered && !options?.noFinalize) {
        const response = await finalizeRegistration(options)

        if (!options?.noSetSession) {
          try {
            await setSession(response.sessionInfo.sessionToken, response.sessionInfo.sessionSecret)
          } catch (e) {}
        }

        await clearErrorState()

        return resolve({ handled: true, account: response })
      }

      resolve({ handled: false, error })
    } catch (e) {
      reject(e)
    }
  })

export default function (type: ProviderType, options?: OptionsType): Promise<OutputType> {
  return new Promise(async (resolve, reject) => {
    try {
      const state = await getState()
      const error = options?.error || state.error

      let output: InternalOutputType = { handled: false, error }

      if (error && (await isGigyaError(error))) {
        await saveAuthenticationAttempt(type, error)
      } else {
        return resolve(output)
      }

      if (!state.regToken?.isStillValid) {
        output = await handleExpiredRegToken(error)
        return resolve(output as OutputType)
      }

      if (
        error?.payload?.errorCode !== GigyaSdkErrorCodes.ConflictingAccount &&
        error?.code === GigyaSdkErrors.ConflictingAccount
      ) {
        output = await handleConflictingAccount(error)
        return resolve(output as OutputType)
      }

      if (error?.payload?.validationErrors?.filter((validationError) => validationError.fieldName === 'email')) {
        output = await handleConflictingAccount(error)
        return resolve(output as OutputType)
      }

      switch (error?.payload?.errorCode) {
        case GigyaSdkErrorCodes.PendingRegistration:
          output = await handlePendingRegistration(error, options)
          break
        case GigyaSdkErrorCodes.PendingVerification:
          output = await handlePendingVerification(error)
          break
        case GigyaSdkErrorCodes.ConflictingAccount:
          output = await handleConflictingAccount(error)
          break
        default:
          break
      }

      resolve(output as OutputType)
    } catch (err) {
      reject(err)
    }
  })
}

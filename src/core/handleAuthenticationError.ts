import {
  GigyaSdkErrors,
  GigyaSdkStateType,
  GigyaSdkErrorType,
  GigyaSdkErrorCodes,
  GigyaSdkAccountInfoType,
  GigyaSdkConflictingAccountType,
  GigyaSdkRegisteredAccountType,
} from '../types'

import getState from './getState'
import isGigyaError from './isGigyaError'
import getAccountInfo from './getAccountInfo'
import finalizeRegistration from './finalizeRegistration'
import acceptConsentSchemas from './acceptConsentSchemas'
import clearErrorState from '../internals/clearErrorState'
import getConflictingAccount from './getConflictingAccount'
import resendVerificationEmail from './resendVerificationEmail'
import getUnacceptedConsentSchemas from './getUnacceptedConsentSchemas'
import saveAuthenticationAttempt from '../internals/saveAuthenticationAttempt'
import setSession from './setSession'

type ProviderType = Exclude<
  Exclude<GigyaSdkStateType['authenticationAttempt'], undefined>['type'],
  undefined
>

type OptionsType = {
  error?: GigyaSdkErrorType
  noSetSession?: boolean
  noFinalize?: boolean
  isRegistration?: boolean
}

type ActionRequiredType =
  | { type: 'emailVerification' }
  | {
      type: 'acceptToS'
      callback: () => Promise<InternalOutputType>
    }
  | {
      type: 'conflictingAccount'
      loginId?: string
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

const handleExpiredRegToken = (
  error?: GigyaSdkErrorType
): Promise<InternalOutputType> =>
  new Promise(async (resolve) => {
    resolve({
      handled: true,
      regTokenExpired: true,
      error,
    })
  })

const handlePendingVerification = (
  error?: GigyaSdkErrorType
): Promise<InternalOutputType> =>
  new Promise(async (resolve) => {
    await resendVerificationEmail({ noUID: true })
    resolve({
      actionRequired: { type: 'emailVerification' },
      handled: true,
      error,
    })
  })

const handleConflictingAccount = (
  error?: GigyaSdkErrorType
): Promise<InternalOutputType> =>
  new Promise(async (resolve) => {
    try {
      const conflictingAccount = error?.payload?.loginProviders
        ? error.payload
        : await getConflictingAccount()

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
        actionRequired: {
          type: 'conflictingAccount',
        },
      })
    }
  })

const onConsentSchemasAcceptance = (
  options?: OptionsType
): Promise<InternalOutputType> =>
  new Promise(async (resolve, reject) => {
    try {
      const state = await getState()
      const unacceptedConsentSchemas = await getUnacceptedConsentSchemas<
        string[]
      >()

      if (unacceptedConsentSchemas) {
        await acceptConsentSchemas(unacceptedConsentSchemas, { noUID: true })
      }

      const account = await getAccountInfo({ noUID: true })

      if (!account.isVerified) {
        const output = await handlePendingVerification(state.error)
        return resolve(output)
      }

      if (!account.isRegistered && !options?.noFinalize) {
        const response = await finalizeRegistration(options)

        if (!options?.noSetSession) {
          try {
            await setSession(
              response.sessionInfo.sessionToken,
              response.sessionInfo.sessionSecret
            )
          } catch (e) {}
        }

        await clearErrorState()

        return resolve({ handled: true, account: response })
      }

      await clearErrorState()

      resolve({
        handled: true,
        account,
      })
    } catch (e) {
      reject(e)
    }
  })

const handlePendingRegistration = (
  error?: GigyaSdkErrorType,
  options?: OptionsType
): Promise<InternalOutputType> =>
  new Promise(async (resolve, reject) => {
    try {
      const unacceptedConsentSchemas = await getUnacceptedConsentSchemas<
        string[]
      >()

      if (unacceptedConsentSchemas?.length) {
        if (options?.isRegistration) {
          const output = await onConsentSchemasAcceptance(options)
          return resolve(output)
        }

        return resolve({
          handled: true,
          actionRequired: {
            type: 'acceptToS',
            callback: onConsentSchemasAcceptance,
          },
          error,
        })
      }

      const account = await getAccountInfo({ noUID: true })

      if (!account.isVerified) {
        const output = await handlePendingVerification(error)
        return resolve(output)
      }

      if (!account.isRegistered && !options?.noFinalize) {
        const response = await finalizeRegistration(options)

        if (!options?.noSetSession) {
          try {
            await setSession(
              response.sessionInfo.sessionToken,
              response.sessionInfo.sessionSecret
            )
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

export default function (
  type: ProviderType,
  options?: OptionsType
): Promise<OutputType> {
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

      if (
        error?.payload?.validationErrors?.filter(
          (validationError) => validationError.fieldName === 'email'
        )
      ) {
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

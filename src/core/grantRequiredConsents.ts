import type { GigyaSdkAccountInfoType, GigyaSdkRegisteredAccountType } from '../types'

import setSession from './setSession'
import getAccountInfo from './getAccountInfo'
import acceptConsentSchemas from './acceptConsentSchemas'
import finalizeRegistration from './finalizeRegistration'
import declineConsentSchemas from './declineConsentSchemas'
import resendVerificationEmail from './resendVerificationEmail'
import getUnacceptedConsentSchemas from './getUnacceptedConsentSchemas'

export default function (options?: {
  noFinalize?: boolean
  noSetSession?: boolean
}): Promise<GigyaSdkAccountInfoType | GigyaSdkRegisteredAccountType> {
  return new Promise(async (resolve, reject) => {
    try {
      const unacceptedConsentSchemas = await getUnacceptedConsentSchemas()

      if (unacceptedConsentSchemas?.acceptanceRequired) {
        await acceptConsentSchemas(unacceptedConsentSchemas.acceptanceRequired, { noUID: true })
      }

      if (unacceptedConsentSchemas?.instantiationRequired) {
        await declineConsentSchemas(unacceptedConsentSchemas.instantiationRequired, { noUID: true })
      }

      const account = await getAccountInfo({ noUID: true })

      if (!account.isVerified) {
        await resendVerificationEmail({ noUID: true })
        return reject({ actionRequired: { type: 'emailVerification' } })
      }

      if (!account.isRegistered && !options?.noFinalize) {
        const response = await finalizeRegistration(options)

        if (!options?.noSetSession) {
          try {
            await setSession(response.sessionInfo.sessionToken, response.sessionInfo.sessionSecret)
          } catch (e) {
            console.log(e)
          }
        }

        return resolve(response)
      }

      resolve(account)
    } catch (e) {
      reject(e)
    }
  })
}

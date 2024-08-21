import type { PreferencesType } from './getUnacceptedConsentSchemas'

import getState from './getState'
import sendApiCall from './sendApiCall'

type ApiCallParamsType = {
  lang: string
  regToken?: string
  preferences: Record<string, Record<string, unknown>>
}

type OptionsType = {
  UID?: string
  noUID?: boolean
  regToken?: string
}

export default function <OutputType, ConsentIdsType extends string[] = string[]>(
  consentIds: ConsentIdsType,
  options?: OptionsType
): Promise<OutputType> {
  return new Promise(async (resolve, reject) => {
    try {
      if (consentIds.length < 1) {
        return reject(new Error('No consent schema provided'))
      }

      const state = await getState()

      const preferences: PreferencesType = {} as PreferencesType

      consentIds.forEach((id) => {
        const [consentTypeOrId, subConsentId] = id.split('.')

        if (consentTypeOrId && subConsentId) {
          preferences[consentTypeOrId] = {
            ...(preferences[consentTypeOrId] ?? {}),
            [subConsentId]: { isConsentGranted: true },
          }
        } else if (consentTypeOrId && !subConsentId) {
          preferences[consentTypeOrId] = { isConsentGranted: true }
        }
      })

      const response = await sendApiCall<OutputType, ApiCallParamsType>('accounts.setAccountInfo', {
        ...(options?.noUID && {
          regToken: options?.regToken || state.regToken?.value,
        }),
        ...(!options?.noUID && { UID: options?.UID || state.UID }),
        lang: state.lang,
        preferences,
      })

      resolve(response)
    } catch (e) {
      reject(e)
    }
  })
}

import type { GigyaSdkRequiredConsentsKeysType } from '../types'

import getAccountInfo from './getAccountInfo'
import getRequiredConsentSchemas from './getRequiredConsentSchemas'

export type PreferencesType<ConsentType extends string = string, ConsentId extends string = string> = Record<
  ConsentType,
  | Record<'isConsentGranted', boolean>
  | Record<
      ConsentId,
      {
        isConsentGranted: boolean
      }
    >
>

export default function (): Promise<GigyaSdkRequiredConsentsKeysType | null> {
  return new Promise(async (resolve, reject) => {
    try {
      const mandatoryConsentSchemas = await getRequiredConsentSchemas()
      const acceptanceRequiredConsentIds = mandatoryConsentSchemas.acceptanceRequired.map((schema) => schema.key)
      const instantiationRequiredConsentIds = mandatoryConsentSchemas.instantiationRequired.map((schema) => schema.key)

      const preferences = (await getAccountInfo({ noUID: true }))?.preferences as PreferencesType | undefined

      if ((acceptanceRequiredConsentIds.length < 1 && instantiationRequiredConsentIds.length < 1) || !preferences)
        return resolve(null)

      const output: GigyaSdkRequiredConsentsKeysType = {
        instantiationRequired: [],
        acceptanceRequired: [],
      }

      acceptanceRequiredConsentIds.forEach((consentId) => {
        const [consentTypeOrId, subConsentId] = consentId.split('.')

        if (
          !preferences?.[consentId]?.isConsentGranted &&
          !(preferences?.[consentTypeOrId] as Omit<PreferencesType, 'isConsentGranted'> | undefined)?.[subConsentId]
            ?.isConsentGranted
        ) {
          output.acceptanceRequired = [...output.acceptanceRequired, consentId]
        }
      })

      instantiationRequiredConsentIds.forEach((consentId) => {
        const [consentTypeOrId, subConsentId] = consentId.split('.')

        if (
          !preferences?.[consentId]?.isConsentGranted &&
          !(preferences?.[consentTypeOrId] as Omit<PreferencesType, 'isConsentGranted'> | undefined)?.[subConsentId]
            ?.isConsentGranted
        ) {
          output.instantiationRequired = [...output.instantiationRequired, consentId]
        }
      })

      if (!output.acceptanceRequired.length && !output.instantiationRequired.length) {
        return resolve(null)
      }

      resolve(output)
    } catch (e) {
      reject(e)
    }
  })
}

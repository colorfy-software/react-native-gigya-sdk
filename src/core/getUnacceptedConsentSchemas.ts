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

export default function <OutputType>(): Promise<OutputType | null> {
  return new Promise(async (resolve, reject) => {
    try {
      const requiredConsentSchemas = await getRequiredConsentSchemas()
      const consentIds = requiredConsentSchemas.map((schema) => schema.key)

      const preferences = (await getAccountInfo({ noUID: true }))?.preferences as PreferencesType | undefined

      if (consentIds.length < 1 || !preferences) return resolve(null)

      let output: string[] = []

      consentIds.forEach((consentId) => {
        const [consentTypeOrId, subConsentId] = consentId.split('.')

        if (
          !preferences?.[consentId]?.isConsentGranted &&
          !(preferences?.[consentTypeOrId] as Omit<PreferencesType, 'isConsentGranted'> | undefined)?.[subConsentId]
            ?.isConsentGranted
        ) {
          output = [...output, consentId]
        }
      })

      if (!output.length) {
        return resolve(null)
      }

      resolve((output as unknown) as OutputType)
    } catch (e) {
      reject(e)
    }
  })
}

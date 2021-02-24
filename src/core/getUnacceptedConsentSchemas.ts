import getAccountInfo from './getAccountInfo'
import getRequiredConsentSchemas from './getRequiredConsentSchemas'

export type PreferencesType = {
  [key: string]: { isConsentGranted: boolean } & {
    [key: string]: {
      isConsentGranted: boolean
    }
  }
}

export default function <OutputType>(): Promise<OutputType | null> {
  return new Promise(async (resolve, reject) => {
    try {
      const requiredConsentSchemas = await getRequiredConsentSchemas()
      const consentSchemaKeys = requiredConsentSchemas.map(
        (schema) => schema.key
      )

      const preferences = (await getAccountInfo({ noUID: true }))
        .preferences as PreferencesType

      if (consentSchemaKeys.length < 1 || !preferences) {
        return resolve(null)
      }

      let output: string[] = []

      for (let key of consentSchemaKeys) {
        const [consentPreference, consentPreferenceKey] = key.split('.')
        if (
          !preferences?.[key]?.isConsentGranted &&
          !preferences?.[consentPreference]?.[consentPreferenceKey]
            ?.isConsentGranted
        ) {
          output = [...output, key]
        }
      }

      if (!output.length) {
        return resolve(null)
      }

      resolve((output as unknown) as OutputType)
    } catch (e) {
      reject(e)
    }
  })
}

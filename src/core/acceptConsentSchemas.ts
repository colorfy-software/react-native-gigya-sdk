import getState from './getState'
import sendApiCall from './sendApiCall'

type ApiCallParamsType = {
  regToken?: string
  lang: string
  preferences: Record<string, Record<string, unknown>>
}

type OptionsType = {
  UID?: string
  regToken?: string
  noUID?: boolean
}

export default function <OutputType, ConsentSchemasKeyType extends string[] = string[]>(
  consentSchemaKeys: ConsentSchemasKeyType,
  options?: OptionsType
): Promise<OutputType> {
  return new Promise(async (resolve, reject) => {
    try {
      if (consentSchemaKeys.length < 1) {
        return reject(new Error('No consent schema provided'))
      }

      const state = await getState()

      const preferences: Record<string, Record<string, unknown>> = {}

      for (let key of consentSchemaKeys) {
        const keyParts = key.split('.')
        let objectBuild = {}

        for (let index = keyParts.length - 1; index >= 0; index--) {
          const currentKey = keyParts[index]
          let addedValue = objectBuild

          if (index === keyParts.length - 1) {
            addedValue = { isConsentGranted: true }
          }

          if (index === 0) {
            preferences[currentKey] = {
              ...(preferences[currentKey] ?? {}),
              ...addedValue,
            }
          } else {
            const tempObjectBuild: Record<string, unknown> = {}
            tempObjectBuild[currentKey] = addedValue
            objectBuild = tempObjectBuild
          }
        }
      }

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

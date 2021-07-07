import type { GigyaConsentSchemaType } from '../types'

import sendApiCall from './sendApiCall'

type PartialGigyaSchema = {
  preferencesSchema: {
    fields: Record<string, GigyaConsentSchemaType>
  }
}

export default function (): Promise<GigyaConsentSchemaType[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const completeGigyaSchema = await sendApiCall<PartialGigyaSchema>(
        'accounts.getSchema'
      )
      let output: GigyaConsentSchemaType[] = []

      for (let key in completeGigyaSchema?.preferencesSchema?.fields) {
        const consentSchema: GigyaConsentSchemaType =
          completeGigyaSchema.preferencesSchema.fields[key]
        if (consentSchema.required) {
          consentSchema.key = key
          output = [...output, consentSchema]
        }
      }

      resolve(output)
    } catch (e) {
      reject(e)
    }
  })
}

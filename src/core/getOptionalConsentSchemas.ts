import type { GigyaSdkConsentSchemaType, GigyaSdkConsentsStatementsType } from '../types'

import sendApiCall from './sendApiCall'

type PartialGigyaSchema = {
  preferencesSchema: {
    fields: Record<string, GigyaSdkConsentSchemaType>
  }
}

export default function (): Promise<GigyaSdkConsentSchemaType[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const completeGigyaSchema = await sendApiCall<PartialGigyaSchema>('accounts.getSchema')
      const currentSiteConsents = await sendApiCall<GigyaSdkConsentsStatementsType>('accounts.getConsentsStatements')

      let output: GigyaSdkConsentSchemaType[] = []

      Object.entries(currentSiteConsents?.preferences ?? {}).forEach((entry) => {
        const consentStatementSchema = completeGigyaSchema?.preferencesSchema?.fields[entry[0]]
        if (entry[1]?.isActive && !entry[1]?.isMandatory && consentStatementSchema) {
          consentStatementSchema.key = entry[0]
          output = [...output, consentStatementSchema]
        }
      })

      resolve(output)
    } catch (e) {
      reject(e)
    }
  })
}

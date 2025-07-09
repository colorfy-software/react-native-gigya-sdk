import type {
  GigyaSdkConsentSchemaType,
  GigyaSdkConsentsStatementsType,
  GigyaSdkRequiredConsentsSchemasType,
} from '../types'

import sendApiCall from './sendApiCall'

type PartialGigyaSchema = {
  preferencesSchema: {
    fields: Record<string, GigyaSdkConsentSchemaType>
  }
}

export default function (): Promise<GigyaSdkRequiredConsentsSchemasType> {
  return new Promise(async (resolve, reject) => {
    try {
      const completeGigyaSchema = await sendApiCall<PartialGigyaSchema>('accounts.getSchema')
      const currentSiteConsents = await sendApiCall<GigyaSdkConsentsStatementsType>('accounts.getConsentsStatements')

      const output: GigyaSdkRequiredConsentsSchemasType = {
        instantiationRequired: [],
        acceptanceRequired: [],
      }

      Object.entries(currentSiteConsents?.preferences ?? {}).forEach((entry) => {
        const consentStatementSchema = completeGigyaSchema?.preferencesSchema?.fields[entry[0]]

        const isCurrentSiteConsentInstantiationRequired = consentStatementSchema?.required
        const isGlobalSiteConsentAcceptanceRequired = entry[1]?.isActive && entry[1]?.isMandatory

        if (consentStatementSchema) {
          if (isGlobalSiteConsentAcceptanceRequired) {
            consentStatementSchema.key = entry[0]
            output.acceptanceRequired = [...output.acceptanceRequired, consentStatementSchema]
          } else if (isCurrentSiteConsentInstantiationRequired) {
            consentStatementSchema.key = entry[0]
            output.instantiationRequired = [...output.instantiationRequired, consentStatementSchema]
          }
        }
      })

      resolve(output)
    } catch (e) {
      reject(e)
    }
  })
}

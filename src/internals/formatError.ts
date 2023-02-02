import { decode as atob } from 'base-64'

import { GigyaSdkErrorCodes, GigyaSdkErrors, GigyaSdkErrorType } from '../types'

export default function (gigyaSdkError: GigyaSdkErrorType): GigyaSdkErrorType {
  let { code, message, name, stack } = gigyaSdkError

  let error: GigyaSdkErrorType = {
    type: GigyaSdkErrors.UndefinedError,
    payload: null,
    ...(message && { message }),
    ...(stack && { stack }),
    ...(code && { code }),
    ...(name && { name }),
  }

  if (error.code && error.message) {
    try {
      let payload = JSON.parse(gigyaSdkError.message as string)

      if (payload.requestData) {
        payload = JSON.parse(atob(payload.requestData))
      }

      if (payload.accountInfo && typeof payload.accountInfo === 'string') {
        payload.accountInfo = JSON.parse(payload.accountInfo)
      }

      error.payload = payload
    } catch (e) {}

    error.type = (<any>GigyaSdkErrors)[gigyaSdkError.code as string]
    const errorTypeIndex = Object.values(GigyaSdkErrorCodes).indexOf(error?.payload?.errorCode as number)

    if (errorTypeIndex !== -1) {
      const type = (Object.keys(GigyaSdkErrorCodes)[errorTypeIndex] as unknown) as keyof typeof GigyaSdkErrors
      error.type = GigyaSdkErrors[type]
    }
  }

  return error
}

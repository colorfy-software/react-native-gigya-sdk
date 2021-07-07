import type { GigyaSdkErrorType } from '../types'

export default function (error?: GigyaSdkErrorType): Promise<boolean> {
  return new Promise(async (resolve) => {
    if (
      (error?.code || error?.payload?.errorCode) &&
      (error?.payload?.errorDetails || error?.payload?.errorMessage)
    ) {
      return resolve(true)
    }
    resolve(false)
  })
}

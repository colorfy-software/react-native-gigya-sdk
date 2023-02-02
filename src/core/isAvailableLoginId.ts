import sendApiCall from './sendApiCall'

export default function (loginId: string): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await sendApiCall<{ isAvailable: boolean }, { loginID: string }>('accounts.isAvailableLoginID', {
        loginID: loginId,
      })

      resolve(response?.isAvailable)
    } catch (e) {
      reject(e)
    }
  })
}

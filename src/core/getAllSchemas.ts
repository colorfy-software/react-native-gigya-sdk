import sendApiCall from './sendApiCall'

export default function <OutputType>(): Promise<OutputType> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await sendApiCall<OutputType>('accounts.getSchema')

      resolve(response)
    } catch (e) {
      reject(e)
    }
  })
}

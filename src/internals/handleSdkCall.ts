import formatError from './formatError'

export default function <T>(
  sdkCall: Promise<any>,
  options?: { noParsing: boolean }
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    try {
      let response = null

      try {
        response = await sdkCall
      } catch (e) {
        return reject(formatError(e))
      }

      if (!options?.noParsing) {
        response = JSON.parse(response)
      }

      resolve(response)
    } catch (e) {
      reject(e)
    }
  })
}

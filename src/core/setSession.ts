import { NativeModules } from 'react-native'
const { GigyaSdk } = NativeModules

export default function (
  sessionToken: string,
  sessionSecret: string
): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await GigyaSdk.setSession(sessionToken, sessionSecret)

      resolve(response)
    } catch (e) {
      reject(e)
    }
  })
}

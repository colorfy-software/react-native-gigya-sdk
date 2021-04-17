import EncryptedStorage from 'react-native-encrypted-storage'

import type { GigyaSdkStateType } from '../types'

import getState from '../core/getState'

export const initialState: GigyaSdkStateType = {
  UID: '',
  lang: 'en',
  apiKey: '',
  storageKey: 'GigyaSdkState',
}

export let state: GigyaSdkStateType = initialState

export function setState(
  data: Partial<GigyaSdkStateType>
): Promise<GigyaSdkStateType> {
  return new Promise(async (resolve, reject) => {
    try {
      const oldState = await getState()

      const newState = { ...oldState, ...data }

      await EncryptedStorage.setItem(
        newState.encryptedStorageKey,
        JSON.stringify(newState)
      )

      state = newState

      resolve(state)
    } catch (e) {
      reject(e)
    }
  })
}

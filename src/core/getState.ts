import EncryptedStorage from 'react-native-encrypted-storage'

import type { GigyaSdkStateType } from '../types'

import { state, initialState } from '../internals/state'

export default function (): Promise<GigyaSdkStateType> {
  return new Promise(async (resolve, reject) => {
    try {
      if (!Object.is(state, initialState)) {
        return resolve(state)
      }

      let output: GigyaSdkStateType | null = null

      const rehydrateState = async (
        storeKey: string
      ): Promise<GigyaSdkStateType | null> => {
        let persistedState = null

        try {
          const data = await EncryptedStorage.getItem(storeKey)
          if (data) {
            persistedState = JSON.parse(data) as GigyaSdkStateType
          }
        } catch (error) {
          reject(error)
        }

        return persistedState
      }

      output = await rehydrateState(state.encryptedStorageKey)

      if (
        output?.encryptedStorageKey &&
        output?.encryptedStorageKey !== state.encryptedStorageKey &&
        state?.encryptedStorageKey === initialState.encryptedStorageKey
      ) {
        output = await rehydrateState(output?.encryptedStorageKey as string)
      }

      resolve(output || initialState)
    } catch (e) {
      reject(e)
    }
  })
}

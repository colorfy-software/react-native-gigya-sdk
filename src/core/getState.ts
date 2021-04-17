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
          const data = await Promise.resolve(state.storage?.getItem?.(storeKey))
          if (data) {
            persistedState = JSON.parse(data) as GigyaSdkStateType
          }
        } catch (error) {
          reject(error)
        }

        return persistedState
      }

      output = await rehydrateState(state.storageKey)

      if (
        output?.storageKey &&
        output?.storageKey !== state.storageKey &&
        state?.storageKey === initialState.storageKey
      ) {
        output = await rehydrateState(output?.storageKey as string)
      }

      resolve(output || initialState)
    } catch (e) {
      reject(e)
    }
  })
}

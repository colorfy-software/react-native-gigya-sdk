import type { GigyaSdkStateType } from '../types'

import getState from '../core/getState'

export const initialState: GigyaSdkStateType = {
  UID: '',
  lang: 'en',
  apiKey: '',
  storageKey: 'GigyaSdkState',
}

export let state: GigyaSdkStateType = initialState

export function setState(data: Partial<GigyaSdkStateType>): Promise<GigyaSdkStateType> {
  return new Promise(async (resolve, reject) => {
    try {
      const oldState = await getState()
      const newState = { ...oldState, ...data }
      const setItem = data.storage?.setItem || oldState.storage?.setItem

      await Promise.resolve(setItem?.(newState.storageKey, JSON.stringify(newState)))

      state = newState

      resolve(state)
    } catch (e) {
      reject(e)
    }
  })
}

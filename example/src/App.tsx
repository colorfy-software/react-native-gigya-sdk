import React, { useEffect, useState } from 'react'
import EncryptedStorage from 'react-native-encrypted-storage'
import { Button, StyleSheet, Text, View } from 'react-native'
import GigyaSdk, { GigyaSdkAccountInfoType } from 'react-native-gigya-sdk'

const CONFIG = {
  LANG: 'en',
  API_SECRET: '',
  API_KEY: '__GIGYA_API_KEY__',
  DATA_CENTER: '__GIGYA_DATA_CENTER', // eg: 'eu1.gigya.com'
  STORAGE_KEY: 'GigyaSdkEncryptedStorageKey',

  // Just here to speed up your testing, not needed by the library config.
  EMAIL: '',
  PASSWORD: '',
}

export default function App() {
  const [account, setAccount] = useState<GigyaSdkAccountInfoType>()

  useEffect(() => {
    const asyncGigyaPlayground = async () => {
      try {
        await GigyaSdk.init({
          lang: CONFIG.LANG,
          apiKey: CONFIG.API_KEY,
          storage: EncryptedStorage,
          dataCenter: CONFIG.DATA_CENTER,
          storageKey: CONFIG.STORAGE_KEY,
        })

        const gigyaSdkState = await GigyaSdk.getState()

        console.log('👀', { gigyaSdkState })
      } catch (e) {
        console.log('❌ INIT/GET STATE REJECTED', e)
      }
    }

    asyncGigyaPlayground()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check the console!</Text>

      <Button
        title="1. Register account"
        onPress={async () => {
          try {
            await GigyaSdk.registerAccount(CONFIG.EMAIL, CONFIG.PASSWORD, {
              profile: { firstName: 'Test', lastName: 'User' },
            })
          } catch (e) {
            try {
              const output = await GigyaSdk.handleAuthenticationError('site', {
                isRegistration: true,
              })

              console.log('🍃 REGISTER HANDLED', output)
            } catch (error) {
              console.log('❌ REGISTER HANDLE REJECTED', error)
            }
          }
        }}
      />

      <View style={styles.spacer} />

      <Button
        title="2. I've validated my account, login now"
        onPress={async () => {
          try {
            const output = await GigyaSdk.login(CONFIG.EMAIL, CONFIG.PASSWORD)
            console.log('🥳', { account: output })
            setAccount(output)
          } catch (e) {
            try {
              const output = await GigyaSdk.handleAuthenticationError('site', {
                isRegistration: true,
              })

              console.log('🍃 LOGIN HANDLED', output)
            } catch (error) {
              console.log('❌ LOGIN HANDLE REJECTED', error)
            }
          }
        }}
      />

      <View style={styles.spacer} />

      <Button
        title="3. Is logged in"
        onPress={async () => {
          try {
            const isLoggedIn = await GigyaSdk.isLoggedIn()
            console.log('🤔', { isLoggedIn })
          } catch (e) {
            console.log('❌ IS LOGGED IN REJECTED', e)
          }
        }}
      />

      <View style={styles.spacer} />

      <Button
        title="4. Get account info"
        onPress={async () => {
          try {
            const accountInfo = await GigyaSdk.getAccountInfo({
              include: 'id_token,profile,data,subscriptions,isLockedOut,lastLoginLocation,preferences',
              extraProfileFields: 'phones',
            })
            console.log('🗃', { accountInfo })
            setAccount(accountInfo)
          } catch (e) {
            console.log('❌ GET ACCOUNT INFO REJECTED', e)
          }
        }}
      />

      <View style={styles.spacer} />

      <Button
        title="5. Delete account"
        onPress={async () => {
          try {
            const deleteAccount = await GigyaSdk.deleteAccount({
              UID: account?.UID,
              secret: CONFIG.API_SECRET,
            })
            console.log('👋', { deleteAccount })
            setAccount(undefined)
          } catch (e) {
            console.log('❌ DELETE ACCOUNT FAILED', e)
          }
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginBottom: 50,
    fontSize: 16,
  },
  spacer: {
    height: 50,
  },
})

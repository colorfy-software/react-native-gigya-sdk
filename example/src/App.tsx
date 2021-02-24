import React, { useEffect } from 'react'

import { Button, StyleSheet, Text, View } from 'react-native'

import GigyaSDK from 'react-native-gigya-sdk'

const CONFIG = {
  LANG: 'en',
  API_KEY: '__GIGYA_API_KEY__',
  DATA_CENTER: 'eu1.gigya.com',
  ENCRYPTED_STORAGE_KEY: 'GigyaSdkEncryptedStorageKey',

  EMAIL: '',
  PASSWORD: '',
}

export default function App() {
  useEffect(() => {
    const asyncGigyaPlayground = async () => {
      try {
        await GigyaSDK.init({
          lang: CONFIG.LANG,
          apiKey: CONFIG.API_KEY,
          dataCenter: CONFIG.DATA_CENTER,
          encryptedStorageKey: CONFIG.ENCRYPTED_STORAGE_KEY,
        })

        const gigyaSdkState = await GigyaSDK.getState()

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
            await GigyaSDK.registerAccount(CONFIG.EMAIL, CONFIG.PASSWORD)
          } catch (e) {
            try {
              const output = await GigyaSDK.handleAuthenticationError('email', {
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
            const account = await GigyaSDK.login(CONFIG.EMAIL, CONFIG.PASSWORD)
            console.log('🥳', { account })
          } catch (e) {
            try {
              const output = await GigyaSDK.handleAuthenticationError('email', {
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
            const isLoggedIn = await GigyaSDK.isLoggedIn()
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
            const accountInfo = await GigyaSDK.getAccountInfo({
              include:
                'id_token,profile,data,subscriptions,isLockedOut,lastLoginLocation,preferences',
              extraProfileFields: 'phones',
            })
            console.log('🗃', { accountInfo })
          } catch (e) {
            console.log('❌ GET ACCOUNT INFO REJECTED', e)
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

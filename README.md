# react-native-gigya-sdk

**SAP CDC/Gigya SDK for your React Native applications.**

---

## ❗ Disclaimer

Please be advised this library is still in very early stages.

Only some critical functions from the Gigya `Core` package have been ported.

We'll try to provide better docs & examples as soon as we can.

PRs are more than welcome!

## 🏗️ Installation

Install the library & its dependencies:

```sh
yarn add react-native-gigya-sdk react-native-encrypted-storage base-64
```

### iOS

<details>
<summary>See steps</summary>
<br>
  
- Add the following line to your `ios/Podfile`:

```sh
pod 'Gigya'
```

- Run 
```sh
pod install
```

- If you don't already one, via Xcode, add a `.swift` to your Xcode project and accept to `Create Bridging Header`:

```swift
//
//  Bridge.swift
//  GigyaSdkExample
//

import Foundation

```

- If you're planing on having Facebook login, [follow the documentation](https://developers.gigya.com/display/GD/Swift+SDK#SwiftSDK-Facebook) to install the Facebook SDK.
  
- Same if you want Apple Sign In, [the documentation is here](https://developers.gigya.com/display/GD/Swift+SDK#SwiftSDK-Apple). 
</details>

### Android

<details>
<summary>See steps</summary>
<br>

- Add the desired SDK version to your `android/build.gradle`:

```graddle
buildscript {
    ext {
      gigyaCoreSdkVersion = "core-v5.0.1"
    }
}
```

- If you're planing on having Facebook login, [follow the docs](https://developers.gigya.com/display/GD/Android+SDK+v4#AndroidSDKv4-Facebook) to install the Facebook SDK.
</details>

## 💻 Usage

You can now initialize the SDK with your [**`apiKey`**](https://developers.gigya.com/display/GD/APIs+and+SDKs#APIsandSDKs-APIKeyandSiteSetup),
[**`dataCenter`**](https://developers.gigya.com/display/GD/Finding+Your+Data+Center) (***both required***), app
[**`lang`**](https://developers.gigya.com/display/GD/Advanced+Customizations+and+Localization) and desired
[**`encryptedStorageKey`**](https://github.com/emeraldsanto/react-native-encrypted-storage#usage).

```js
import GigyaSDK from 'react-native-gigya-sdk'

// Before anything we initialize the SDK
GigyaSDK.init({
  lang: 'en',
  apiKey: 'GIGYA_API_KEY',
  dataCenter: 'eu1.gigya.com',
  encryptedStorageKey: 'ENCRYPTED_STORAGE_KEY'
})

// Now we can use it
const myAccount = await GigyaSDK.login(email, password)
```

## 🤝 Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## 📰 License

MIT

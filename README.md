<h1 align="center">
  <a href="https://github.com/colorfy-software/react-native-gigya-sdk" target="_blank" rel="noopener noreferrer">
    🌤 React Native Gigya SDK
  </a>
</h1>

<h4 align="center">
  <strong>SAP CDC/Gigya SDK for your React Native applications.</strong>
</h4>

<p align="center">
  <a href="https://github.com/colorfy-software/react-native-gigya-sdk/actions">
    <img src="https://github.com/colorfy-software/react-native-gigya-sdk/workflows/Test%20Suite/badge.svg?branch=main" alt="Current GitHub Actions build status." />
  </a>
  <a href="https://www.npmjs.org/package/react-native-gigya-sdk">
    <img src="https://badge.fury.io/js/react-native-gigya-sdk.svg" alt="Current npm package version." />
  </a>
  <a href="https://www.npmjs.org/package/react-native-gigya-sdk">
    <img src="https://img.shields.io/npm/dm/react-native-gigya-sdk.svg?maxAge=2592000" alt="Monthly npm downloads." />
  </a>
  <a href="https://colorfy-software.gitbook.io/react-native-gigya-sdk/contributing">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome!" />
  </a>
</p>

## 🏗️ Installation

1. Install the library & its dependency:

```sh
yarn add react-native-gigya-sdk base-64
```

2. If you haven't done so already, install a persistent storage library (like [EncryptedStorage](https://github.com/emeraldsanto/react-native-encrypted-storage)) as you'll need to provide it during setup. **Just make sure your library exposes `getItem()` and `setItem()` functions.**

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
[**`dataCenter`**](https://developers.gigya.com/display/GD/Finding+Your+Data+Center), application
[**`lang`**](https://developers.gigya.com/display/GD/Advanced+Customizations+and+Localization),
**`storage`** solution & desired **storageKey**.

❗ **Please make sure your storage library exposes `getItem()` and `setItem()` functions.**



```js
import GigyaSdk from 'react-native-gigya-sdk'
import EncryptedStorage from 'react-native-encrypted-storage'

// Before anything we initialize the SDK.
GigyaSdk.init({
  lang: 'en',
  apiKey: 'GIGYA_API_KEY',
  dataCenter: 'eu1.gigya.com',
  storage: EncryptedStorage,
  storageKey: 'STORAGE_KEY'
})

// Now we can use it.
const myAccount = await GigyaSdk.login(email, password)
```

## 🤝 Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## 📰 License

MIT

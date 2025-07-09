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

1. Install the library :

```sh
yarn add react-native-gigya-sdk base-64
```

2. If you haven't done so already, install a persistent storage library (like [SecureStorage](https://github.com/IvanIhnatsiuk/react-native-fast-secure-storage)) as you'll need to provide it during setup. **Just make sure your library exposes `getItem()` and `setItem()` functions.**

### iOS

<details>
<summary>See steps</summary>
<br>
  
1. Add the following line to your `ios/Podfile`:

```sh
pod 'Gigya'
```

2. From `/ios`, run:

```sh
pod install
```

3. If you don't already have a Swift file in your project, via Xcode, create a `.swift` file (ie: `Bridge.swift`) in your Xcode workspace and accept to `Create Bridging Header`:

```swift
//
//  Bridge.swift
//  GigyaSdkExample
//

import Foundation

```

1. If you're planing on providing social login, search for the "Facebook", "Google", etc section and follow [the full documentation](https://help.sap.com/docs/SAP_CUSTOMER_DATA_CLOUD/8b8d6fffe113457094a17701f63e3d6a/415424b570b21014bbc5a10ce4041860.html?locale=en-US) to install and set up its SDK. You can then open Xcode and add its `Wrapper.swift` file to your target (inside **Compile Sources** from the **Build Phases** tab) to handle the communication with the Gigya SDK. The files **are** available inside the `GigyaProviders.zip` asset that comes with each [`gigya-swift-sdk` release](https://github.com/SAP/gigya-swift-sdk/releases).
</details>

### Android

<details>
<summary>See steps</summary>
<br>

1. Add the desired Gigya SDK version to your `android/build.gradle`:

```graddle
buildscript {
    ext {
      gigyaCoreSdkVersion = "7.1.5"
    }
}
```

2. If you're planing on providing social login, search for the "Facebook", "Google", etc section and follow [the full documentation](https://help.sap.com/docs/SAP_CUSTOMER_DATA_CLOUD/8b8d6fffe113457094a17701f63e3d6a/4142e7a870b21014bbc5a10ce4041860.html?locale=en-US) to install and set up the social provider SDK. Also add the required `Wrapper.java` file to your project to handle the communication with the Gigya SDK, as instructed in [this section of the documentation](https://sap.github.io/gigya-android-sdk/sdk-core/#configuring-native-login). The files are available inside the assets that comes with each [`gigya-android-sdk` release](https://github.com/SAP/gigya-android-sdk/releases) or in the codebase [example folder](https://github.com/SAP/gigya-android-sdk/tree/main/example/src/main/java/com/gigya/android/sample/providers).
</details>

## 💻 Usage

You can now initialize the SDK with your [**`apiKey`**](https://help.sap.com/docs/SAP_CUSTOMER_DATA_CLOUD/8b8d6fffe113457094a17701f63e3d6a/4143211270b21014bbc5a10ce4041860.html?locale=en-US#api-key-and-site-setup),
[**`dataCenter`**](https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/LATEST/en-US/41573b6370b21014bbc5a10ce4041860.html), application
[**`lang`**](https://help.sap.com/docs/SAP_CUSTOMER_DATA_CLOUD/8b8d6fffe113457094a17701f63e3d6a/4141d83470b21014bbc5a10ce4041860.html?locale=en-US#language-support),
**`storage`** solution and desired **`storageKey`**.

❗ **Please make sure your storage library exposes `getItem()` and `setItem()` functions or provided them yourself.**



```ts
import SecureStorage from 'react-native-fast-secure-storage'
import GigyaSdk, { GigyaSdkDataCenterEnum } from 'react-native-gigya-sdk'

// Before anything we initialize the SDK.
GigyaSdk.init({
  lang: 'en',
  storage: SecureStorage,
  storageKey: 'RANDOM_STRING'
  apiKey: 'INSERT_GIGYA_API_KEY',
  dataCenter: GigyaSdkDataCenterEnum.EU1,
})

// Now we can use it.
const myAccount = await GigyaSdk.login(email, password)
```

## 🤝 Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## 📰 License

MIT

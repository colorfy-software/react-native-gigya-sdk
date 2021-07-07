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
yarn add react-native-gigya-sdk
```

2. If you haven't done so already, install a persistent storage library (like [EncryptedStorage](https://github.com/emeraldsanto/react-native-encrypted-storage)) as you'll need to provide it during setup. **Just make sure your library exposes `getItem()` and `setItem()` functions.**

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

3. If you don't already one, via Xcode, add a `.swift` file to your Xcode project and accept to `Create Bridging Header`:

```swift
//
//  Bridge.swift
//  GigyaSdkExample
//

import Foundation

```

4. If you're planing on providing Facebook login, search for the "Facebook" section and follow [the full
  documentation](https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/LATEST/en-US/417aa03e70b21014bbc5a10ce4041860.html)
  to install and set up the Facebook SDK. You can then create a `FacebookWrapper.swift` file from Xcode and add it to your
  target (inside **Compile Sources** from the **Build Phases** tab) to handle the communication with the SDK. The file could look like so:

    <details>
    <summary>See file</summary>

    ```swift
    //
    //  FacebookWrapper.swift
    //  GigyaSdk
    //
    //  Created by Charles Mangwa on 30.06.21.
    //  Copyright © 2021 colorfy GmbH. All rights reserved.
    //

    import Foundation
    import FBSDKCoreKit
    import FBSDKLoginKit
    import Gigya

    class FacebookWrapper: ProviderWrapperProtocol {

        private var completionHandler: (_ jsonData: [String: Any]?, _ error: String?) -> Void = { _, _  in }

        var clientID: String?

        private let defaultReadPermissions = ["email"]

        lazy var fbLogin: LoginManager = {
            return LoginManager()
        }()

        required init() {

        }

        func login(params: [String: Any]?, viewController: UIViewController?,
                  completion: @escaping (_ jsonData: [String: Any]?, _ error: String?) -> Void) {
            completionHandler = completion
            
            fbLogin.logIn(permissions: defaultReadPermissions, from: viewController) { (result, error) in
                if result?.isCancelled != false {
                    completion(nil, "sign in cancelled")
                    return
                }

                if let error = error {
                    completion(nil, error.localizedDescription)
                }

                let jsonData: [String: Any] = ["accessToken": result?.token?.tokenString ?? "", "tokenExpiration": result?.token?.expirationDate.timeIntervalSince1970 ?? 0]

                completion(jsonData, nil)
            }
        }

        func logout() {
            fbLogin.logOut()
        }
    }
    ```
    </details>

  
5. Same if you want Apple Sign In, search for the "Apple" section and follow [the full documentation
  here](https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/LATEST/en-US/417aa03e70b21014bbc5a10ce4041860.html)
  and create a `AppleSignInWrapper.swift` file in the same manner as explained above. The file could look like so:

    <details>
    <summary>See file</summary>

    ```swift
    //
    //  AppleSignInWrapper.swift
    //  GigyaSdk
    //
    //  Created by Charles Mangwa on 30.06.21.
    //  Copyright © 2021 colorfy GmbH. All rights reserved.
    //

    import Foundation
    import Gigya
    import AuthenticationServices

    @available(iOS 13.0, *)
    class AppleSignInWrapper: NSObject, ProviderWrapperProtocol {
        var clientID: String?

        private lazy var appleLogin: AppleSignInInternalWrapper = {
            return AppleSignInInternalWrapper()
        }()

        required override init() {
            super.init()
        }

        func login(params: [String : Any]?, viewController: UIViewController?, completion: @escaping ([String : Any]?, String?) -> Void) {
            appleLogin.login(params: params, viewController: viewController, completion: completion)
        }
    }

    @available(iOS 13.0, *)
    private class AppleSignInInternalWrapper: NSObject {
        lazy var appleIDProvider: ASAuthorizationAppleIDProvider = {
            return ASAuthorizationAppleIDProvider()
        }()

        weak var viewController: UIViewController?

        private var completionHandler: (_ jsonData: [String: Any]?, _ error: String?) -> Void = { _, _  in }

        func login(params: [String : Any]?, viewController: UIViewController?, completion: @escaping ([String : Any]?, String?) -> Void) {
            self.completionHandler = completion
            self.viewController = viewController
            let appleIDProvider = ASAuthorizationAppleIDProvider()

            let request = appleIDProvider.createRequest()
            request.requestedScopes = [.fullName, .email]

            let authorizationController = ASAuthorizationController(authorizationRequests: [request])
            authorizationController.delegate = self
            authorizationController.presentationContextProvider = self
            authorizationController.performRequests()
        }

    }

    @available(iOS 13.0, *)
    extension AppleSignInInternalWrapper: ASAuthorizationControllerDelegate {
        func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
            if let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential {
                if let authorizationCode = appleIDCredential.authorizationCode, let identityToken = appleIDCredential.identityToken {

                    let authorizationCodeEncoded = String(decoding: authorizationCode, as: UTF8.self)
                    let identityTokenEncoded = String(decoding: identityToken, as: UTF8.self)

                    var jsonData: [String: Any] = ["code": authorizationCodeEncoded, "accessToken": identityTokenEncoded]

                    if let firstName = appleIDCredential.fullName?.givenName {
                        jsonData["firstName"] = firstName
                    }

                    if let lastName = appleIDCredential.fullName?.familyName {
                        jsonData["lastName"] = lastName
                    }

                    completionHandler(jsonData, nil)
                } else {
                    completionHandler(nil, "can't getting params from Apple")
                }

            }
        }

        func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
            completionHandler(nil, error.localizedDescription)
        }
    }

    @available(iOS 13.0, *)
    extension AppleSignInInternalWrapper: ASAuthorizationControllerPresentationContextProviding {
        func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
            return self.viewController!.view.window!
        }
    }

    ```
    </details>
  </details>

### Android

<details>
<summary>See steps</summary>
<br>

1. Add the desired Gigya SDK version to your `android/build.gradle`:

```graddle
buildscript {
    ext {
      gigyaCoreSdkVersion = "core-v5.0.1"
    }
}
```

2. If you're planing on providing Facebook login, search for the "Facebook" section and follow [the full
  documentation](https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/LATEST/en-US/4142e7a870b21014bbc5a10ce4041860.html)
  to install and set up the Facebook SDK.
</details>

## 💻 Usage

You can now initialize the SDK with your [**`apiKey`**](https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/GIGYA/en-US/4143211270b21014bbc5a10ce4041860.html),
[**`dataCenter`**](https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/LATEST/en-US/41573b6370b21014bbc5a10ce4041860.html), application
[**`lang`**](https://help.sap.com/viewer/8b8d6fffe113457094a17701f63e3d6a/LATEST/en-US/4141d83470b21014bbc5a10ce4041860.html),
**`storage`** solution & desired **storageKey**.

❗ **Please make sure your storage library exposes `getItem()` and `setItem()` functions.**



```js
import GigyaSdk from 'react-native-gigya-sdk'
import EncryptedStorage from 'react-native-encrypted-storage'

// Before anything we initialize the SDK.
GigyaSdk.init({
  lang: 'en',
  apiKey: 'INSERT_GIGYA_API_KEY',
  dataCenter: 'eu1.gigya.com',
  storage: EncryptedStorage,
  storageKey: 'RANDOM_STRING'
})

// Now we can use it.
const myAccount = await GigyaSdk.login(email, password)
```

## 🤝 Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## 📰 License

MIT

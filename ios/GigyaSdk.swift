//
//  GigyaSdk.swift
//  GigyaSdk
//
//  Created by Charles Mangwa on 21.02.21.
//  Copyright © 2021 colorfy GmbH. All rights reserved.
//

import Foundation
import SwiftUI
import Gigya

@objc(GigyaSdk)
class GigyaSdk: NSObject {

  @objc class func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc func initialize(
    _ config: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock) {
    Gigya.sharedInstance().initFor(apiKey: config["apiKey"] as! String, apiDomain: config["dataCenter"] as? String)
    resolve(true)
  }
  
  @objc func sendApiCall(
    _ api: String,
    parameters params: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    do {
      let serializedParams = try parseParamsString(params: params)
      Gigya.sharedInstance().send(api: api, params: serializedParams) { (res) in
        switch res {
          case .success(let data):
            do {
              try resolve(self.codableToJSONString(data: data))
            } catch {
              reject("jsonParseError", "{}", error)
            }
          case .failure(let error):
            switch error {
              case .gigyaError(let data):
                do {
                  reject("sendApiError", try self.codableToJSONString(data: data), error)
                } catch let error as NSError {
                  reject("sendApiError", "{}", error)
                }
              default:
                reject("sendApiError", "{}", error)
              }
        }
      }
    } catch let error as NSError {
        reject("apiErrorParamsInvalid", "{}", error)
    }
  }
  
  @objc func setSession(
    _ sessionToken: String,
    sessionSecret: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    let session: GigyaSession = GigyaSession(sessionToken: sessionToken, secret: sessionSecret)!
    Gigya.sharedInstance().setSession(session)
    resolve(true)
  }
  
  @objc func login(
    _ email:  String,
    password pass:  String,
    parameters params: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    do {
      let serializedParams = try parseParamsString(params: params)
      
      var promiseHandled = false
      
      Gigya.sharedInstance().login(
          loginId: email, password: pass, params: serializedParams
      ) {result in
          if(promiseHandled) {
            return
          }
          promiseHandled = true
        
          switch result {
          case .success(let data):
            do {
              resolve(try self.codableToJSONString(data: data))
            } catch {
              reject("loginErrorJSON", "{}", error)
            }
          case .failure(let loginError):
            self.handleLoginAPIError(error: loginError, rejecter: reject)
          }
      }
    } catch let error as NSError {
        reject("apiErrorParamsInvalid", "{}", error)
    }
  }
  
  @objc func registerAccount(
    _ email:  String,
    password pass:  String,
    parameters params: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    
    do {
      let serializedParams = try parseParamsString(params: params)
      
      var promiseHandled = false
      
      Gigya.sharedInstance().register(email: email, password: pass, params: serializedParams) {result in
        if(promiseHandled) {
          return
        }
        promiseHandled = true
        
        switch result {
        case .success(let data):
          do {
            resolve(try self.codableToJSONString(data: data))
          } catch {
            reject("registerErrorJSON","{}", error)
          }
        case .failure(let registerError):
          self.handleLoginAPIError(error: registerError, rejecter: reject)
        }
      }
    } catch let error as NSError {
        reject("apiErrorParamsInvalid", "{}", error)
    }
  }
  
  @objc func socialLogin(
    _ provider:  String,
    parameters params: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    do {
      let serializedParams = try parseParamsString(params: params)
      
      let gigyaProvider:GigyaSocialProviders = self.stringToGigyaProvider(provider: provider)
      
      var promiseHandled = false
      DispatchQueue.main.async {
        Gigya.sharedInstance().login(
          with: gigyaProvider,
          viewController: UIApplication.getTopViewController()!,
          params: serializedParams
        ) {result in
          if(promiseHandled) {
            return
          }
          promiseHandled = true
          
          switch result {
            case .success(let data):
              do {
                resolve(try self.codableToJSONString(data: data))
              } catch {
                reject("loginErrorJSON", "{}", error)
              }
            case .failure(let loginError):
              self.handleLoginAPIError(error: loginError, rejecter: reject)
          }
        }
      }
    } catch let error as NSError {
        reject("apiErrorParamsInvalid", "{}", error)
    }
  }
  
  func codableToJSONString<T: Encodable> (data: T) throws -> String {
    let jsonEncoder = JSONEncoder()
    let jsonData = try jsonEncoder.encode(data)
    return String(data: jsonData, encoding: .utf8)!
  }
  
  func handleLoginAPIError(error: LoginApiError<GigyaAccount>, rejecter reject: @escaping RCTPromiseRejectBlock) {
    
    let errorMessage = self.parseLoginAPIError(error: error.error)
    var errorCode = "undefinedError"
    
    switch error.interruption {
      case .pendingPasswordChange(_):
        errorCode = "pendingPasswordChange"
        break
      case .pendingRegistration(_):
        errorCode = "pendingRegistration"
        break
      case .conflitingAccount(_):
        errorCode = "conflictingAccount"
        break
      case .pendingVerification(_):
        errorCode = "pendingVerification"
        break
      case .none:
        errorCode = "userCancelled"
        break
      case .some(.pendingTwoFactorRegistration(_, _, _)):
        errorCode = "pendingTwoFactorRegistration"
        break
      case .some(.pendingTwoFactorVerification(_, _, _)):
        errorCode = "pendingTwoFactorVerification"
        break
    }
    
    reject(errorCode, errorMessage, error.error)
  }
  
  func parseLoginAPIError(error: NetworkError) -> String {
    switch error {
      case .gigyaError(let data):
        do {
          return try codableToJSONString(data: data)
        } catch {
          return "{\"type\": \"jsonParseError\"}"
        }
      case .providerError(let data):
        return data
      case .networkError(_):
        return "{\"type\": \"networkError\"}"
      case .emptyResponse:
        return "{\"type\": \"emptyResponse\"}"
      case .jsonParsingError(_):
        return "{\"type\": \"jsonParseError\"}"
      case .createURLRequestFailed:
        return "{\"type\": \"createURLRequestFailed\"}"
    }
  }
  
  func parseParamsString(params: String) throws -> [String: Any] {
    return (try JSONSerialization.jsonObject(with: Data(params.utf8), options: []) as? [String: Any])!
  }
  
  func stringToGigyaProvider(provider: String) -> GigyaSocialProviders {
    switch provider {
      case "apple":
          return GigyaSocialProviders.apple
      case "amazon":
          return  GigyaSocialProviders.amazon
      default:
          return  GigyaSocialProviders.facebook
    }
  }
  
  @objc func logout(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    if(!Gigya.sharedInstance().isLoggedIn()) {
      resolve(true)
    }
    
    Gigya.sharedInstance().logout(){ result in
      switch result {
        case .success(let logoutResult):
          resolve(logoutResult)
        case .failure(let logoutError):
          reject("logoutError", "{}", logoutError)
      }
    }
  }
  
  @objc func getAccount(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    Gigya.sharedInstance().getAccount(false){ result in
      switch result {
        case .success(let data):
          do {
            resolve(try self.codableToJSONString(data: data))
          } catch {
            reject("getAccountErrorJSON", "{}", error)
          }
        case .failure(let getUserError):
            // Login failure.
          reject("getAccountErrorJSON", "{}", getUserError)
      }
    }
  }

  @objc func setAccount(
    _ params: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    do {
      let serializedParams = try parseParamsString(params: params)
      Gigya.sharedInstance().setAccount(with: serializedParams) { (res) in
        switch res {
          case .success(let data):
            do {
              try resolve(self.codableToJSONString(data: data))
            } catch {
              reject("jsonParseError", "{}", error)
            }
          case .failure(let error):
            switch error {
              case .gigyaError(let data):
                do {
                  reject("setAccountError", try self.codableToJSONString(data: data), error)
                } catch let error as NSError {
                  reject("setAccountError", "{}", error)
                }
              default:
                reject("setAccountError", "{}", error)
              }
        }
      }
    } catch let error as NSError {
        reject("apiErrorParamsInvalid", "{}", error)
    }
  }
  
  @objc func isLoggedIn(
    _ resolve:RCTPromiseResolveBlock,
    rejecter reject:RCTPromiseRejectBlock
  ) -> Void {
      resolve(Gigya.sharedInstance().isLoggedIn())
  }
}

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
  
  func mapResponseToStruct(data: GigyaDictionary) -> GigyaSdkApiResponse? {
    
    // Safely extract values from the dictionary
    guard let time = data["time"]?.value as? String,
          let callId = data["callId"]?.value as? String,
          let statusCode = data["statusCode"]?.value as? Int,
          let apiVersion = data["apiVersion"]?.value as? Int,
          let statusReason = data["statusReason"]?.value as? String,
          let errorCode = data["errorCode"]?.value as? Int
    else {
      return nil  // If any required value is missing or of the wrong type, return nil
    }
    
    // Optionally extract the values that could be nil
    let errorMessage = data["errorMessage"]?.value as? String
    let errorDetails = data["errorDetails"]?.value as? String
    let fullEventName = data["fullEventName"]?.value as? String
    
    // Return the mapped struct
    return GigyaSdkApiResponse(
      time: time,
      callId: callId,
      errorCode: errorCode,
      statusCode: statusCode,
      apiVersion: apiVersion,
      statusReason: statusReason,
      errorMessage: errorMessage,
      errorDetails: errorDetails,
      fullEventName: fullEventName
    )
  }

  func handleLoginAPIError(
    error: LoginApiError<GigyaAccount>, rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    
    let errorMessage = self.parseLoginAPIError(error: error.error)
    var errorCode = "undefinedError"
    
    switch error.interruption {
      case .pendingPasswordChange(_):
        errorCode = "pendingPasswordChange"
        break
      case .pendingRegistration(_):
        errorCode = "pendingRegistration"
        break
      case .conflitingAccount(resolver: _):
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
      case .some(.captchaRequired):
        errorCode = "captchaRequired"
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
    return
    (try JSONSerialization.jsonObject(with: Data(params.utf8), options: []) as? [String: Any])!
  }
  
  func stringToGigyaProvider(provider: String) -> GigyaSocialProviders {
    switch provider {
      case "amazon":
        return GigyaSocialProviders.amazon
      case "facebook":
        return GigyaSocialProviders.facebook
      case "google":
        return GigyaSocialProviders.google
      default:
        return GigyaSocialProviders.apple
    }
  }
  
  @objc func initialize(
    _ config: NSDictionary,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Gigya.sharedInstance().initFor(
      apiKey: config["apiKey"] as! String, apiDomain: config["dataCenter"] as? String)
    resolve(true)
  }
  
  @objc func sendApiCall(
    _ api: String,
    parameters params: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    do {
      let serializedParams = try parseParamsString(params: params)
      Gigya.sharedInstance().send(api: api, params: serializedParams) { result in
        switch result {
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
  
  @objc func registerAccount(
    _ email: String,
    password pass: String,
    parameters params: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    
    do {
      let serializedParams = try parseParamsString(params: params)
      
      var promiseHandled = false
      
      Gigya.sharedInstance().register(email: email, password: pass, params: serializedParams) {
        result in
        if promiseHandled {
          return
        }
        promiseHandled = true
        
        switch result {
          case .success(let data):
            do {
              resolve(try self.codableToJSONString(data: data))
            } catch {
              reject("registerErrorJSON", "{}", error)
            }
          case .failure(let registerError):
            self.handleLoginAPIError(error: registerError, rejecter: reject)
        }
      }
    } catch let error as NSError {
      reject("apiErrorParamsInvalid", "{}", error)
    }
  }
  
  @objc func login(
    _ email: String,
    password pass: String,
    parameters params: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    do {
      let serializedParams = try parseParamsString(params: params)
      
      var promiseHandled = false
      
      Gigya.sharedInstance().login(loginId: email, password: pass, params: serializedParams) {
        result in
        if promiseHandled {
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
  
  @objc func socialLogin(
    _ provider: String,
    parameters params: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    do {
      let serializedParams = try parseParamsString(params: params)
      
      let gigyaProvider: GigyaSocialProviders = self.stringToGigyaProvider(provider: provider)
      
      var promiseHandled = false
      DispatchQueue.main.async {
        Gigya.sharedInstance().login(
          with: gigyaProvider, viewController: UIApplication.getTopViewController()!,
          params: serializedParams
        ) { result in
          if promiseHandled {
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
  
  @objc func getSession(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    do {
      let data: GigyaSession? = Gigya.sharedInstance().getSession()
      resolve(
        try self.codableToJSONString(
          data: GigyaSdkSession(
            sessionToken: data?.token ?? "",
            sessionSecret: data?.secret,
            sessionExpirationTimestamp: data?.sessionExpirationTimestamp
          )
        )
      )
    } catch let error as NSError {
      reject("getSessionErrorJSON", "{}", error)
    }
  }
  
  @objc func setSession(
    _ sessionToken: String,
    sessionSecret: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    let session: GigyaSession = GigyaSession(sessionToken: sessionToken, secret: sessionSecret)!
    Gigya.sharedInstance().setSession(session)
    resolve(true)
  }
  
  @objc func isSessionValid(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Gigya.sharedInstance().verifySession { result in
      switch result {
        case .success(let data):
          let response = self.mapResponseToStruct(data: data)
          if response?.errorCode == 0 {
            resolve(true)
          } else {
            resolve(false)
          }
        case .failure(let isValidSessionError):
          reject("isValidSessionErrorJSON", "{}", isValidSessionError)
      }
    }
  }
  
  @objc func getAccount(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Gigya.sharedInstance().getAccount(false) { result in
      switch result {
        case .success(let data):
          do {
            resolve(try self.codableToJSONString(data: data))
          } catch {
            reject("getAccountErrorJSON", "{}", error)
          }
        case .failure(let getUserError):
          reject("getAccountErrorJSON", "{}", getUserError)
      }
    }
  }
  
  @objc func setAccount(
    _ params: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    do {
      let serializedParams = try parseParamsString(params: params)
      Gigya.sharedInstance().setAccount(with: serializedParams) { result in
        switch result {
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
    _ resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    resolve(Gigya.sharedInstance().isLoggedIn())
  }
  
  @objc func logout(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    if !Gigya.sharedInstance().isLoggedIn() {
      resolve(true)
    }
    
    Gigya.sharedInstance().logout { result in
      switch result {
        case .success(let logoutResult):
          resolve(logoutResult)
        case .failure(let logoutError):
          reject("logoutError", "{}", logoutError)
      }
    }
  }
}

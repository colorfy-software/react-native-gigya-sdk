//
//  GigyaSdk.m
//  GigyaSdk
//
//  Created by Charles Mangwa on 21.02.21.
//  Copyright © 2021 colorfy GmbH. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

#import "GigyaSdk.h"

@interface RCT_EXTERN_MODULE(GigyaSdk, NSObject)

RCT_EXTERN_METHOD(
  getAccount:
  (RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  getConflictingAccount:
  (RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  initialize:
  (NSDictionary) config
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  isLoggedIn:
  (RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  linkToConflictingSite:
  (NSString) email
  password:(NSString) pass
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  linkToConflictingSocialProvider:
  (NSString) provider
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  login:
  (NSString) email
  password:(NSString) pass
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  login:
  (NSString) email
  password:(NSString) pass
  parameters:(NSString) params
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  logout:
  (RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  registerAccount:
  (NSString) email
  password:(NSString) pass
  parameters:(NSString *) params
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  sendApiCall:
  (NSString) api
  parameters:(NSString) params
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  setAccount:
  (NSString) params
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  getSession:
  (RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

RCT_EXTERN_METHOD(
  setSession:
  (NSString) sessionToken
  sessionSecret:(NSString) sessionSecret
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)


RCT_EXTERN_METHOD(
  socialLogin:
  (NSString) provider
  parameters:(NSString *) params
  resolver:(RCTPromiseResolveBlock)resolve
  rejecter:(RCTPromiseRejectBlock)reject
)

@end

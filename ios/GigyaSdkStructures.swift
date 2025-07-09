//
//  GigyaSdkStructures.swift
//  GigyaSdk
//
//  Created by Charles on 06.03.25.
//  Copyright © 2025 Facebook. All rights reserved.
//

import Foundation

struct GigyaSdkSession: Encodable {
  let sessionToken: String
  let sessionSecret: String?
  let sessionExpirationTimestamp: Double?
}

struct GigyaSdkApiResponse {
  let time: String
  let callId: String
  let errorCode: Int
  let statusCode: Int
  let apiVersion: Int
  let statusReason: String
  let errorMessage: String?
  let errorDetails: String?
  let fullEventName: String?
}

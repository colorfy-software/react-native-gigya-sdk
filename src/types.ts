export interface GigyaSdkStateType {
  apiKey: string
  UID: string
  encryptedStorageKey: string
  lang: string
  error?: GigyaSdkErrorType
  authenticationAttempt?: {
    type?: 'apple' | 'email' | 'facebook'
  }
  regToken?: {
    value?: GigyaSdkLoginErrorPayloadType['regToken']
    expirationDate?: Date
    isStillValid?: boolean
  }
}

export enum GigyaSdkErrorCodes {
  ConsecutiveRequestLimitReached = 400125,
  AccountTemporarilyLockedOut = 403120,
  InvalidLoginIdOrPassword = 403042,
  MaxRequestLimitReached = 403000,
  NotConnectedToNetwork = 400106,
  InvalidApiKeyParameter = 400093,
  UniqueIdentifierExists = 400003,
  PendingVerification = 206002,
  LoginIdDoesNotExist = 403047,
  PendingRegistration = 206001,
  ConflictingAccount = 403043,
  PermissionDenied = 403007,
  InvalidParameter = 400006,
  ValidationError = 400009,
}

export enum GigyaSdkErrors {
  ConsecutiveRequestLimitReached = 'consecutiveRequestLimitReached',
  AccountTemporarilyLockedOut = 'accountTemporarilyLockedOut',
  InvalidLoginIdOrPassword = 'invalidLoginIdOrPassword',
  CreateURLRequestFailed = 'createURLRequestFailed',
  MaxRequestLimitReached = 'maxRequestLimitReached',
  NotConnectedToNetwork = 'notConnectedToNetwork',
  InvalidApiKeyParameter = 'invalidApiKeyParameter',
  UniqueIdentifierExists = 'uniqueIdentifierExists',
  PendingPasswordChange = 'pendingPasswordChange',
  LoginIdDoesNotExist = 'loginIdDoesNotExist',
  PendingRegistration = 'pendingRegistration',
  PendingVerification = 'pendingVerification',
  ConflictingAccount = 'conflictingAccount',
  InvalidParameter = 'invalidParameter',
  PermissionDenied = 'permissionDenied',
  ValidationError = 'validationError',
  SetAccountError = 'setAccountError',
  UndefinedError = 'undefinedError',
  JsonParseError = 'jsonParseError',
  EmptyResponse = 'emptyResponse',
  UserCancelled = 'userCancelled',
  NetworkError = 'networkError',
  SendApiError = 'sendApiError',
}

export interface GigyaSdkApiResponseType {
  statusReason: string
  statusCode: number
  errorCode: number
  callId: string
  time: Date
}

export interface GigyaSdkValidationErrorType {
  errorCode: number
  fieldName:
    | 'username'
    | 'password'
    | 'secretQuestion'
    | 'secretAnswer'
    | 'email'
  message: string
}

export interface GigyaSdkLoginErrorPayloadAccountInfoType
  extends GigyaSdkApiResponseType {
  UID: string
  UIDSig: string
  UIDSignature: string
  signatureTimestamp: string
  isSiteUser: boolean
  isConnected: boolean
  isTempUser: boolean
  isLoggedIn: boolean
  loginProvider: string
  loginProviderUID: string
  isSiteUID: boolean
  identities: Record<string, unknown>[]
  nickname: string
  photoURL: string
  thumbnailURL: string
  firstName: string
  lastName: string
  gender: string
  email: string
  capabilities: string
  providers: string
  oldestDataUpdatedTimestamp: number
  oldestDataAge: number
  timestamp: string
}

export interface GigyaSdkLoginErrorPayloadType extends GigyaSdkApiResponseType {
  errorCode: GigyaSdkErrorCodes
  errorDetails: string
  errorMessage: string
  apiVersion: number
  newUser: boolean
  accountInfo: GigyaSdkLoginErrorPayloadAccountInfoType
  id_token: string
  regToken: string
  loginID?: string
  loginProviders?: ('apple' | 'facebook' | 'site')[]
  validationErrors?: GigyaSdkValidationErrorType[]
}

export interface GigyaSdkErrorType {
  payload: GigyaSdkLoginErrorPayloadType | null
  type: GigyaSdkErrors
  code?: string
  name?: string
  message?: string
  stack?: string
}

export interface GigyaConsentSchemaType {
  key: string
  format: string
  writeAccess: string
  legalStatements: Record<string, { documentUrl: string; purpose: string }>
  customData: unknown[]
  minDocVersion: number
  currentDocVersion: number
  type: string
  required: boolean
}

export interface GigyaSdkProfileType {
  firstName: string
  lastName: string
  email: string
  nickName?: string
  address?: string
  age?: number
  bio?: string
  birthDay?: number
  birthMonth?: number
  birthYear?: number
  capabilities?: string
  certifications?: unknown
  city?: string
  country?: string
  education?: unknown
  educationLevel?: string
  favorites?: unknown
  followersCount?: number
  followingCount?: number
  gender?: string
  hometown?: string
  honors?: string
  identities?: unknown
  industry?: string
  interestedIn?: string
  interests?: string
  isConnected?: boolean
  iRank?: number
  isSiteUID?: boolean
  isSiteUser?: boolean
  languages?: string
  likes?: unknown
  locale?: string
  name?: string
  oldestDataAge?: number
  oldestDataUpdatedTimestamp?: number
  patents?: unknown
  phones?: unknown
  photoURL?: string
  providers?: string
  publications?: unknown
  relationshipStatus?: string
  religion?: string
  samlData?: unknown
  skills?: unknown
  specialities?: string
  state?: string
  timezone?: string
  thumbnailURL?: string
  username?: string
  isVerified?: boolean
  verified?: string
  verifiedTimestamp?: number
  work?: unknown
  zip?: string
}

export interface GigyaSdkLoginType {
  loginProvider: 'apple' | 'facebook' | 'site'
  lastLogin: Date
  profile: GigyaSdkProfileType
  lastUpdatedTimestamp: number
  registeredTimestamp: number
  socialProviders: string
  lastLoginTimestamp: number
  isActive: boolean
  isVerified: boolean
  UID: string
  registered: string
  UIDSignature: string
  verified: Date
  oldestDataUpdated: Date
  signatureTimestamp: string
  oldestDataUpdatedTimestamp: number
  apiVersion: number
  lastUpdated: Date
  verifiedTimestamp: number
  isRegistered: boolean
  createdTimestamp: number
  created: Date
}

export interface GigyaSdkAccountInfoType extends GigyaSdkLoginType {
  lastLoginLocation?: {
    country: string
    coordinates: { lat: number; lon: number }
  }
  preferences?: unknown
  data?: unknown
  identities: Record<string, unknown>[]
  subscriptions?: unknown
  emails?: { verified: string[]; unverified: string[] }
  loginIDs?: { username: string; emails: string[]; unverifiedEmails: string[] }
  isLockedOut?: boolean
  id_token?: string
}

export interface GigyaSdkRegisteredAccountType extends GigyaSdkAccountInfoType {
  sessionInfo: {
    sessionToken: string
    sessionSecret: string
  }
}

export interface GigyaSdkConflictingAccountType {
  loginID: string
  loginProviders: ('apple' | 'facebook' | 'site')[]
}

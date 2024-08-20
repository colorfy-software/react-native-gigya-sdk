export enum GigyaSdkDataCenters {
  /**
   * Australian data center.
   * @console https://console.gigya.com
   */
  AU1 = 'au1.gigya.com',
  /**
   * Chinese data center.
   * @console https://console.cn1.sapcdm.cn
   */
  CN1 = 'cn1.sapcdm.cn',
  /**
   * European data center (excluding Russia).
   * @console https://console.gigya.com
   */
  EU1 = 'eu1.gigya.com',
  /**
   * European Azure data center.
   * @console https://console.gigya.com
   */
  EU2 = 'eu2.gigya.com',
  /**
   * United States data center.
   * @console https://console.gigya.com
   */
  US1 = 'us1.gigya.com',
  /**
   * Must be used with Global site groups.
   * @console Not Applicable
   */
  GLOBAL = 'global.gigya.com',
}

/**
 * Internal state of the library.
 */
export interface GigyaSdkStateType {
  UID: string
  lang: string
  apiKey: string
  storageKey: string
  error?: GigyaSdkErrorType
  dataCenter: GigyaSdkDataCenters
  regToken?: {
    expirationDate?: Date
    isStillValid?: boolean
    value?: GigyaSdkLoginErrorPayloadType['regToken']
  }
  authenticationAttempt?: {
    type?: GigyaSdkLoginProvidersType | GigyaSdkSocialProvidersType
  }
  storage?: {
    setItem: (key: string, value: string) => any
    getItem: (key: string) => string | null | Promise<string | null>
  }
}

/**
 * All login providers supported by the library.
 * @see [Supported Social networks](https://help.sap.com/docs/SAP_CUSTOMER_DATA_CLOUD/8b8d6fffe113457094a17701f63e3d6a/4172d0a670b21014bbc5a10ce4041860.html?locale=en-US&q=social%20login#capabilities-by-network).
 */
export type GigyaSdkLoginProvidersType = 'site' | 'apple' | 'facebook' | 'googleplus' | 'line' | 'wechat'

/**
 * Social login providers supported by the library.
 * @see [Supported Social networks](https://help.sap.com/docs/SAP_CUSTOMER_DATA_CLOUD/8b8d6fffe113457094a17701f63e3d6a/4172d0a670b21014bbc5a10ce4041860.html?locale=en-US&q=social%20login#capabilities-by-network).
 */
export type GigyaSdkSocialProvidersType = Exclude<GigyaSdkLoginProvidersType, 'googleplus' | 'site'> | 'google'

/**
 * Common error codes returned by Gigya's servers.
 * @see [Response Codes and Errors](https://help.sap.com/docs/SAP_CUSTOMER_DATA_CLOUD/8b8d6fffe113457094a17701f63e3d6a/416d41b170b21014bbc5a10ce4041860.html?locale=en-US)
 */
export enum GigyaSdkErrorCodes {
  ValidationError = 400009,
  PermissionDenied = 403007,
  InvalidParameter = 400006,
  ConflictingAccount = 403043,
  PendingVerification = 206002,
  LoginIdDoesNotExist = 403047,
  PendingRegistration = 206001,
  NotConnectedToNetwork = 400106,
  MaxRequestLimitReached = 403000,
  InvalidApiKeyParameter = 400093,
  UniqueIdentifierExists = 400003,
  InvalidLoginIdOrPassword = 403042,
  AccountTemporarilyLockedOut = 403120,
  ConsecutiveRequestLimitReached = 400125,
}

/**
 * Common error reasons returned by Gigya's servers.
 * @see [Response Codes and Errors](https://help.sap.com/docs/SAP_CUSTOMER_DATA_CLOUD/8b8d6fffe113457094a17701f63e3d6a/416d41b170b21014bbc5a10ce4041860.html?locale=en-US)
 */
export enum GigyaSdkErrors {
  NetworkError = 'networkError',
  SendApiError = 'sendApiError',
  EmptyResponse = 'emptyResponse',
  UserCancelled = 'userCancelled',
  UndefinedError = 'undefinedError',
  JsonParseError = 'jsonParseError',
  ValidationError = 'validationError',
  SetAccountError = 'setAccountError',
  InvalidParameter = 'invalidParameter',
  PermissionDenied = 'permissionDenied',
  ConflictingAccount = 'conflictingAccount',
  LoginIdDoesNotExist = 'loginIdDoesNotExist',
  PendingRegistration = 'pendingRegistration',
  PendingVerification = 'pendingVerification',
  NotConnectedToNetwork = 'notConnectedToNetwork',
  PendingPasswordChange = 'pendingPasswordChange',
  CreateURLRequestFailed = 'createURLRequestFailed',
  MaxRequestLimitReached = 'maxRequestLimitReached',
  InvalidApiKeyParameter = 'invalidApiKeyParameter',
  UniqueIdentifierExists = 'uniqueIdentifierExists',
  InvalidLoginIdOrPassword = 'invalidLoginIdOrPassword',
  AccountTemporarilyLockedOut = 'accountTemporarilyLockedOut',
  ConsecutiveRequestLimitReached = 'consecutiveRequestLimitReached',
}

export interface GigyaSdkApiResponseType {
  time: string
  callId: string
  errorCode: number
  statusCode: number
  apiVersion?: number
  statusReason: string
  errorMessage?: string
  errorDetails?: string
  fullEventName?: string
}

export interface GigyaSdkValidationErrorType {
  message: string
  errorCode: number
  fieldName: 'username' | 'password' | 'secretQuestion' | 'secretAnswer' | 'email'
}

export interface GigyaSdkLoginErrorPayloadAccountInfoType extends GigyaSdkApiResponseType {
  UID: string
  email: string
  UIDSig: string
  gender: string
  nickname: string
  photoURL: string
  lastName: string
  firstName: string
  providers: string
  timestamp: string
  isSiteUID: boolean
  isSiteUser: boolean
  isTempUser: boolean
  isLoggedIn: boolean
  UIDSignature: string
  isConnected: boolean
  thumbnailURL: string
  capabilities: string
  loginProvider: string
  oldestDataAge: number
  loginProviderUID: string
  signatureTimestamp: string
  oldestDataUpdatedTimestamp: number
  identities: Record<string, unknown>[]
}

export interface GigyaSdkLoginErrorPayloadType extends GigyaSdkApiResponseType {
  newUser: boolean
  id_token: string
  regToken: string
  loginID?: string
  apiVersion: number
  errorDetails: string
  errorMessage: string
  unverifiedEmail?: string[]
  errorCode: GigyaSdkErrorCodes
  loginProviders?: GigyaSdkLoginProvidersType[]
  validationErrors?: GigyaSdkValidationErrorType[]
  accountInfo: GigyaSdkLoginErrorPayloadAccountInfoType
}

export interface GigyaSdkErrorType {
  code?: string
  name?: string
  stack?: string
  message?: string
  type: GigyaSdkErrors
  payload: GigyaSdkLoginErrorPayloadType | null
}

export type GigyaSdkConsentsStatementsType<
  ConsentIds extends string = string,
  Lang extends string = string
> = GigyaSdkApiResponseType & {
  preferences: GigyaSdkConsentPreferencesType<ConsentIds, Lang>
}

export type GigyaSdkConsentPreferencesType<ConsentIds extends string = string, Lang extends string = string> = Record<
  ConsentIds,
  GigyaSdkConsentStatementType<Lang>
>

export type GigyaSdkConsentWriteAccessType = 'clientCreate' | 'clientModify' | 'serverOnly'

export interface GigyaSdkConsentStatementType<Lang extends string = string> {
  tags: unknown[]
  isActive: boolean
  defaultLang?: Lang
  langs: Array<Lang>
  isMandatory: boolean
  customData: unknown[]
  entitlements: unknown[]
  enforceLocaleReconsent: boolean
  consentVaultRetentionPeriod: number
  writeAccess: GigyaSdkConsentWriteAccessType
}

export interface GigyaSdkConsentSchemaType {
  key: string
  type: string
  format: string
  required: boolean
  writeAccess: string
  customData: unknown[]
  minDocVersion: number
  currentDocVersion: number
  legalStatements: Record<string, { documentUrl: string; purpose: string }>
}

export type GigyaSdkLegalStatementsStatusType = 'Historic' | 'Published'

export interface GigyaSdkLegalStatementsType {
  minDocDate?: string
  minDocVersion: number
  currentDocVersion: number
  publishedDocVersion: number
  versions: Record<
    GigyaSdkLegalStatementsType['minDocVersion'] | GigyaSdkLegalStatementsType['publishedDocVersion'],
    GigyaSdkLegalStatementsVersionType
  >
}

export interface GigyaSdkLegalStatementsVersionType {
  purpose?: string
  documentUrl: string
  LegalStatementStatus: GigyaSdkLegalStatementsStatusType
}

// TODO: Complete via https://help.sap.com/docs/SAP_CUSTOMER_DATA_CLOUD/8b8d6fffe113457094a17701f63e3d6a/41693e9270b21014bbc5a10ce4041860.html?locale=en-US&q=profile

export interface GigyaSdkProfileType {
  age?: number
  bio?: string
  zip?: string
  email: string
  city?: string
  name?: string
  iRank?: number
  state?: string
  work?: unknown
  gender?: string
  honors?: string
  likes?: unknown
  locale?: string
  lastName: string
  address?: string
  country?: string
  skills?: unknown
  firstName: string
  nickName?: string
  birthDay?: number
  hometown?: string
  industry?: string
  patents?: unknown
  photoURL?: string
  religion?: string
  timezone?: string
  username?: string
  verified?: string
  birthYear?: number
  interests?: string
  languages?: string
  samlData?: unknown
  birthMonth?: number
  education?: unknown
  favorites?: unknown
  isSiteUID?: boolean
  identities?: unknown
  isSiteUser?: boolean
  providers?: string[]
  isVerified?: boolean
  capabilities?: string
  interestedIn?: string
  isConnected?: boolean
  specialities?: string
  thumbnailURL?: string
  oldestDataAge?: number
  publications?: unknown
  educationLevel?: string
  followersCount?: number
  followingCount?: number
  certifications?: unknown
  verifiedTimestamp?: number
  relationshipStatus?: string
  oldestDataUpdatedTimestamp?: number
  phones?: GigyaSdkProfilePhoneType | GigyaSdkProfilePhoneType[]
}

export type GigyaSdkProfilePhoneType = {
  type: string
  number: string
}

export interface GigyaSdkLoginType {
  UID: string
  created: Date
  verified: Date
  lastLogin: Date
  isActive: boolean
  lastUpdated: Date
  registered: string
  apiVersion: number
  isVerified: boolean
  UIDSignature: string
  isRegistered: boolean
  socialProviders: string
  oldestDataUpdated: Date
  createdTimestamp: number
  verifiedTimestamp: number
  lastLoginTimestamp: number
  signatureTimestamp: string
  registeredTimestamp: number
  profile: GigyaSdkProfileType
  lastUpdatedTimestamp: number
  oldestDataUpdatedTimestamp: number
  loginProvider: GigyaSdkLoginProvidersType
}

export interface GigyaSdkAccountInfoType extends GigyaSdkLoginType {
  lastLoginLocation?: {
    country: string
    coordinates: { lat: number; lon: number }
  }
  data?: unknown
  id_token?: string
  preferences?: unknown
  isLockedOut?: boolean
  subscriptions?: unknown
  identities: Record<string, unknown>[]
  emails?: { verified: string[]; unverified: string[] }
  loginIDs?: { username: string; emails: string[]; unverifiedEmails: string[] }
}

export interface GigyaSdkRegisteredAccountType extends GigyaSdkAccountInfoType {
  sessionInfo: {
    sessionToken: string
    sessionSecret: string
  }
}

export interface GigyaSdkConflictingAccountType {
  loginID: string
  loginProviders: GigyaSdkLoginProvidersType[]
}

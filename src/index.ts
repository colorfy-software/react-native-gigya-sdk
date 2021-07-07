import { GigyaSdkErrorCodes, GigyaSdkErrors } from './types'
import * as core from './core'
export * from './types'

const GigyaSdk = {
  ErrorCodes: GigyaSdkErrorCodes,
  ErrorsTypeIds: GigyaSdkErrors,

  acceptConsentSchemas: core.acceptConsentSchemas,
  // changePassword:
  // deleteAccount:
  finalizeRegistration: core.finalizeRegistration,
  getAccount: core.getAccount,
  getAccountInfo: core.getAccountInfo,
  getAllSchemas: core.getAllSchemas,
  getConflictingAccount: core.getConflictingAccount,
  getRequiredConsentSchemas: core.getRequiredConsentSchemas,
  getState: core.getState,
  getUnacceptedConsentSchemas: core.getUnacceptedConsentSchemas,
  handleAuthenticationError: core.handleAuthenticationError,
  init: core.init,
  isAvailableLoginId: core.isAvailableLoginId,
  isGigyaError: core.isGigyaError,
  isLoggedIn: core.isLoggedIn,
  // linkToConflictingSite:
  // linkToConflictingSocialProvider:
  login: core.login,
  logout: core.logout,
  registerAccount: core.registerAccount,
  resendVerificationEmail: core.resendVerificationEmail,
  // resetPassword:
  sendApiCall: core.sendApiCall,
  // sendSmsCode:
  setAccount: core.setAccount,
  setAccountInfo: core.setAccountInfo,
  // setProfilePhoto:
  setSession: core.setSession,
  // smsLogin:
  socialLogin: core.socialLogin,
  verifyLogin: core.verifyLogin,
}

export default GigyaSdk

import { GigyaSdkErrorCodes, GigyaSdkErrors } from './types'
import * as core from './core'
export * from './types'

const GigyaSdk = {
  ErrorCodes: GigyaSdkErrorCodes,
  ErrorsTypeIds: GigyaSdkErrors,

  acceptConsentSchemas: core.acceptConsentSchemas,
  declineConsentSchemas: core.declineConsentSchemas,
  deleteAccount: core.deleteAccount,
  finalizeRegistration: core.finalizeRegistration,
  getAccount: core.getAccount,
  getAccountInfo: core.getAccountInfo,
  getAllSchemas: core.getAllSchemas,
  getConflictingAccount: core.getConflictingAccount,
  getOptionalConsentSchemas: core.getOptionalConsentSchemas,
  getRequiredConsentSchemas: core.getRequiredConsentSchemas,
  getState: core.getState,
  getUnacceptedConsentSchemas: core.getUnacceptedConsentSchemas,
  grantRequiredConsents: core.grantRequiredConsents,
  handleAuthenticationError: core.handleAuthenticationError,
  init: core.init,
  isAvailableLoginId: core.isAvailableLoginId,
  isGigyaError: core.isGigyaError,
  isLoggedIn: core.isLoggedIn,
  linkToSite: core.linkToSite,
  linkToSocialProvider: core.linkToSocialProvider,
  login: core.login,
  logout: core.logout,
  registerAccount: core.registerAccount,
  resendVerificationEmail: core.resendVerificationEmail,
  resetPassword: core.resetPassword,
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

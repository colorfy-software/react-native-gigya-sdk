import getState from './getState'
import sendApiCall from './sendApiCall'

type OptionsType = {
  /**
   * The user's answer to the `secretQuestion`. If we do not have any email address for the user or `policies.passwordReset.requireSecurityCheck` is `true`, the password may be reset directly by providing the newPassword parameter, in such case you are required to pass either this parameter or `securityFields`. This field is hashed and can not be extracted.
   *
   * *You are Required to pass one of the parameters either `secretAnswer` or `securityFields`, only in the following cases:
   * - If the site policies define `passwordReset.requireSecurityCheck` to be `true`.
   * - If we do not have any email address already defined for the user. In this case, the `newPassword` parameter is also required.
   */
  secretAnswer?: string
  /**
   * One set of profile fields specified in the policy with their values provided by the user. If we do not have any email address for the user or `policies.passwordReset.requireSecurityCheck` is `true`, the password may be reset directly by providing the `newPassword` parameter, in such case you are required to pass either this parameter or `secretAnswer`.
   * You are **Required** to pass one of the parameters either `secretAnswer` or `securityFields`, only in the following cases:
   * - If the site policies define `passwordReset.requireSecurityCheck` to be `true`.
   * - If we do not have any email address already defined for the user. In this case, the `newPassword` parameter is also required.
   */
  securityFields?: string
  /**
   * Additional information regarding the client who made the login request, used for server-side [Risk Based Authentication](https://help.sap.com/docs/SAP_CUSTOMER_DATA_CLOUD/8b8d6fffe113457094a17701f63e3d6a/dc511d9642664575ad4d5e52579b8117.html?locale=en-US) implementations. When passing the client context, any RBA rules apply and may be triggered.
   *
   * Includes the following fields:
   *
   * - `clientIP` (`string`, required): The IP address of the client from which the login was made. mode, the JWT
   *   contains the attribute: action="verify", telling the provider that we only allow the users to verify themselves.
   *
   * **Note**: When passing a clientIP, other SAP Customer Data Cloud logic is applied to this address, such as IP allowlisting, geo-blocking, and Audit Log records.
   * - `deviceID` (`string`, not required): The ID of the end-user device from which the login was made. The default is null. The maximum number of allowed characters is 100.
   * - `isCaptchaVerified` (`boolean`, not required): Indicates whether the end user has completed a CAPTCHA (or similar) challenge during the registration process. If this is false, and RBA configuration includes a CAPTCHA challenge, the user may be shown a CAPTCHA challenge, based on RBA logic. The default is `false`.
   * - `riskScore` (`float`, not required): A positive numerical value indicating the level of risk associated with this login attempt. This is compared to the defined threshold for triggering a configured RBA rule.
   *
   * Sample object:
   *
   * ```
   *  clientContext: {
   *   clientIP: "123.4.5.6",
   *   deviceID: "00000000-00000000-01234567-89ABCDEF",
   *   isCaptchaVerified: false,
   *   riskScore: 0.8
   *  }
   * ```
   */
  clientContext?: string
  /**
   * If specified, allows sending a password reset link to an unverified email address that is not the current `loginID`, as long as it is already defined in the account.
   */
  email?: string
  /**
   * The language specified for emails. If a [template](https://help.sap.com/docs/SAP_CUSTOMER_DATA_CLOUD/8b8d6fffe113457094a17701f63e3d6a/4139d66d70b21014bbc5a10ce4041860.html?locale=en-US) was defined for that language, the email sent to the user will be
   * in that language. Otherwise, the language used in the email is taken from the locale field of the site identity, if
   * available. This parameter is only valid if the profile.locale is not set.
   */
  lang?: string
  /**
   * The default is `true`. When set to `false` SAP Customer Data Cloud does not send the password reset email to the user,
   * instead, the `passwordResetToken` and the list of valid email addresses are returned in the response of this method
   * (see `passwordResetToken` and `emails` fields in the method response below). This parameter is not supported in the Web
   * SDK.
   */
  sendEmail?: boolean
  /**
   * Determines the format of the response. The options are:
   * - `json` (default)
   * - `jsonp` - if the format is jsonp then you are required to define a callback method (see parameter below).
   */
  format?: string
  /**
   * This parameter is required only when the format parameter is set to jsonp (see above). In such cases this parameter should define the name of the callback method to be called in the response, along with the jsonp response data.
   */
  callback?: string
  /**
   * This parameter may be used to pass data through the current method and return it, unchanged, within the response.
   */
  context?: string
  /**
   * This may be used in some cases to suppress logic applied by the Web SDK, such as automatic opening of screens
   * (e.g., in a registration completion scenario). This parameter may not be used with REST APIs.
   */
  ignoreInterruptions?: boolean
  /**
   * The default value of this parameter is false, which means that the HTTP status code in SAP Customer Data Cloud's
   * response is always 200 (OK),  even if an error occurs. The error code and message is given within the response data
   * (see below). If this parameter is set to true, the HTTP status code in SAP Customer Data Cloud's response would
   * reflect an error, if one occurred.
   */
  httpStatusCodes?: boolean
}

interface OptionsLoginIdType extends OptionsType {
  /**
   * The existing account's `loginID` for identification. Can be a simple username or an email address. If it's an email address, it's the email address to which to send the password reset link, and it must already be associated with the specified account. Use this parameter when you first call this method.
   *
   * *You are required to pass only one of the parameters either `loginID` or `passwordResetToken`.
   */
  loginID: string
}

interface OptionsResetTokenType extends OptionsType {
  /**
   * A token to be used for password reset in the password reset email. You can pass this parameter instead of `loginID` after it is returned in the password reset email. If the token is found to be valid, the new password is set. The default token expiration time is 1 hour, and it can be changed in [`accounts.setPolicies`](https://help.sap.com/docs/SAP_CUSTOMER_DATA_CLOUD/8b8d6fffe113457094a17701f63e3d6a/4139d66d70b21014bbc5a10ce4041860.html?locale=en-US) in the `passwordReset.tokenExpiration` policy.
   *
   * * You are required to pass only one of the parameters either `loginID` or `passwordResetToken`.
   *
   * If `passwordResetToken` is passed, then the `newPassword` parameter is also required.
   */
  passwordResetToken: string
  /**
   * The new password. SAP Customer Data Cloud will reset the password using this parameter only after verifying the ownership of the account, using either passwordResetToken (received with the password reset email), secretAnswer or securityFields parameters. In case loginID is passed (and not passwordResetToken ) and the account includes an email address, this parameter is ignored and an email with a link to a "reset password" page is sent. The password property accepts unicode characters.
   *
   * *This parameter is Required only in the following cases:
   * - If `passwordResetToken` is passed.
   * - If we do not have any email address defined for the user or if the [`policies.passwordReset.requireSecurityCheck`](https://help.sap.com/docs/SAP_CUSTOMER_DATA_CLOUD/8b8d6fffe113457094a17701f63e3d6a/4139d66d70b21014bbc5a10ce4041860.html?locale=en-US) property is set to `true`. In these cases, you are also required to pass either `secretAnswer` or `securityFields` parameters.
   *
   * **Note**: If this parameter is passed, then the method must be called using HTTPS.
   */
  newPassword: string
}

/**
 * This method resets a user's password, either via email or directly. The email format is according to the templates defined in the site policy.
 * @see https://help.sap.com/docs/SAP_CUSTOMER_DATA_CLOUD/8b8d6fffe113457094a17701f63e3d6a/559574624b634e5a955e0f7eeba01c07.html?locale=en-US
 */
export default function <OutputType, ParamsType extends OptionsLoginIdType | OptionsResetTokenType>(
  params: ParamsType = {} as ParamsType
): Promise<OutputType> {
  return new Promise(async (resolve, reject) => {
    try {
      const state = await getState()

      const response = await sendApiCall<OutputType, OptionsType>('accounts.resetPassword', {
        lang: state.lang,
        ...(params && params),
      })

      resolve(response)
    } catch (e) {
      reject(e)
    }
  })
}

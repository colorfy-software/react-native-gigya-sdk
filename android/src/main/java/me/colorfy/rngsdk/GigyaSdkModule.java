package me.colorfy.rngsdk;

import java.util.Map;
import java.util.List;
import java.util.HashMap;

import android.app.Application;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import com.gigya.android.sdk.Gigya;
import com.gigya.android.sdk.GigyaCallback;
import com.gigya.android.sdk.GigyaLoginCallback;
import com.gigya.android.sdk.network.GigyaError;
import com.gigya.android.sdk.session.SessionInfo;
import com.gigya.android.sdk.api.GigyaApiResponse;
import com.gigya.android.sdk.account.models.GigyaAccount;
import com.gigya.android.sdk.interruption.tfa.TFAResolverFactory;
import com.gigya.android.sdk.interruption.link.ILinkAccountsResolver;
import com.gigya.android.sdk.interruption.tfa.models.TFAProviderModel;
import com.gigya.android.sdk.interruption.IPendingRegistrationResolver;



public class GigyaSdkModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext mContext;
    private Gigya mGigya;

    //Constructor
    public GigyaSdkModule(ReactApplicationContext reactContext) {
        super(reactContext);
        mContext = reactContext;
        Gigya.setApplication((Application) mContext.getApplicationContext());
    }

    //Name for module register to use:
    @Override
    public String getName() {
        return "GigyaSdk";
    }

    public static String accountToJSONString(final Object object) {
        Gson gson = new Gson();
        return gson.toJson(object);
    }

    public static HashMap<String, Object> parseParamsString(final String params) throws Exception{
        return new Gson().fromJson(params, new TypeToken<HashMap<String, Object>>() {}.getType());
    }

    @ReactMethod
    public void initialize(ReadableMap config, final Promise promise) {
      Gigya.getInstance(GigyaAccount.class).init(config.getString("apiKey"), config.getString("dataCenter"));
      mGigya = Gigya.getInstance(GigyaAccount.class);
      promise.resolve(true);
    }

    @ReactMethod
    public void sendApiCall(final String api, final String params, final Promise promise) {
        try {
            mGigya.send(api, parseParamsString(params), new GigyaCallback<GigyaApiResponse>() {
                @Override
                public void onError(GigyaError gigyaError) {
                    promise.reject("sendApiError", gigyaError.getData());
                }

                @Override
                public void onSuccess(GigyaApiResponse gigyaApiResponse) {
                    promise.resolve(gigyaApiResponse.asJson());
                }
            });
        } catch(Exception e) {
            promise.reject("sendApiCall", String.valueOf(e));
            return;
        }
    }

    @ReactMethod
    public void registerAccount(final String email, final String password, final String params, final Promise promise) {
        try {
            mGigya.register(email, password, parseParamsString(params), new GigyaLoginHandler(promise));
        } catch(Exception e) {
            promise.reject("registerAccount", String.valueOf(e));
        }

    }

    @ReactMethod
    public void login(final String email, final String password, final String params, final Promise promise) {
        try {
            Map<String, Object> paramsMap = parseParamsString(params);
            paramsMap.put("loginID", email);
            paramsMap.put("password", password);
            mGigya.login(paramsMap, new GigyaLoginHandler(promise));
        } catch(Exception e) {
            promise.reject("login", String.valueOf(e));
        }

    }

    @ReactMethod
    public void socialLogin(final String provider, final String params, final Promise promise) {
        try {
            mGigya.login(provider, parseParamsString(params), new GigyaLoginHandler(promise));
        } catch(Exception e) {
            promise.reject("socialLogin", String.valueOf(e));
        }

    }
    
    @ReactMethod
    public void setSession(final String sessionToken, final String sessionSecret, final Promise promise) {
        SessionInfo sessionInfo = new SessionInfo(sessionSecret, sessionToken);
        mGigya.setSession(sessionInfo);
        promise.resolve(true);
    }

    @ReactMethod
    public void getAccount(final Promise promise) {
        mGigya.getAccount(true, new GigyaLoginCallback<GigyaAccount>() {
            @Override
            public void onSuccess(GigyaAccount gigyaAccount) {
                try {
                    promise.resolve(accountToJSONString(gigyaAccount));
                } catch(Exception e) {
                    promise.reject("getAccountErrorJSON", "{}", e);
                }
            }

            @Override
            public void onError(GigyaError gigyaError) {

            }
        });
    }

    @ReactMethod
    public void setAccount(final String params, final Promise promise) {
        try {
            mGigya.setAccount(parseParamsString(params), new GigyaCallback<GigyaAccount>() {
                @Override
                public void onError(GigyaError gigyaError) {
                    promise.reject("setAccountError", gigyaError.getData());
                }

                @Override
                public void onSuccess(GigyaAccount gigyaAccount) {
                    promise.resolve(accountToJSONString(gigyaAccount));
                }
            });
        } catch(Exception e) {
            promise.reject("setAccount", String.valueOf(e));
        }
    }

    @ReactMethod
    public void isLoggedIn(final Promise promise) {
        promise.resolve(mGigya.isLoggedIn());
    }

    @ReactMethod
    public void logout(final Promise promise) {
        mGigya.logout(new GigyaCallback<GigyaApiResponse>() {
            @Override
            public void onSuccess(GigyaApiResponse gigyaApiResponse) {
                promise.resolve(true);
            }

            @Override
            public void onError(GigyaError gigyaError) {
                promise.reject("logoutError", "{}", new Exception(gigyaError.toString()));
            }
        });
    }

}

class GigyaLoginHandler extends GigyaLoginCallback<GigyaAccount> {

    private Promise mPromise;

    GigyaLoginHandler(Promise promise) {
        mPromise = promise;
    }

    @Override
    public void onSuccess(GigyaAccount gigyaAccount) {
        try {
            mPromise.resolve(GigyaSdkModule.accountToJSONString(gigyaAccount));
        } catch (Exception e) {
            mPromise.reject("getAccountErrorJSON", "{}", e);
        }
    }

    @Override
    public void onOperationCanceled() {
        mPromise.reject("userCancelled", "{}");
    }

    @Override
    public void onError(GigyaError gigyaError) {
        mPromise.reject("undefinedError", gigyaError.getData(), new Exception(gigyaError.getData()));
    }

    public void onPendingVerification(GigyaApiResponse response, String regToken) {
        mPromise.reject("pendingVerification", GigyaError.fromResponse(response).getData(), new Exception(GigyaError.fromResponse(response).getData()));
    }

    public void onPendingRegistration(GigyaApiResponse response, IPendingRegistrationResolver resolver) {
        mPromise.reject("pendingRegistration", GigyaError.fromResponse(response).getData(), new Exception(GigyaError.fromResponse(response).getData()));
    }

    public void onConflictingAccounts(GigyaApiResponse response, ILinkAccountsResolver resolver) {
        mPromise.reject("conflictingAccount", GigyaError.fromResponse(response).getData(), new Exception(response.asJson()));
    }

    public void onPendingPasswordChange(GigyaApiResponse response) {
        mPromise.reject("pendingPasswordChange", GigyaError.fromResponse(response).getData(), new Exception(GigyaError.fromResponse(response).getData()));
    }

    public void onPendingTwoFactorRegistration(GigyaApiResponse response, List<TFAProviderModel> inactiveProviders, TFAResolverFactory resolverFactory) {
        mPromise.reject("pendingTwoFactorRegistration", GigyaError.fromResponse(response).getData(), new Exception(GigyaError.fromResponse(response).getData()));
    }

    public void onPendingTwoFactorVerification(GigyaApiResponse response, List<TFAProviderModel> activeProviders, TFAResolverFactory resolverFactory) {
        mPromise.reject("pendingTwoFactorVerification", GigyaError.fromResponse(response).getData(), new Exception(GigyaError.fromResponse(response).getData()));
    }
}

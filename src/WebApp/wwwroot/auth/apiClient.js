/* GLOBAL (no imports/exports). Adds an axios interceptor that injects the MSAL token. */
/* Requires axios and msal-browser UMD scripts to be loaded before this file. */

(function () {
  if (!window.msalConfig) {
    console.error("msalConfig missing. Load wwwroot/auth/msalConfig.js before apiClient.js");
    return;
  }

  var pca = window.__pca || new msal.PublicClientApplication(window.msalConfig);
  window.__pca = pca;

  function buildApiTokenRequest(account) {
    const req = Object.assign({}, window.apiRequest || {});
    req.account = account;
    return req;
  }

  async function getToken() {
    var accounts = pca.getAllAccounts();
    if (accounts.length === 0) return null;

    try {
      const result = await pca.acquireTokenSilent(buildApiTokenRequest(accounts[0]));
      return result.accessToken;
    } catch (e) {
      console.warn("acquireTokenSilent (API) failed; no token injected for this request.", e);
      return null;
    }
  }

  if (window.axios) {
    axios.interceptors.request.use(async function (config) {
      const token = await getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = "Bearer " + token;
      }
      return config;
    });

    // Do NOT auto-redirect on 401; AuthGate controls interactive login.
    axios.interceptors.response.use(undefined, function (error) {
      return Promise.reject(error);
    });
  } else {
    console.warn("axios not found; apiClient interceptor not installed.");
  }
})();

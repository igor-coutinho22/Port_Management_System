/* wwwroot/auth/apiClient.js */
/* GLOBAL (no imports/exports). Adds an axios interceptor that injects the MSAL token. */
/* Requires axios and msal-browser UMD scripts to be loaded before this file. */

(function () {
  if (!window.msalConfig) {
    console.error("msalConfig missing. Load wwwroot/auth/msalConfig.js before apiClient.js");
    return;
  }

  // Create (or reuse) a PublicClientApplication for token acquisition
  var pca = window.__pca || new msal.PublicClientApplication(window.msalConfig);
  window.__pca = pca; // expose for debugging

  async function getToken() {
    var accounts = pca.getAllAccounts();
    if (accounts.length === 0) return null;

    try {
      var result = await pca.acquireTokenSilent(
        Object.assign({ account: accounts[0] }, window.loginRequest)
      );
      return result.accessToken;
    } catch (e) {
      // Let the AuthGate in app.jsx perform loginRedirect; just return null here.
      console.warn("acquireTokenSilent failed; user may need to sign in.", e);
      return null;
    }
  }

  if (window.axios) {
    // Attach token to every request
    axios.interceptors.request.use(async function (config) {
      var token = await getToken();
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = "Bearer " + token;
      }
      return config;
    });

    // Optional: on 401, you can trigger a login if desired
    axios.interceptors.response.use(undefined, async function (error) {
      if (error && error.response && error.response.status === 401) {
        try {
          await pca.loginRedirect(window.loginRequest);
        } catch (_) { /* ignore */ }
      }
      return Promise.reject(error);
    });
  } else {
    console.warn("axios not found; apiClient interceptor not installed.");
  }
})();

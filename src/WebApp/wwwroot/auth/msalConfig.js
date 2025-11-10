/* wwwroot/auth/msalConfig.js */
(function () {
  // CIAM tenant settings
  const HOST       = "https://sinesport.ciamlogin.com";
  const TENANT_ID  = "a8192c11-2c11-4411-a807-8b0659f4c9a9"; // <- from your JSON
  // SPA app (FrontEnd) client ID
  const SPA_CLIENT_ID = "453a7c55-4b93-4b26-8280-4d87954bdf19";

  window.msalConfig = {
    auth: {
      // IMPORTANT: CIAM uses tenant-ID authority (no B2C policy here)
      authority: `${HOST}/${TENANT_ID}`,          // MSAL will call .../v2.0/.well-known/openid-configuration
      clientId: SPA_CLIENT_ID,
      knownAuthorities: ["sinesport.ciamlogin.com"],
      redirectUri: window.location.origin,        // e.g., https://localhost:5179
      postLogoutRedirectUri: window.location.origin
    },
    cache: {
      cacheLocation: "sessionStorage",
      storeAuthStateInCookie: false
    }
  };

  // Your API scope (from Expose an API)
  window.loginRequest = {
    scopes: ["api://port-management/api.read"]
  };
})();

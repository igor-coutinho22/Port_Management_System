(function () {
  const HOST = "https://sinesport.ciamlogin.com";
  const TENANT_ID = "a8192c11-2c11-4411-a807-8b0659f4c9a9";
  const SPA_CLIENT_ID = "453a7c55-4b93-4b26-8280-4d87954bdf19";

  window.msalConfig = {
    auth: {
      authority: `${HOST}/${TENANT_ID}`,
      clientId: SPA_CLIENT_ID,
      knownAuthorities: ["sinesport.ciamlogin.com"],
      redirectUri: window.location.origin,
      postLogoutRedirectUri: window.location.origin,
      navigateToLoginRequestUrl: false
    },
    cache: { cacheLocation: "localStorage", storeAuthStateInCookie: false }
  };

  // Keep login (interactive) lightweight: OIDC only
  window.loginRequest = {
    scopes: ["openid", "profile", "email"]
  };

  // Use this for API tokens (replace with your real GUID and scope name)
  window.apiRequest = {
    scopes: ["api://port-management/api.read"]
  };  
})();

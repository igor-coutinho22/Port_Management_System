export const msalConfig = {
  auth: {
    clientId: "453a7c55-4b93-4b26-8280-4d87954bdf19",
    authority: "https://sinesport.b2clogin.com/<tenant>.onmicrosoft.com/B2C_1_signupsignin",
    knownAuthorities: ["sinesport.b2clogin.com"],
    redirectUri: "http://localhost:5173",
    postLogoutRedirectUri: "http://localhost:5173"
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false
  }
};

export const loginRequest = {
  scopes: ["api://port-management/api.read"]
};

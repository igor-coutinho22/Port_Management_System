import axios from "axios";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "./msalConfig";

const pca = new PublicClientApplication(msalConfig);

const api = axios.create({ baseURL: "https://localhost:5001" });

async function getToken() {
  const accounts = pca.getAllAccounts();
  if (accounts.length === 0) return null;
  try {
    const res = await pca.acquireTokenSilent({ ...loginRequest, account: accounts[0] });
    return res.accessToken;
  } catch (e) {
    await pca.loginRedirect(loginRequest);
    return null;
  }
}

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(undefined, async (error) => {
  if (error?.response?.status === 401) {
    await pca.loginRedirect(loginRequest);
  }
  return Promise.reject(error);
});

export default api;

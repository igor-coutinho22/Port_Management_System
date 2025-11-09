import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "./msalConfig";

export default function AuthGate({ children }) {
  const { instance, accounts } = useMsal();

  useEffect(() => {
    if (accounts.length === 0) {
      instance.loginRedirect(loginRequest);
    }
  }, [accounts, instance]);

  if (accounts.length === 0) return null;
  return <>{children}</>;
}

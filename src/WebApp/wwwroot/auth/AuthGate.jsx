/* global React, msal */
(function () {
  /**
   * Shared AuthGate for script-tag JSX apps.
   * Depends on:
   *   - window.__pca        (PublicClientApplication)
   *   - window.__msalReady  (Promise from handleRedirectPromise)
   *   - window.loginRequest (from msalConfig.js)
   */
  function AuthGate({ children }) {
    const [ready, setReady] = React.useState(false);

    React.useEffect(() => {
      let cancelled = false;

      (async () => {
        const pca = window.__pca;
        const msalReady = window.__msalReady;

        if (!pca || !msalReady) {
          console.error("AuthGate: MSAL globals not ready.");
          return;
        }

        // Wait for redirect processing to complete
        await msalReady;
        if (cancelled) return;

        const accounts = pca.getAllAccounts();
        if (accounts.length > 0) {
          if (!pca.getActiveAccount()) pca.setActiveAccount(accounts[0]);
          sessionStorage.removeItem("msal.login.started");
          setReady(true);
          return;
        }

        // If a previous interactive login failed hard (handled by msalReady catch),
        // don't keep retrying the redirect. Let the app show something instead.
        if (sessionStorage.getItem("msal.preventLogin") === "1") {
          console.warn("AuthGate: login prevented due to prior error.");
          return;
        }

        // Prevent double login attempts
        const alreadyStarting = sessionStorage.getItem("msal.login.started") === "1";
        if (alreadyStarting) return;

        sessionStorage.setItem("msal.login.started", "1");
        try {
          await pca.loginRedirect(window.loginRequest);
          // Browser navigates; nothing after this
        } catch (e) {
          console.error("AuthGate: loginRedirect failed:", e && (e.errorCode || e.message), e);
          sessionStorage.removeItem("msal.login.started");
          // Set a one-shot fuse to stop infinite attempts if the same error persists
          sessionStorage.setItem("msal.preventLogin", "1");
          // Optional: show something minimal
          const root = document.getElementById("root");
          if (root && !cancelled) {
            root.insertAdjacentHTML(
              "afterbegin",
              '<div style="padding:12px;color:#b00;font-family:sans-serif">Login failed. Please refresh to retry.</div>'
            );
          }
        }
      })();

      // React to MSAL events once
      const pca = window.__pca;
      const cbId = pca?.addEventCallback((evt) => {
        if (evt.eventType === msal.EventType.LOGIN_SUCCESS && evt.payload?.account) {
          pca.setActiveAccount(evt.payload.account);
          sessionStorage.removeItem("msal.login.started");
          sessionStorage.removeItem("msal.preventLogin");
          if (!cancelled) setReady(true);
        }
        if (evt.eventType === msal.EventType.LOGIN_FAILURE) {
          // Stop repeated attempts if the failure is persistent
          sessionStorage.removeItem("msal.login.started");
          sessionStorage.setItem("msal.preventLogin", "1");
        }
      });

      return () => {
        cancelled = true;
        if (cbId) pca.removeEventCallback(cbId);
      };
    }, []);

    if (!ready) return null;
    return children;
  }

  window.AuthGate = AuthGate;
})();

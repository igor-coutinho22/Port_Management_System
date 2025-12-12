(function () {

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

        // SPECIAL CASE: ACTIVATION PAGE (NO LOGIN)
        const href = window.location.href;
        const hash = window.location.hash || ""; // "#activation-success"
        const pageHash = hash.startsWith("#") ? hash.substring(1) : hash;
        const basePage = pageHash.split("?")[0]; // "activation-success"
        const isActivationPage =
          basePage === "activation-success" || href.includes("activation-success");

        if (isActivationPage) {
          console.log("AuthGate: allowing anonymous access to activation-success route");
          sessionStorage.removeItem("msal.login.started");
          sessionStorage.removeItem("msal.preventLogin");
          setReady(true);
          return;
        }

        // NORMAL FLOW
        await msalReady;
        if (cancelled) return;

        const accounts = pca.getAllAccounts();
        if (accounts.length > 0) {
          if (!pca.getActiveAccount()) pca.setActiveAccount(accounts[0]);

          sessionStorage.removeItem("msal.login.started");
          sessionStorage.removeItem("msal.preventLogin");

          setReady(true);
          return;
        }

        // If a previous interactive login failed hard, don't keep retrying
        if (sessionStorage.getItem("msal.preventLogin") === "1") {
          console.warn("AuthGate: login prevented due to prior error.");
          setReady(true);
          return;
        }

        // Prevent double login attempts
        const alreadyStarting = sessionStorage.getItem("msal.login.started") === "1";
        if (alreadyStarting) return;

        // NO ACCOUNT  START LOGIN 
        sessionStorage.setItem("msal.login.started", "1");
        try {
          await pca.loginRedirect(window.loginRequest);
        } catch (e) {
          console.error(
            "AuthGate: loginRedirect failed:",
            e && (e.errorCode || e.message),
            e
          );
          sessionStorage.removeItem("msal.login.started");
          sessionStorage.setItem("msal.preventLogin", "1");

          const root = document.getElementById("root");
          if (root && !cancelled) {
            root.insertAdjacentHTML(
              "afterbegin",
              '<div style="padding:12px;color:#b00;font-family:sans-serif">Login failed. Please refresh to retry.</div>'
            );
          }
        }
      })();

      // MSAL EVENT CALLBACKS 
      const pca = window.__pca;
      const cbId = pca?.addEventCallback((evt) => {
        if (evt.eventType === msal.EventType.LOGIN_SUCCESS && evt.payload?.account) {
          pca.setActiveAccount(evt.payload.account);

          sessionStorage.removeItem("msal.login.started");
          sessionStorage.removeItem("msal.preventLogin");

          pca.acquireTokenSilent(window.apiRequest).catch(e => {
            console.warn("Initial acquireTokenSilent failed, trying redirect", e);
            return pca.acquireTokenRedirect(window.apiRequest);
          });

          if (!cancelled) setReady(true);
        }

        if (evt.eventType === msal.EventType.LOGIN_FAILURE) {
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

(function () {
  function AuthGate({ children }) {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [showPolicy, setShowPolicy] = React.useState(false);
    const [policyContent, setPolicyContent] = React.useState("");

    const login = async () => {
        const pca = window.__pca;
        try {
            await pca.loginRedirect(window.loginRequest);
        } catch (e) {
            console.error(e);
        }
    };

    const handleOpenPolicy = async (e) => {
        e.preventDefault();
        try {
            // Fetch the public policy (US 4.5.4)
            // Note: Ensure your backend runs on port 6001 or use full URL
            const res = await fetch("https://localhost:6001/api/privacy/latest");
            if(res.ok) {
                const data = await res.json();
                setPolicyContent(data.content);
                setShowPolicy(true);
            } else {
                alert("Could not load policy.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    React.useEffect(() => {
      const pca = window.__pca;
      if (!pca) return;

      // Check if user is already signed in
      const accounts = pca.getAllAccounts();
      if (accounts.length > 0) {
        pca.setActiveAccount(accounts[0]);
        setIsLoggedIn(true);
      } else {
        // DO NOT REDIRECT AUTOMATICALLY ANYMORE
        // Just let the "Landing Page" render below
        setIsLoggedIn(false);
      }

      // Listen for successful login callbacks (when they return from Microsoft)
      const cbId = pca.addEventCallback((evt) => {
         if (evt.eventType === msal.EventType.LOGIN_SUCCESS && evt.payload?.account) {
             pca.setActiveAccount(evt.payload.account);
             setIsLoggedIn(true);
         }
      });

      return () => {
         if(cbId) pca.removeEventCallback(cbId);
      };
    }, []);

    // 1. If Logged In, render the App (Children)
    if (isLoggedIn) {
        return children;
    }

    // 2. If NOT Logged In, render the "Landing Page" (Login + Privacy Link)
    return (
        <div style={{ 
            height: "100vh", display: "flex", flexDirection: "column", 
            alignItems: "center", justifyContent: "center", background: "#f0f2f5" 
        }}>
            <div style={{ background: "white", padding: "40px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", textAlign: "center" }}>
                <h1 style={{ marginBottom: "20px", color: "#333" }}>Sines Port Management</h1>
                
                <button 
                    onClick={login}
                    style={{ 
                        padding: "10px 20px", fontSize: "16px", background: "#0078d4", 
                        color: "white", border: "none", borderRadius: "4px", cursor: "pointer" 
                    }}
                >
                    Sign In with Microsoft
                </button>

                {/* US 4.5.4: Privacy Policy Link for Non-Users */}
                <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
                    Not a user? Read our 
                    <a href="#" onClick={handleOpenPolicy} style={{ marginLeft: "5px", color: "#0078d4" }}>
                        Privacy Policy
                    </a>.
                </div>
            </div>

            {/* Privacy Policy Modal */}
            {showPolicy && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <div style={{ background: "white", padding: "20px", borderRadius: "8px", maxWidth: "600px", maxHeight: "80vh", overflow: "auto" }}>
                        <h2>Privacy Policy</h2>
                        <div style={{ whiteSpace: "pre-wrap", margin: "20px 0", textAlign: "left" }}>
                            {policyContent}
                        </div>
                        <button onClick={() => setShowPolicy(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
  }

  window.AuthGate = AuthGate;
})();
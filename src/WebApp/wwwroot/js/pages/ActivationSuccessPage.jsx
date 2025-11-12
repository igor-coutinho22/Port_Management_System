// File: wwwroot/js/pages/ActivationSuccessPage.jsx

console.log("ActivationSuccessPage.jsx loaded");

(function () {
    const ActivationSuccessPage = () => {
        const params = new URLSearchParams(window.location.search);
        const tempPassword = params.get("password"); // Get the password from the URL
        const [password, setPassword] = React.useState(tempPassword || '');
        const [msg, setMsg] = React.useState('Your account has been successfully activated!');
        const [copyMsg, setCopyMsg] = React.useState('');

        const copyToClipboard = () => {
            navigator.clipboard.writeText(password).then(() => {
                setCopyMsg('Password copied to clipboard!');
            }).catch(() => {
                setCopyMsg('Failed to copy password.');
            });
        };

        return (
            <div className="page-section" style={{ maxWidth: 640, margin: "0 auto", textAlign: 'center' }}>
                <h2 className="page-title">🎉 Account Activated!</h2>
                <p>{msg}</p>

                {password && (
                    <div style={{ marginTop: 20 }}>
                        <h3>Your Temporary Password</h3>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', wordBreak: 'break-word' }}>
                            {password}
                        </div>

                        <button className="btn-small" onClick={copyToClipboard} style={{ marginTop: 12 }}>
                            Copy Password
                        </button>

                        {copyMsg && (
                            <div className={`info ${copyMsg.includes("✅") ? "success" : "error"}`} style={{ marginTop: 12 }}>
                                {copyMsg}
                            </div>
                        )}
                    </div>
                )}

                <div style={{ marginTop: 20 }}>
                    <button className="btn" onClick={() => window.location.href = "/login"}>
                        Go to Login Page
                    </button>
                </div>
            </div>
        );
    };

    window.ActivationSuccessPage = ActivationSuccessPage;
})();

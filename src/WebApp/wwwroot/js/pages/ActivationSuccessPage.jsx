console.log("ActivationSuccessPage.jsx loaded");

(function () {
    const ActivationSuccessPage = () => {
        const [password, setPassword] = React.useState('');
        const [msg, setMsg] = React.useState('Your account has been successfully activated!');
        const [copyMsg, setCopyMsg] = React.useState('');
        const [isLoading, setIsLoading] = React.useState(true);

        // Get the token from the URL when the component mounts
        React.useEffect(() => {
            const params = new URLSearchParams(window.location.search);
            const token = params.get("token"); // Get the token from the URL

            if (token) {
                console.log("Received token: " + token);
                fetch(`/api/activation/getTempPassword?token=${token}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.password) {
                            setPassword(data.password);
                        } else {
                            setMsg('Unable to retrieve your temporary password.');
                        }
                    })
                    .catch(error => {
                        setMsg('An error occurred while retrieving your password.');
                    })
                    .finally(() => setIsLoading(false));
            } else {
                setMsg('Invalid activation token.');
                setIsLoading(false);
            }
        }, []); // Empty dependency array means this runs only once when the component mounts

        const copyToClipboard = () => {
            navigator.clipboard.writeText(password).then(() => {
                setCopyMsg('Password copied to clipboard!');
            }).catch(() => {
                setCopyMsg('Failed to copy password.');
            });
        };

        return (
            <div className="page-section" style={{ maxWidth: 640, margin: "0 auto", textAlign: 'center' }}>
                <h2 className="page-title">Account Activated!</h2>
                <p>{msg}</p>

                {isLoading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    password && (
                        <div style={{ marginTop: 20 }}>
                            <h3>Your Temporary Password</h3>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', wordBreak: 'break-word' }}>
                                {password}
                            </div>

                            <button className="btn-small" onClick={copyToClipboard} style={{ marginTop: 12 }}>
                                Copy Password
                            </button>

                            {copyMsg && (
                                <div className={`info ${copyMsg.includes("copied") ? "success" : "error"}`} style={{ marginTop: 12 }}>
                                    {copyMsg}
                                </div>
                            )}
                        </div>
                    )
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

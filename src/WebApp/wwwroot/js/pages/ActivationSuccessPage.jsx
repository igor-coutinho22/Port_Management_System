const ActivationSuccessPage = () => {
    const [tempPassword, setTempPassword] = React.useState(null);

    React.useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");
        if (!token) return;

        window.apiService
            .get(`/activation/getTempPassword?token=${encodeURIComponent(token)}`)
            .then(data => setTempPassword(data.password))
            .catch(err => console.error(err));
    }, []);

    const handleLogin = () => {
        const pca = window.__pca;
        if (!pca) {
            console.error("MSAL PCA not found");
            return;
        }

        pca.loginRedirect(window.loginRequest);
    };

    return (
        <div className="page-section">
            <h2>Conta ativada com sucesso</h2>
            <p>A sua conta foi ativada. Utilize o seu email e a palavra-passe temporária para iniciar sessão.</p>
            {tempPassword && (
                <p>
                    <strong>Palavra-passe temporária:</strong> {tempPassword}
                </p>
            )}
            <button className="btn" onClick={handleLogin}>
                Ir para login
            </button>
        </div>
    );
};

window.ActivationSuccessPage = ActivationSuccessPage;

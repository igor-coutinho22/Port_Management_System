const ActivationSuccessPage = () => {
    const [tempPassword, setTempPassword] = React.useState(null);
    const { t } = window.useTranslation ? window.useTranslation() : { t: (k) => window.t ? window.t(k) : k };

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
            <h2>{t('activationSuccessPage.title')}</h2>
            <p>{t('activationSuccessPage.description')}</p>
            {tempPassword && (
                <p>
                    <strong>{t('activationSuccessPage.tempPassword')}</strong> {tempPassword}
                </p>
            )}
            <button className="btn" onClick={handleLogin}>
                {t('activationSuccessPage.button.login')}
            </button>
        </div>
    );
};

window.ActivationSuccessPage = ActivationSuccessPage;

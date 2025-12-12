const AccessDeniedPage = () => {
    const { t } = window.useTranslation ? window.useTranslation() : { t: (k) => window.t ? window.t(k) : k };
    return (
        <div className="page-section">
            <h2>{t('accessDeniedPage.title')}</h2>
            <p>{t('accessDeniedPage.description')}</p>
        </div>
    );
};
window.AccessDeniedPage = AccessDeniedPage;

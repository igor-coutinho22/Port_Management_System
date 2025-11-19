// Home Page Component - React
/* global React */

const HomePage = () => {
    const { t } = useTranslation();
    const { canAccessMenu, isLoadingUser, isAuthenticated } = useUser();

    const features = [
        {
            titleKey: "home.feature.management.title",
            descKey: "home.feature.management.desc",
            route: "management",
        },
        {
            titleKey: "home.feature.admin_users.title",
            descKey: "home.feature.admin_users.desc",
            route: "admin-users",
        },
        {
            titleKey: "home.feature.3d_view.title",
            descKey: "home.feature.3d_view.desc",
            route: "3d-view",
        },
        {
            titleKey: "home.feature.api_docs.title",
            descKey: "home.feature.api_docs.desc",
            route: "api-docs",
        },
    ];

    // While user/roles are loading, show a placeholder
    if (isLoadingUser) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t("home.welcome_message")}</h2>
                <p>{t("home.description")}</p>
                <p>{t("home.loading_user", "Loading your access…")}</p>
            </div>
        );
    }

    // If somehow not authenticated, show a basic message
    if (!isAuthenticated) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t("home.welcome_message")}</h2>
                <p>{t("home.description")}</p>
                <p>{t("home.not_authenticated", "You are not authenticated.")}</p>
            </div>
        );
    }

    // Only keep the features that the current role can access
    const visibleFeatures = features.filter((f) => canAccessMenu(f.route));

    return (
        <div className="page-section">
            <h2 className="page-title">{t("home.welcome_message")}</h2>
            <p>{t("home.description")}</p>

            <div className="feature-grid">
                {visibleFeatures.map((feature) => (
                    <FeatureCard
                        key={feature.route}
                        titleKey={feature.titleKey}
                        descKey={feature.descKey}
                        route={feature.route}
                    />
                ))}

                {visibleFeatures.length === 0 && (
                    <p>
                        {t(
                            "home.no_features_for_role",
                            "No features are available for your current role."
                        )}
                    </p>
                )}
            </div>
        </div>
    );
};

// Feature Card Sub-component
const FeatureCard = ({ titleKey, descKey, route }) => {
    const { t } = useTranslation();

    const handleClick = () => {
        if (window.app && typeof window.app.navigate === "function") {
            window.app.navigate(route);
        }
    };

    return (
        <div
            className="feature-card"
            onClick={handleClick}
            style={{ cursor: "pointer" }}
        >
            <h3>{t(titleKey)}</h3>
            <p>{t(descKey)}</p>
        </div>
    );
};

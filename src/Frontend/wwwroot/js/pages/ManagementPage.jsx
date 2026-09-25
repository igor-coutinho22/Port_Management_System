// Management Page Component - Unified management interface
/* global React */

const ManagementPage = () => {
    const { t } = useTranslation();
    const { canAccessMenu, isLoadingUser, isAuthenticated } = useUser();

    const managementEntities = [
        {
            id: "resources",
            title: t("entities.resources"),
            description: t("management_page.resources"),
            icon: "📦",
        },
        {
            id: "vessels",
            title: t("entities.vessels"),
            description: t("management_page.vessels"),
            icon: "🚢",
        },
        {
            id: "vessel-types",
            title: t("entities.vessel_types"),
            description: t("management_page.vessel_types"),
            icon: "🛳️",
        },
        {
            id: "docks",
            title: t("entities.docks"),
            description: t("management_page.docks"),
        },
        {
            id: "storage-areas",
            title: t("entities.storage_areas"),
            description: t("management_page.storage_areas"),
            icon: "🏪",
        },
        {
            id: "organizations",
            title: t("entities.organizations"),
            description: t("management_page.organizations"),
            icon: "🏢",
        },
        {
            id: "representatives",
            title: t("entities.representatives"),
            description: t("management_page.representatives"),
            icon: "👨‍💼",
        },
        {
            id: "staff",
            title: t("entities.staff"),
            description: t("management_page.staff"),
            icon: "👷‍♂️",
        },
        {
            id: "vessel-visit-notifications",
            title: t("entities.notifications"),
            description: t("management_page.notifications"),
            icon: "📋",
        },
        {
            id: "qualifications",
            title: t("entities.qualifications"),
            description: t("management_page.qualifications"),
            icon: "🎓",
        },
        {
            id: "vessel-visit-executions",
            title: t("entities.executions"),
            description: t("management_page.executions"),
        },
        {
            id: "incident-types",
            title: t("entities.incident_types"),
            description: t("management_page.incident_types"),
        },
        {
            id: "incidents",
            title: t("entities.incidents"),
            description: t("management_page.incidents"),
        },
        {
            id: "task-categories",
            title: t("entities.task_categories"),
            description: t("management_page.task_categories"),
        },
        {
            id: "complementary-tasks",
            title: t("entities.complementary_tasks"),
            description: t("management_page.complementary_tasks"),
        },
    ];

    const handleEntityClick = (entity) => {

        if (window.appNavigate) {
            window.appNavigate(entity.id);
        } else if (window.app && typeof window.app.navigate === "function") {
            window.app.navigate(entity.id);
        } else {
            window.location.hash = entity.id;
        }
    };

    // While user/roles are loading, show a placeholder
    if (isLoadingUser) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t("management_page.title")}</h2>
                <p>{t("management_page.description")}</p>
                <p>{t("home.loading_user", "Loading your access…")}</p>
            </div>
        );
    }

    // If somehow not authenticated, show a basic message
    if (!isAuthenticated) {
        return (
            <div className="page-section">
                <h2 className="page-title">{t("management_page.title")}</h2>
                <p>{t("management_page.description")}</p>
                <p>{t("home.not_authenticated", "You are not authenticated.")}</p>
            </div>
        );
    }

    // Only keep entities that the current role can access
    // (ids line up with MENU_PERMISSIONS keys: resources, vessels, docks, etc.)
    const visibleEntities = managementEntities.filter((e) => canAccessMenu(e.id));

    return (
        <div className="page-section">
            <h2 className="page-title">{t("management_page.title")}</h2>
            <p>{t("management_page.description")}</p>

            <div className="feature-grid">
                {visibleEntities.map((entity) => (
                    <div
                        key={entity.id}
                        className="feature-card management-card"
                        onClick={() => handleEntityClick(entity)}
                        style={{ cursor: "pointer" }}
                    >
                        <h3>{entity.title}</h3>
                        <p>{entity.description}</p>
                    </div>
                ))}

                {visibleEntities.length === 0 && (
                    <p>
                        {t(
                            "management_page.no_entities_for_role",
                            "No management areas are available for your current role."
                        )}
                    </p>
                )}
            </div>
        </div>
    );
};

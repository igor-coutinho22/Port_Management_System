/* global React, ReactDOM, msal */

// ---------- Safety: require MSAL config ----------
if (!window.msalConfig || !window.loginRequest) {
    const el = document.getElementById("root");
    if (el) {
        el.innerHTML =
            '<div style="color:#b00;padding:16px;font-family:sans-serif">' +
            "<h2>MSAL configuration missing</h2>" +
            "<p>Make sure <code>wwwroot/auth/msalConfig.js</code> defines " +
            "<code>window.msalConfig</code> and <code>window.loginRequest</code>.</p>" +
            "</div>";
    }
    throw new Error("MSAL configuration missing");
}

// ---------- Global navigation (kept) ----------
window.app = {
    navigate: (page) => {
        if (window.appNavigate) window.appNavigate(page);
    },
};

// ---------- MSAL init (REUSE if it already exists) ----------
const existingPca = window.__pca;
const pca = existingPca || new msal.PublicClientApplication(window.msalConfig);
window.__pca = pca;

let msalReady = window.__msalReady;
if (!msalReady) {
    msalReady = pca
        .handleRedirectPromise()
        .then((response) => {
            if (response?.account) {
                pca.setActiveAccount(response.account);
            } else {
                const accts = pca.getAllAccounts();
                if (!pca.getActiveAccount() && accts.length > 0) {
                    pca.setActiveAccount(accts[0]);
                }
            }
        })
        .catch((err) => {
            console.error("MSAL handleRedirectPromise error:", err && (err.errorCode || err.message), err);
            sessionStorage.removeItem("msal.login.started");
        });
    window.__msalReady = msalReady;
}

// ---------- Your original app (updated) ----------
const AppWithGlobalNav = () => {
    const [currentPage, setCurrentPage] = React.useState("home");
    const [isLoading, setIsLoading] = React.useState(false);
    const [sidebarVisible, setSidebarVisible] = React.useState(false);
    const [hamburgerMenuOpen, setHamburgerMenuOpen] = React.useState(false);

    // --- NEW: Get User Context for GDPR Check ---
    const { currentUser, refreshUser } = useUser();

    // --- NEW: Accept Handler ---
    const handlePrivacyAccept = async () => {
        try {
            await window.apiService.acceptPrivacyPolicy();
            await refreshUser(); // Reload user -> mustAcceptPrivacy becomes false -> Modal disappears
        } catch (error) {
            console.error("Failed to accept policy", error);
            alert("Error accepting policy. Please try again.");
        }
    };

    const basePage = typeof currentPage === "string"
        ? currentPage.split("?")[0]
        : "home";

    const handleNavigate = (page) => {
        setIsLoading(true);
        setCurrentPage(page);
        window.history.pushState({ page }, "", `#${page}`);
        setTimeout(() => setIsLoading(false), 100);
    };

    const handleSidebarToggle = () => setSidebarVisible(!sidebarVisible);
    const handleHamburgerMenuToggle = (isOpen) => setHamburgerMenuOpen(isOpen);

    const isManagementSection =
        currentPage === "management" ||
        [
            "resources",
            "vessels",
            "vessel-types",
            "docks",
            "storage-areas",
            "organizations",
            "representatives",
            "staff",
            "vessel-visit-notifications",
            "qualifications",
            "vessel-visit-executions",
            "incident-types",
            "incidents",
            "task-categories",
            "complementary-tasks",
            "privacy-management",
            "profile"
        ].includes(currentPage);

    const PAGE_TO_MENU_ID = {
        home: "home",
        management: "management",
        "admin-users": "admin-users",
        "3d-view": "3d-view",
        "api-docs": "api-docs",
        resources: "resources",
        vessels: "vessels",
        "vessel-types": "vessel-types",
        docks: "docks",
        "storage-areas": "storage-areas",
        organizations: "organizations",
        representatives: "representatives",
        staff: "staff",
        "vessel-visit-notifications": "vessel-visit-notifications",
        qualifications: "qualifications",
        scheduling: "scheduling",
        "vvn-hub-for-representatives": "vvn-hub-for-representatives",
        "vessel-visit-executions": "vessel-visit-executions",
        "incident-types": "incident-types",
        incidents: "incidents",
        "task-categories": "task-categories",
        "complementary-tasks": "complementary-tasks",
        "privacy-management": "privacy-management",
        profile: "profile",
    };

    React.useEffect(() => {
        window.appNavigate = handleNavigate;
    }, []);

    React.useEffect(() => {
        const handlePopState = () => {
            const hash = window.location.hash.slice(1);
            setCurrentPage(hash || "home");
        };
        const handleHashChange = () => {
            const hash = window.location.hash.slice(1);
            setCurrentPage(hash || "home");
        };

        window.addEventListener("popstate", handlePopState);
        window.addEventListener("hashchange", handleHashChange);
        handleHashChange(); // initial

        return () => {
            window.removeEventListener("popstate", handlePopState);
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);

    const renderCurrentPage = () => {
        if (isLoading) return <div className="loading-indicator">Loading page...</div>;

        switch (basePage) {
            case "home":
                return <HomePage />;
            case "management":
                return typeof ManagementPage === "undefined" ? (
                    <div className="page-section">
                        <h2 className="page-title">Management (Loading Error)</h2>
                        <p className="error">ManagementPage component not found.</p>
                    </div>
                ) : <ManagementPage />;
            case "resources":
                return typeof ResourcesHubPage === "undefined" ? <div className="error">ResourcesHubPage component not loaded</div> : <ResourcesHubPage />;
            case "vessels":
                return typeof VesselsHubPage === "undefined" ? <div className="error">VesselsHubPage component not loaded</div> : <VesselsHubPage />;
            case "vessel-types":
                return typeof VesselTypesHubPage === "undefined" ? <div className="error">VesselTypesHubPage component not loaded</div> : <VesselTypesHubPage />;
            case "docks":
                return typeof DocksHubPage === "undefined" ? <div className="error">DocksHubPage component not loaded</div> : <DocksHubPage />;
            case "storage-areas":
                return typeof StorageAreasHubPage === "undefined" ? <div className="error">StorageAreasHubPage component not loaded</div> : <StorageAreasHubPage />;
            case "organizations":
                return typeof OrganizationsHubPage === "undefined" ? <div className="error">OrganizationsHubPage component not loaded</div> : <OrganizationsHubPage />;
            case "representatives":
                return typeof RepresentativesHubPage === "undefined" ? <div className="error">RepresentativesHubPage component not loaded</div> : <RepresentativesHubPage />;
            case "staff":
                return typeof StaffHubPage === "undefined" ? <div className="error">StaffHubPage component not loaded</div> : <StaffHubPage />;
            case "vessel-visit-notifications":
                return typeof VesselVisitNotificationsHubPage === "undefined" ? <div className="error">VesselVisitNotificationsHubPage component not loaded</div> : <VesselVisitNotificationsHubPage />;
            case "qualifications":
                return typeof QualificationsHubPage === "undefined" ? <div className="error">QualificationsHubPage component not loaded</div> : <QualificationsHubPage />;
            case "vessel-visit-executions":
                return typeof VesselVisitExecutionHubPage === "undefined" ? <div className="error">VesselVisitExecutionHubPage component not loaded</div> : <VesselVisitExecutionHubPage />;
            case "incident-types":
                return typeof IncidentTypesHubPage === "undefined" ? <div className="error">IncidentTypesHubPage component not loaded</div> : <IncidentTypesHubPage />;
            case "incidents":
                return typeof IncidentsHubPage === "undefined" ? <div className="error">IncidentsHubPage component not loaded</div> : <IncidentsHubPage />;
            case "task-categories":
                return typeof TaskCategoriesHubPage === "undefined" ? <div className="error">TaskCategoriesHubPage component not loaded</div> : <TaskCategoriesHubPage />;
            case "complementary-tasks":
                return typeof ComplementaryTasksHubPage === "undefined" ? <div className="error">ComplementaryTasksHubPage component not loaded</div> : <ComplementaryTasksHubPage />;
            case "privacy-management":
                return typeof PrivacyPolicyManagementPage === "undefined" ? (
                    <div className="error">PrivacyPolicyManagementPage component not loaded</div>
                ) : (
                    <PrivacyPolicyManagementPage />
                );
            case "profile":
                return <UserProfilePage />;
            case "3d-view":
                return <ThreeDView key="3d-view" />;
            case "scheduling":
                return typeof SchedulingHubPage === "undefined" ? (
                    <div className="error">SchedulingHubPage component not loaded</div>
                ) : (
                    <SchedulingHubPage />
                );
            case "vvn-hub-for-representatives":
                return <VVNHubPageForRepresentatives />;
            case 'admin-users':
                return <AdminUsersPage />;
            case "activation-success":
                return <ActivationSuccessPage />;
            default:
                console.warn(`Unknown page: ${basePage}, defaulting to home`);
                return <HomePage />;
        }
    };

    const ProtectedPage = ({ currentPage, render }) => {
        const { canAccessMenu, isAuthenticated } = useUser();
        const basePage = typeof currentPage === "string" ? currentPage.split("?")[0] : "home";
        const menuId = PAGE_TO_MENU_ID[basePage] || basePage;

        // Always allow home
        if (basePage === "home") return render();

        if (!isAuthenticated) {
            return <div className="page-section"><p>A autenticação é necessária.</p></div>;
        }

        if (!canAccessMenu(menuId)) {
            return <AccessDeniedPage />;
        }

        return render();
    };

    return (
        <div id="app">
            <Navigation
                currentPage={currentPage}
                onNavigate={handleNavigate}
                onHamburgerMenuToggle={handleHamburgerMenuToggle}
            />

            <ManagementSidebar
                currentPage={currentPage}
                onNavigate={handleNavigate}
                isVisible={sidebarVisible}
                onToggle={handleSidebarToggle}
                hamburgerMenuOpen={hamburgerMenuOpen}
            />

            <main
                className={`main-content ${isManagementSection && sidebarVisible ? "with-sidebar" : ""
                    } ${basePage === "3d-view" ? "full-width" : ""}`}
            >
                <Breadcrumb currentPage={currentPage} onNavigate={handleNavigate} />
                <ProtectedPage
                    currentPage={currentPage}
                    render={renderCurrentPage}
                />
            </main>

            <Footer currentPage={currentPage} onNavigate={handleNavigate} />

            {/* --- NEW: Blocking Privacy Modal --- */}
            {currentUser && currentUser.mustAcceptPrivacy && (
                <PrivacyAcceptanceModal onAccept={handlePrivacyAccept} />
            )}
        </div>
    );
};

// ---------- Render using the shared/global AuthGate ----------
const AuthGate = window.AuthGate;
const root = ReactDOM.createRoot(document.getElementById("root"));

// Detect if we're on the activation-success page
const rawHash = window.location.hash || "";
const pageHash = rawHash.startsWith("#")
    ? rawHash.substring(1)
    : rawHash;
const basePage = pageHash.split("?")[0];
const isActivationPage = basePage === "activation-success";

if (isActivationPage) {
    root.render(
        <I18nProvider>
            <UserProvider>
                <AppWithGlobalNav />
            </UserProvider>
        </I18nProvider>
    );
} else {
    root.render(
        <I18nProvider>
            <AuthGate>
                <UserProvider>
                    <AppWithGlobalNav />
                </UserProvider>
            </AuthGate>
        </I18nProvider>
    );
}

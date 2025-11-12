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

// ---------- Your original app (kept) ----------
const AppWithGlobalNav = () => {
  const [currentPage, setCurrentPage] = React.useState("home");
  const [isLoading, setIsLoading] = React.useState(false);
  const [sidebarVisible, setSidebarVisible] = React.useState(false);
  const [hamburgerMenuOpen, setHamburgerMenuOpen] = React.useState(false);

  const handleNavigate = (page) => {
    console.log(`Navigating to: ${page}`);
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
    ].includes(currentPage);

  React.useEffect(() => {
    window.appNavigate = handleNavigate;
    console.log("Global navigation function set");
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

    switch (currentPage) {
      case "home":
        return <HomePage />;
      case "management":
        return typeof ManagementPage === "undefined" ? (
          <div className="page-section">
            <h2 className="page-title">Management (Loading Error)</h2>
            <p className="error">ManagementPage component not found.</p>
          </div>
        ) : (
          <ManagementPage />
        );
      case "resources":
        return typeof ResourcesHubPage === "undefined" ? (
          <div className="error">ResourcesHubPage component not loaded</div>
        ) : (
          <ResourcesHubPage />
        );
      case "vessels":
        return typeof VesselsHubPage === "undefined" ? (
          <div className="error">VesselsHubPage component not loaded</div>
        ) : (
          <VesselsHubPage />
        );
      case "vessel-types":
        return typeof VesselTypesHubPage === "undefined" ? (
          <div className="error">VesselTypesHubPage component not loaded</div>
        ) : (
          <VesselTypesHubPage />
        );
      case "docks":
        return typeof DocksHubPage === "undefined" ? (
          <div className="error">DocksHubPage component not loaded</div>
        ) : (
          <DocksHubPage />
        );
      case "storage-areas":
        return typeof StorageAreasPage === "undefined" ? (
          <div className="error">StorageAreasPage component not loaded</div>
        ) : (
          <StorageAreasPage />
        );
      case "organizations":
        return typeof OrganizationsPage === "undefined" ? (
          <div className="error">OrganizationsPage component not loaded</div>
        ) : (
          <OrganizationsPage />
        );
      case "representatives":
        return typeof RepresentativesPage === "undefined" ? (
          <div className="error">RepresentativesPage component not loaded</div>
        ) : (
          <RepresentativesPage />
        );
      case "staff":
        return typeof StaffPage === "undefined" ? (
          <div className="error">StaffPage component not loaded</div>
        ) : (
          <StaffPage />
        );
      case "vessel-visit-notifications":
        return typeof VesselVisitNotificationsPage === "undefined" ? (
          <div className="error">VesselVisitNotificationsPage component not loaded</div>
        ) : (
          <VesselVisitNotificationsPage />
        );
      case "qualifications":
        return typeof QualificationsPage === "undefined" ? (
          <div className="error">QualificationsPage component not loaded</div>
        ) : (
          <QualificationsPage />
        );
      case "3d-view":
        return <ThreeDView key="3d-view" />;
      case "api-docs":
        return <ApiDocsPage />;
      case 'admin-users':
        return <AdminUsersPage />;
      case "activation-success":
        return <ActivationSuccessPage />;
      default:
        console.warn(`Unknown page: ${currentPage}, defaulting to home`);
        return <HomePage />;
    }
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
        className={`main-content ${isManagementSection && sidebarVisible ? "with-sidebar" : ""}`}
      >
        <Breadcrumb currentPage={currentPage} onNavigate={handleNavigate} />
        {renderCurrentPage()}
      </main>

      <Footer currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
};

// ---------- Render using the shared/global AuthGate ----------
const AuthGate = window.AuthGate;
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <I18nProvider>
    <UserProvider>
      <AuthGate>
        <AppWithGlobalNav />
      </AuthGate>
    </UserProvider>
  </I18nProvider>
);

console.log("React SPA initialized successfully!");

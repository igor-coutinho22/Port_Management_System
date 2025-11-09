// Global reference for navigation from legacy components
window.app = {
    navigate: (page) => {
        // This will be set by the App component
        if (window.appNavigate) {
            window.appNavigate(page);
        }
    }
};

const pca = new PublicClientApplication(msalConfig);

// Render the React app
createRoot(document.getElementById("root")).render(
  <MsalProvider instance={pca}>
    <App />
  </MsalProvider>
);

// Enhanced App with global navigation
const AppWithGlobalNav = () => {
    const [currentPage, setCurrentPage] = React.useState('home');
    const [isLoading, setIsLoading] = React.useState(false);
    const [sidebarVisible, setSidebarVisible] = React.useState(false);
    const [hamburgerMenuOpen, setHamburgerMenuOpen] = React.useState(false);

    const handleNavigate = (page) => {
        console.log(`Navigating to: ${page}`);
        setIsLoading(true);
        setCurrentPage(page);
        window.history.pushState({ page }, '', `#${page}`);
        
        // Small delay to show loading state
        setTimeout(() => setIsLoading(false), 100);
    };

    const handleSidebarToggle = () => {
        setSidebarVisible(!sidebarVisible);
    };

    const handleHamburgerMenuToggle = (isOpen) => {
        setHamburgerMenuOpen(isOpen);
    };

    // Check if current page needs sidebar
    const isManagementSection = currentPage === 'management' || 
        ['resources', 'vessels', 'vessel-types', 'docks', 'storage-areas', 
         'organizations', 'representatives', 'staff', 'vessel-visit-notifications', 
         'qualifications'].includes(currentPage);

    // Set global navigation function
    React.useEffect(() => {
        window.appNavigate = handleNavigate;
        console.log('Global navigation function set');
    }, []);

    React.useEffect(() => {
        const handlePopState = (event) => {
            console.log('Browser navigation detected');
            const hash = window.location.hash.slice(1);
            const page = hash || 'home';
            console.log(`Setting page to: ${page}`);
            setCurrentPage(page);
        };

        // Handle hash changes (for bookmarking and direct URL access)
        const handleHashChange = () => {
            const hash = window.location.hash.slice(1);
            const page = hash || 'home';
            console.log(`Hash changed to: ${page}`);
            setCurrentPage(page);
        };

        window.addEventListener('popstate', handlePopState);
        window.addEventListener('hashchange', handleHashChange);
        
        // Handle initial route
        handleHashChange();

        return () => {
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    const renderCurrentPage = () => {
        if (isLoading) {
            return (
                <div className="loading-indicator">
                    Loading page...
                </div>
            );
        }

        console.log(`Rendering page: ${currentPage}`);
        
        switch (currentPage) {
            case 'home':
                return <HomePage />;
            case 'management':
                console.log('Loading Management page in AppWithGlobalNav...');
                console.log('ManagementPage type:', typeof ManagementPage);
                if (typeof ManagementPage === 'undefined') {
                    console.error('ManagementPage component not loaded!');
                    return (
                        <div className="page-section">
                            <h2 className="page-title">Management (Loading Error)</h2>
                            <p className="error">ManagementPage component not found. Check browser console for details.</p>
                        </div>
                    );
                }
                return <ManagementPage />;
            case 'resources':
                console.log('Loading ResourcesHubPage, type:', typeof ResourcesHubPage);
                if (typeof ResourcesHubPage === 'undefined') {
                    return <div className="error">ResourcesHubPage component not loaded</div>;
                }
                return <ResourcesHubPage />;
            case 'vessels':
                console.log('Loading VesselsHubPage, type:', typeof VesselsHubPage);
                if (typeof VesselsHubPage === 'undefined') {
                    return <div className="error">VesselsHubPage component not loaded</div>;
                }
                return <VesselsHubPage />;
            case 'vessel-types':
                console.log('Loading VesselTypesHubPage, type:', typeof VesselTypesHubPage);
                if (typeof VesselTypesHubPage === 'undefined') {
                    return <div className="error">VesselTypesHubPage component not loaded</div>;
                }
                return <VesselTypesHubPage />;
            case 'docks':
                console.log('Loading DocksHubPage, type:', typeof DocksHubPage);
                if (typeof DocksHubPage === 'undefined') {
                    return <div className="error">DocksHubPage component not loaded</div>;
                }
                return <DocksHubPage />;
            case 'storage-areas':
                console.log('Loading StorageAreasPage, type:', typeof StorageAreasPage);
                if (typeof StorageAreasPage === 'undefined') {
                    return <div className="error">StorageAreasPage component not loaded</div>;
                }
                return <StorageAreasPage />;
            case 'organizations':
                console.log('Loading OrganizationsPage, type:', typeof OrganizationsPage);
                if (typeof OrganizationsPage === 'undefined') {
                    return <div className="error">OrganizationsPage component not loaded</div>;
                }
                return <OrganizationsPage />;
            case 'representatives':
                console.log('Loading RepresentativesPage, type:', typeof RepresentativesPage);
                if (typeof RepresentativesPage === 'undefined') {
                    return <div className="error">RepresentativesPage component not loaded</div>;
                }
                return <RepresentativesPage />;
            case 'staff':
                console.log('Loading StaffPage, type:', typeof StaffPage);
                if (typeof StaffPage === 'undefined') {
                    return <div className="error">StaffPage component not loaded</div>;
                }
                return <StaffPage />;
            case 'vessel-visit-notifications':
                console.log('Loading VesselVisitNotificationsPage, type:', typeof VesselVisitNotificationsPage);
                if (typeof VesselVisitNotificationsPage === 'undefined') {
                    return <div className="error">VesselVisitNotificationsPage component not loaded</div>;
                }
                return <VesselVisitNotificationsPage />;
            case 'qualifications':
                console.log('Loading QualificationsPage, type:', typeof QualificationsPage);
                if (typeof QualificationsPage === 'undefined') {
                    return <div className="error">QualificationsPage component not loaded</div>;
                }
                return <QualificationsPage />;
            case '3d-view':
                return <ThreeDView key="3d-view" />; // Key forces remount
            case 'api-docs':
                return <ApiDocsPage />;
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
            
            <main className={`main-content ${isManagementSection && sidebarVisible ? 'with-sidebar' : ''}`}>
                <Breadcrumb 
                    currentPage={currentPage} 
                    onNavigate={handleNavigate} 
                />
                {renderCurrentPage()}
            </main>
            
            <Footer 
                currentPage={currentPage} 
                onNavigate={handleNavigate} 
            />
        </div>
    );
};

root.render(
    <I18nProvider>
        <UserProvider>
            <AppWithGlobalNav />
        </UserProvider>
    </I18nProvider>
);

console.log('React SPA initialized successfully!');
// Main React Application
const App = () => {
    const [currentPage, setCurrentPage] = React.useState('home');

    // Handle navigation
    const handleNavigate = (page) => {
        setCurrentPage(page);
        // Update URL without page refresh
        window.history.pushState({ page }, '', `#${page}`);
    };

    // Handle browser back/forward buttons
    React.useEffect(() => {
        const handlePopState = () => {
            const hash = window.location.hash.slice(1);
            const page = hash || 'home';
            setCurrentPage(page);
        };

        window.addEventListener('popstate', handlePopState);
        
        // Handle initial route
        handlePopState();

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    // Render current page component
    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage />;
            case 'resources':
                return <ResourcesPage />;
            case 'vessels':
                return <VesselsPage />;
            case '3d-view':
                return <ThreeDView />;
            case 'api-docs':
                return <ApiDocsPage />;
            default:
                return <HomePage />;
        }
    };

    return (
        <div id="app">
            <Navigation 
                currentPage={currentPage} 
                onNavigate={handleNavigate} 
            />
            
            <main className="main-content">
                {renderCurrentPage()}
            </main>
        </div>
    );
};

// Global reference for navigation from legacy components
window.app = {
    navigate: (page) => {
        // This will be set by the App component
        if (window.appNavigate) {
            window.appNavigate(page);
        }
    }
};

// Render the React app
const root = ReactDOM.createRoot(document.getElementById('root'));

// Enhanced App with global navigation
const AppWithGlobalNav = () => {
    const [currentPage, setCurrentPage] = React.useState('home');
    const [isLoading, setIsLoading] = React.useState(false);

    const handleNavigate = (page) => {
        console.log(`Navigating to: ${page}`);
        setIsLoading(true);
        setCurrentPage(page);
        window.history.pushState({ page }, '', `#${page}`);
        
        // Small delay to show loading state
        setTimeout(() => setIsLoading(false), 100);
    };

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
            case 'resources':
                return <ResourcesPage />;
            case 'vessels':
                return <VesselsPage />;
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
            />
            
            <main className="main-content">
                {renderCurrentPage()}
            </main>
        </div>
    );
};

root.render(<AppWithGlobalNav />);

console.log('✅ React SPA initialized successfully!');
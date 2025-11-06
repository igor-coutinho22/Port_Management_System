// Management Sidebar Component - Quick Navigation within Management Section
const ManagementSidebar = ({ currentPage, onNavigate, isVisible, onToggle, hamburgerMenuOpen }) => {
    const { canAccessMenu } = useUser();
    
    const allManagementEntities = [
        { id: 'resources', title: 'Resources', icon: '📦', description: 'Equipment & facilities' },
        { id: 'vessels', title: 'Vessels', icon: '🚢', description: 'Ships & tracking' },
        { id: 'vessel-types', title: 'Vessel Types', icon: '🛳️', description: 'Ship categories' },
        { id: 'docks', title: 'Docks', icon: '🏭', description: 'Berths & operations' },
        { id: 'storage-areas', title: 'Storage Areas', icon: '🏪', description: 'Warehouses & yards' },
        { id: 'organizations', title: 'Organizations', icon: '🏢', description: 'Companies & authorities' },
        { id: 'representatives', title: 'Representatives', icon: '👨‍💼', description: 'Contacts & agents' },
        { id: 'staff', title: 'Staff', icon: '👷‍♂️', description: 'Personnel & roles' },
        { id: 'vessel-visit-notifications', title: 'Notifications', icon: '📋', description: 'Vessel schedules' },
        { id: 'qualifications', title: 'Qualifications', icon: '🎓', description: 'Certifications' }
    ];

    // Filter entities based on user permissions
    const managementEntities = allManagementEntities.filter(entity => canAccessMenu(entity.id));

    // Check if current page is within management section
    const isManagementPage = currentPage === 'management' || 
        managementEntities.some(entity => entity.id === currentPage);

    if (!isManagementPage) {
        return null; // Don't show sidebar outside management section
    }

    return (
        <>
            {/* Sidebar Toggle Button - Hide when hamburger menu is open */}
            {!hamburgerMenuOpen && (
                <button 
                    className={`sidebar-toggle ${isVisible ? 'active' : ''}`}
                    onClick={onToggle}
                    title={isVisible ? 'Hide management menu' : 'Show management menu'}
                    aria-label={isVisible ? 'Hide management menu' : 'Show management menu'}
                >
                    <span className="toggle-icon">
                        {isVisible ? '◀' : '▶'}
                    </span>
                </button>
            )}

            {/* Sidebar Overlay for mobile */}
            {isVisible && (
                <div 
                    className="sidebar-overlay" 
                    onClick={onToggle}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar Content */}
            <aside className={`management-sidebar ${isVisible ? 'visible' : 'hidden'}`}>
                <div className="sidebar-header">
                    <h3 className="sidebar-title">
                        <span className="sidebar-icon">⚙️</span>
                        Management
                    </h3>
                    <button 
                        className="sidebar-close" 
                        onClick={onToggle}
                        title="Close menu"
                        aria-label="Close management menu"
                    >
                        ✕
                    </button>
                </div>

                <nav className="sidebar-nav" role="navigation" aria-label="Management navigation">
                    <ul className="sidebar-menu">
                        <li>
                            <button
                                className={`sidebar-item ${currentPage === 'management' ? 'active' : ''}`}
                                onClick={() => {
                                    onNavigate('management');
                                    // Keep sidebar open on desktop, close on mobile
                                    if (window.innerWidth <= 768) {
                                        onToggle();
                                    }
                                }}
                            >
                                <span className="item-icon">🏠</span>
                                <div className="item-content">
                                    <span className="item-title">Overview</span>
                                    <span className="item-desc">Management hub</span>
                                </div>
                            </button>
                        </li>
                        
                        {managementEntities.map(entity => (
                            <li key={entity.id}>
                                <button
                                    className={`sidebar-item ${currentPage === entity.id ? 'active' : ''}`}
                                    onClick={() => {
                                        onNavigate(entity.id);
                                        // Keep sidebar open on desktop, close on mobile
                                        if (window.innerWidth <= 768) {
                                            onToggle();
                                        }
                                    }}
                                >
                                    <span className="item-icon">{entity.icon}</span>
                                    <div className="item-content">
                                        <span className="item-title">{entity.title}</span>
                                        <span className="item-desc">{entity.description}</span>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Sidebar Footer */}
                <div className="sidebar-footer">
                    <button 
                        className="sidebar-item back-to-main"
                        onClick={() => {
                            onNavigate('home');
                            onToggle();
                        }}
                        title="Back to main menu"
                    >
                        <span className="item-icon">🏠</span>
                        <div className="item-content">
                            <span className="item-title">Back to Home</span>
                        </div>
                    </button>
                </div>
            </aside>
        </>
    );
};

console.log('ManagementSidebar component loaded!');
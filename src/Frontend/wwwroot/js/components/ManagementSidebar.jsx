// Management Sidebar Component - Quick Navigation within Management Section
const ManagementSidebar = ({ currentPage, onNavigate, isVisible, onToggle, hamburgerMenuOpen }) => {
    const { canAccessMenu } = useUser();
    const { t } = useTranslation();
    
    const allManagementEntities = [
        { id: 'resources', titleKey: 'entities.resources', descKey: 'entities.resources_desc' },
        { id: 'vessels', titleKey: 'entities.vessels', descKey: 'entities.vessels_desc' },
        { id: 'vessel-types', titleKey: 'entities.vessel_types', descKey: 'entities.vessel_types_desc' },
        { id: 'docks', titleKey: 'entities.docks', descKey: 'entities.docks_desc' },
        { id: 'storage-areas', titleKey: 'entities.storage_areas', descKey: 'entities.storage_areas_desc' },
        { id: 'organizations', titleKey: 'entities.organizations', descKey: 'entities.organizations_desc' },
        { id: 'representatives', titleKey: 'entities.representatives', descKey: 'entities.representatives_desc' },
        { id: 'staff', titleKey: 'entities.staff', descKey: 'entities.staff_desc' },
        { id: 'vessel-visit-notifications', titleKey: 'entities.notifications', descKey: 'entities.notifications_desc' },
        { id: 'qualifications', titleKey: 'entities.qualifications', descKey: 'entities.qualifications_desc' },
        { id: 'vessel-visit-executions', titleKey: 'entities.executions', descKey: 'entities.executions_desc' },
        { id: 'incident-types', titleKey: 'entities.incident_types', descKey: 'entities.incident_types_desc' },
        { id: 'incidents', titleKey: 'entities.incidents', descKey: 'entities.incidents_desc' },
        { id: 'task-categories', titleKey: 'entities.task_categories', descKey: 'entities.task_categories_desc' },
        { id: 'complementary-tasks', titleKey: 'entities.complementary_tasks', descKey: 'entities.complementary_tasks_desc' }
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
                    title={isVisible ? t('management.hide_menu', 'Hide management menu') : t('management.show_menu', 'Show management menu')}
                    aria-label={isVisible ? t('management.hide_menu', 'Hide management menu') : t('management.show_menu', 'Show management menu')}
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
                        {t('management.title', 'Management')}
                    </h3>
                    <button 
                        className="sidebar-close" 
                        onClick={onToggle}
                        title={t('management.close_menu', 'Close menu')}
                        aria-label={t('management.close_menu', 'Close management menu')}
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
                                <span className="item-icon"></span>
                                <div className="item-content">
                                    <span className="item-title">{t('management.overview', 'Overview')}</span>
                                    <span className="item-desc">{t('management.overview_desc', 'Management hub')}</span>
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
                                        <span className="item-title">{t(entity.titleKey, entity.titleKey)}</span>
                                        <span className="item-desc">{t(entity.descKey, entity.descKey)}</span>
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
                        title={t('management.back_to_home', 'Back to Home')}
                    >
                        <span className="item-icon">⚓</span>
                        <div className="item-content">
                            <span className="item-title">{t('management.back_to_home', 'Back to Home')}</span>
                        </div>
                    </button>
                </div>
            </aside>
        </>
    );
};

console.log('ManagementSidebar component loaded!');
// Breadcrumb Component - Enhanced Navigation Context
const Breadcrumb = ({ currentPage, onNavigate }) => {
    const { t } = useTranslation();
    
    // Define breadcrumb paths for different pages
    const getBreadcrumbPath = (page) => {
        const paths = {
            'home': [
                { label: t('nav.home', 'Home'), page: 'home', icon: '⚓' }
            ],
            'management': [
                { label: t('nav.home', 'Home'), page: 'home', icon: '⚓' },
                { label: t('nav.management', 'Management'), page: 'management', icon: '⚙️' }
            ],
            'resources': [
                { label: t('nav.home', 'Home'), page: 'home', icon: '⚓' },
                { label: t('nav.management', 'Management'), page: 'management', icon: '⚙️' },
                { label: t('entities.resources', 'Resources'), page: 'resources', icon: '📦' }
            ],
            'vessels': [
                { label: t('nav.home', 'Home'), page: 'home', icon: '⚓' },
                { label: t('nav.management', 'Management'), page: 'management', icon: '⚙️' },
                { label: t('entities.vessels', 'Vessels'), page: 'vessels', icon: '🚢' }
            ],
            'vessel-types': [
                { label: t('nav.home', 'Home'), page: 'home', icon: '⚓' },
                { label: t('nav.management', 'Management'), page: 'management', icon: '⚙️' },
                { label: t('entities.vessel_types', 'Vessel Types'), page: 'vessel-types', icon: '🛳️' }
            ],
            'docks': [
                { label: t('nav.home', 'Home'), page: 'home', icon: '⚓' },
                { label: t('nav.management', 'Management'), page: 'management', icon: '⚙️' },
                { label: t('entities.docks', 'Docks'), page: 'docks', icon: '🏭' }
            ],
            'storage-areas': [
                { label: t('nav.home', 'Home'), page: 'home', icon: '⚓' },
                { label: t('nav.management', 'Management'), page: 'management', icon: '⚙️' },
                { label: t('entities.storage_areas', 'Storage Areas'), page: 'storage-areas', icon: '🏪' }
            ],
            'organizations': [
                { label: t('nav.home', 'Home'), page: 'home', icon: '⚓' },
                { label: t('nav.management', 'Management'), page: 'management', icon: '⚙️' },
                { label: t('entities.organizations', 'Organizations'), page: 'organizations', icon: '🏢' }
            ],
            'representatives': [
                { label: t('nav.home', 'Home'), page: 'home', icon: '⚓' },
                { label: t('nav.management', 'Management'), page: 'management', icon: '⚙️' },
                { label: t('entities.representatives', 'Representatives'), page: 'representatives', icon: '👨‍💼' }
            ],
            'staff': [
                { label: t('nav.home', 'Home'), page: 'home', icon: '⚓' },
                { label: t('nav.management', 'Management'), page: 'management', icon: '⚙️' },
                { label: t('entities.staff', 'Staff'), page: 'staff', icon: '👷‍♂️' }
            ],
            'vessel-visit-notifications': [
                { label: t('nav.home', 'Home'), page: 'home', icon: '⚓' },
                { label: t('nav.management', 'Management'), page: 'management', icon: '⚙️' },
                { label: t('entities.notifications', 'Notifications'), page: 'vessel-visit-notifications', icon: '📋' }
            ],
            'qualifications': [
                { label: t('nav.home', 'Home'), page: 'home', icon: '⚓' },
                { label: t('nav.management', 'Management'), page: 'management', icon: '⚙️' },
                { label: t('entities.qualifications', 'Qualifications'), page: 'qualifications', icon: '🎓' }
            ],
            '3d-view': [
                { label: t('nav.home', 'Home'), page: 'home', icon: '⚓' },
                { label: t('nav.3d_view', '3D Port View'), page: '3d-view', icon: '🏗️' }
            ],
            'api-docs': [
                { label: t('nav.home', 'Home'), page: 'home', icon: '⚓' },
                { label: t('nav.api_docs', 'API Documentation'), page: 'api-docs', icon: '📚' }
            ]
        };

        return paths[page] || [{ label: t('nav.home', 'Home'), page: 'home', icon: '⚓' }];
    };

    const breadcrumbPath = getBreadcrumbPath(currentPage);

    // Don't show breadcrumb for home page (only one item)
    if (breadcrumbPath.length <= 1) {
        return null;
    }

    return (
        <nav className="breadcrumb-nav" aria-label="Breadcrumb">
            <ol className="breadcrumb-list">
                {breadcrumbPath.map((item, index) => (
                    <li key={item.page} className="breadcrumb-item">
                        {index < breadcrumbPath.length - 1 ? (
                            <>
                                <button
                                    className="breadcrumb-link"
                                    onClick={() => onNavigate(item.page)}
                                    type="button"
                                >
                                    <span className="breadcrumb-icon">{item.icon}</span>
                                    <span className="breadcrumb-label">{item.label}</span>
                                </button>
                                <span className="breadcrumb-separator" aria-hidden="true">
                                    →
                                </span>
                            </>
                        ) : (
                            <span className="breadcrumb-current">
                                <span className="breadcrumb-icon">{item.icon}</span>
                                <span className="breadcrumb-label">{item.label}</span>
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

console.log('Breadcrumb component loaded!');
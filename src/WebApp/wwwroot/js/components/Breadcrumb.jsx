// Breadcrumb Component - Enhanced Navigation Context
const Breadcrumb = ({ currentPage, onNavigate }) => {
    // Define breadcrumb paths for different pages
    const getBreadcrumbPath = (page) => {
        const paths = {
            'home': [
                { label: 'Home', page: 'home', icon: '🏠' }
            ],
            'management': [
                { label: 'Home', page: 'home', icon: '🏠' },
                { label: 'Management', page: 'management', icon: '⚙️' }
            ],
            'resources': [
                { label: 'Home', page: 'home', icon: '🏠' },
                { label: 'Management', page: 'management', icon: '⚙️' },
                { label: 'Resources', page: 'resources', icon: '📦' }
            ],
            'vessels': [
                { label: 'Home', page: 'home', icon: '🏠' },
                { label: 'Management', page: 'management', icon: '⚙️' },
                { label: 'Vessels', page: 'vessels', icon: '🚢' }
            ],
            'vessel-types': [
                { label: 'Home', page: 'home', icon: '🏠' },
                { label: 'Management', page: 'management', icon: '⚙️' },
                { label: 'Vessel Types', page: 'vessel-types', icon: '🛳️' }
            ],
            'docks': [
                { label: 'Home', page: 'home', icon: '🏠' },
                { label: 'Management', page: 'management', icon: '⚙️' },
                { label: 'Docks', page: 'docks', icon: '🏭' }
            ],
            'storage-areas': [
                { label: 'Home', page: 'home', icon: '🏠' },
                { label: 'Management', page: 'management', icon: '⚙️' },
                { label: 'Storage Areas', page: 'storage-areas', icon: '🏪' }
            ],
            'organizations': [
                { label: 'Home', page: 'home', icon: '🏠' },
                { label: 'Management', page: 'management', icon: '⚙️' },
                { label: 'Organizations', page: 'organizations', icon: '🏢' }
            ],
            'representatives': [
                { label: 'Home', page: 'home', icon: '🏠' },
                { label: 'Management', page: 'management', icon: '⚙️' },
                { label: 'Representatives', page: 'representatives', icon: '👨‍💼' }
            ],
            'staff': [
                { label: 'Home', page: 'home', icon: '🏠' },
                { label: 'Management', page: 'management', icon: '⚙️' },
                { label: 'Staff', page: 'staff', icon: '👷‍♂️' }
            ],
            'vessel-visit-notifications': [
                { label: 'Home', page: 'home', icon: '🏠' },
                { label: 'Management', page: 'management', icon: '⚙️' },
                { label: 'Vessel Notifications', page: 'vessel-visit-notifications', icon: '📋' }
            ],
            'qualifications': [
                { label: 'Home', page: 'home', icon: '🏠' },
                { label: 'Management', page: 'management', icon: '⚙️' },
                { label: 'Qualifications', page: 'qualifications', icon: '🎓' }
            ],
            '3d-view': [
                { label: 'Home', page: 'home', icon: '🏠' },
                { label: '3D Port View', page: '3d-view', icon: '🏗️' }
            ],
            'api-docs': [
                { label: 'Home', page: 'home', icon: '🏠' },
                { label: 'API Documentation', page: 'api-docs', icon: '📚' }
            ]
        };

        return paths[page] || [{ label: 'Home', page: 'home', icon: '🏠' }];
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
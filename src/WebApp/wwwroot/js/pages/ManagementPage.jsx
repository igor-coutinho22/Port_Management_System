// Management Page Component - Unified management interface
console.log('ManagementPage.jsx file is being loaded!');

const ManagementPage = () => {
    const { t } = useTranslation();
    
    const managementEntities = [
        {
            id: 'resources',
            title: '📦 ' + t('entities.resources'),
            description: t('management_page.resources'),
            icon: '📦'
        },
        {
            id: 'vessels',
            title: '🚢 ' + t('entities.vessels'),
            description: t('management_page.vessels'),
            icon: '🚢'
        },
        {
            id: 'vessel-types',
            title: '🛳️ ' + t('entities.vessel_types'),
            description: t('management_page.vessel_types'),
            icon: '🛳️'
        },
        {
            id: 'docks',
            title: '🏭 ' + t('entities.docks'),
            description: t('management_page.docks'),
            icon: '🏭'
        },
        {
            id: 'storage-areas',
            title: '🏪 ' + t('entities.storage_areas'),
            description: t('management_page.storage_areas'),
            icon: '🏪'
        },
        {
            id: 'organizations',
            title: '🏢 ' + t('entities.organizations'),
            description: t('management_page.organizations'),
            icon: '🏢'
        },
        {
            id: 'representatives',
            title: '👨‍💼 ' + t('entities.representatives'),
            description: t('management_page.representatives'),
            icon: '👨‍💼'
        },
        {
            id: 'staff',
            title: '👷‍♂️ ' + t('entities.staff'),
            description: t('management_page.staff'),
            icon: '👷‍♂️'
        },
        {
            id: 'vessel-visit-notifications',
            title: '📋 ' + t('entities.notifications'),
            description: t('management_page.notifications'),
            icon: '📋'
        },
        {
            id: 'qualifications',
            title: '🎓 ' + t('entities.qualifications'),
            description: t('management_page.qualifications'),
            icon: '🎓'
        }
    ];

    const handleEntityClick = (entity) => {
        console.log('Navigating to', entity.title, 'page...');
        
        if (window.appNavigate) {
            window.appNavigate(entity.id);
        } else {
            window.location.hash = entity.id;
        }
    };

    return (
        <div className="page-section">
            <h2 className="page-title">{t('management_page.title')}</h2>
            <p>{t('management_page.description')}</p>
            
            <div className="feature-grid">
                {managementEntities.map((entity) => (
                    <div 
                        key={entity.id}
                        className="feature-card management-card"
                        onClick={() => handleEntityClick(entity)}
                        style={{ cursor: 'pointer' }}
                    >
                        <h3>{entity.title}</h3>
                        <p>{entity.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

console.log('ManagementPage component loaded!');

// Management Page Component - Unified management interface
console.log('ManagementPage.jsx file is being loaded!');

const ManagementPage = () => {
    const managementEntities = [
        {
            id: 'resources',
            title: '📦 Resources',
            description: 'Manage cranes, equipment, and port facilities',
            icon: '📦'
        },
        {
            id: 'vessels',
            title: '🚢 Vessels',
            description: 'Track vessels, arrivals, and operations',
            icon: '🚢'
        },
        {
            id: 'vessel-types',
            title: '🛳️ Vessel Types',
            description: 'Manage different types of vessels',
            icon: '🛳️'
        },
        {
            id: 'docks',
            title: '🏭 Docks',
            description: 'Dock management and operations',
            icon: '🏭'
        },
        {
            id: 'storage-areas',
            title: '🏪 Storage Areas',
            description: 'Warehouses and container yards',
            icon: '🏪'
        },
        {
            id: 'organizations',
            title: '🏢 Organizations',
            description: 'Shipping companies and port authorities',
            icon: '🏢'
        },
        {
            id: 'representatives',
            title: '👨‍💼 Representatives',
            description: 'Organization representatives and contacts',
            icon: '👨‍💼'
        },
        {
            id: 'staff',
            title: '👷‍♂️ Staff',
            description: 'Port staff members and roles',
            icon: '👷‍♂️'
        },
        {
            id: 'vessel-visit-notifications',
            title: '📋 Vessel Notifications',
            description: 'Upcoming vessel visits and schedules',
            icon: '📋'
        },
        {
            id: 'qualifications',
            title: '🎓 Qualifications',
            description: 'Professional certifications and qualifications',
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
            <h2 className="page-title">Port Management</h2>
            <p>Select a management module to view and manage port operations.</p>
            
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

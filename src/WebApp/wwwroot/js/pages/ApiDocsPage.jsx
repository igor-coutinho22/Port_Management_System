// API Documentation Page Component - React
const ApiDocsPage = () => {
    const apiEndpoints = [
        {
            title: '📋 Swagger Documentation',
            description: 'Interactive API documentation and testing interface',
            url: '/swagger'
        },
        {
            title: '🏗️ Resources API',
            description: 'Manage cranes, equipment, and facilities',
            url: '/api/resources'
        },
        {
            title: '🚢 Vessels API',
            description: 'Vessel information and operations',
            url: '/api/vessels'
        },
        {
            title: '🏭 Docks API',
            description: 'Dock management and status',
            url: '/api/docks'
        },
        {
            title: '📦 Storage Areas API',
            description: 'Container yards and warehouse management',
            url: '/api/storageAreas'
        },
        {
            title: '👥 Staff API',
            description: 'Staff management and qualifications',
            url: '/api/staff'
        }
    ];

    const handleApiClick = (url) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="page-section">
            <h2 className="page-title">API Documentation</h2>
            <p>Explore the available REST API endpoints for the Port Management System.</p>
            
            <div className="feature-grid">
                {apiEndpoints.map((endpoint, index) => (
                    <div 
                        key={index}
                        className="feature-card api-card"
                        onClick={() => handleApiClick(endpoint.url)}
                        style={{ cursor: 'pointer' }}
                    >
                        <h3>{endpoint.title}</h3>
                        <p>{endpoint.description}</p>
                        <button className="btn">
                            Open API
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
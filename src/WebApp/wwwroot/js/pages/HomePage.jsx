// Home Page Component - React
const HomePage = () => {
    const features = [
        {
            title: '🚢 Vessel Management',
            description: 'Track and manage vessel arrivals, departures, and operations.',
            route: 'vessels'
        },
        {
            title: '🏗️ 3D Port Visualization', 
            description: 'Interactive 3D view of the port infrastructure and operations.',
            route: '3d-view'
        },
        {
            title: '📦 Resource Management',
            description: 'Manage cranes, storage areas, and other port resources.',
            route: 'resources'
        },
        {
            title: '📚 API Documentation',
            description: 'Explore the complete API documentation and endpoints.',
            route: 'api-docs'
        }
    ];

    return (
        <div className="page-section">
            <h2 className="page-title">Welcome to Port Management System</h2>
            <p>This is a comprehensive port management system for handling vessels, docks, storage areas, and resources.</p>
            
            <div className="feature-grid">
                {features.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                ))}
            </div>
        </div>
    );
};

// Feature Card Sub-component
const FeatureCard = ({ title, description, route }) => {
    return (
        <div className="feature-card">
            <h3>{title}</h3>
            <p>{description}</p>
            <button 
                className="btn"
                onClick={() => window.app.navigate(route)}
            >
                {route === 'vessels' && 'View Vessels'}
                {route === '3d-view' && 'Open 3D View'}
                {route === 'resources' && 'View Resources'}
                {route === 'api-docs' && 'View API Docs'}
            </button>
        </div>
    );
};
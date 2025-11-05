// Home Page Component - React
const HomePage = () => {
    const features = [
        {
            title: '⚙️ Management',
            description: 'Access all port management modules including vessels, docks, staff, and resources.',
            route: 'management'
        },
        {
            title: '🏗️ 3D Port Visualization', 
            description: 'Interactive 3D view of the port infrastructure and operations.',
            route: '3d-view'
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
        <div 
            className="feature-card"
            onClick={() => window.app.navigate(route)}
            style={{ cursor: 'pointer' }}
        >
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
};
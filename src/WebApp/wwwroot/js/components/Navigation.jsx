// Navigation Component - React
const Navigation = ({ currentPage, onNavigate }) => {
    const navItems = [
        { id: 'home', label: 'Home', icon: '🏠' },
        { id: '3d-view', label: '3D Port View', icon: '🏗️' },
        { id: 'resources', label: 'Resources', icon: '📦' },
        { id: 'vessels', label: 'Vessels', icon: '🚢' },
        { id: 'api-docs', label: 'API Docs', icon: '📚' }
    ];

    return (
        <header className="header-bar">
            <div className="header-content">
                <div className="logo-section">
                    <h1>⚓ Port Management System</h1>
                </div>
                <nav className="primary-navigation">
                    <ul className="nav-menu">
                        {navItems.map(item => (
                            <li key={item.id}>
                                <a 
                                    href={`#${item.id}`}
                                    className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onNavigate(item.id);
                                    }}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    );
};
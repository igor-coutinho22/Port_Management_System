// Navigation Component - React
const Navigation = ({ currentPage, onNavigate }) => {
    const [isDarkMode, setIsDarkMode] = React.useState(false);

    // Load saved theme preference
    React.useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setIsDarkMode(prefersDark);
        
        // Apply theme to html element
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        
        // Also add class to body for additional targeting
        document.body.className = prefersDark ? 'dark-theme' : 'light-theme';
        
        console.log('Theme applied:', prefersDark ? 'dark' : 'light'); // Debug log
    }, []);

    const toggleTheme = () => {
        const newTheme = !isDarkMode;
        setIsDarkMode(newTheme);
        const theme = newTheme ? 'dark' : 'light';
        
        // Apply theme to html element
        document.documentElement.setAttribute('data-theme', theme);
        
        // Also add class to body
        document.body.className = newTheme ? 'dark-theme' : 'light-theme';
        
        localStorage.setItem('theme', theme);
        
        console.log('Theme toggled to:', theme); // Debug log
    };
    const navItems = [
        { id: 'management', label: 'Management', icon: '⚙️' },
        { id: '3d-view', label: '3D Port View', icon: '🏗️' },
        { id: 'api-docs', label: 'API Docs', icon: '📚' }
    ];

    console.log('Navigation component updated! New navItems:', navItems);

    return (
        <header className="header-bar">
            <div className="header-content">
                <div className="logo-section" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
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
                <div className="header-actions">
                    <div className="theme-switch" onClick={toggleTheme} title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
                        <div className={`theme-switch-track ${isDarkMode ? 'dark' : 'light'}`}>
                            <div className={`theme-switch-thumb ${isDarkMode ? 'dark' : 'light'}`}>
                                <span className="theme-icon">{isDarkMode ? '🌙' : '☀️'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
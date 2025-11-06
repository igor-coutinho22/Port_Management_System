// Navigation Component - React (Redesigned with hamburger menu)
const Navigation = ({ currentPage, onNavigate, onHamburgerMenuToggle }) => {
    const [isDarkMode, setIsDarkMode] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { currentUser, canAccessMenu } = useUser();

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
    // All possible navigation items
    const allNavItems = [
        { id: 'management', label: 'Management', icon: '⚙️' },
        { id: '3d-view', label: '3D Port View', icon: '🏗️' },
        { id: 'api-docs', label: 'API Docs', icon: '📚' }
    ];

    // Filter navigation items based on user permissions
    const navItems = allNavItems.filter(item => canAccessMenu(item.id));

    const toggleMenu = () => {
        const newMenuState = !isMenuOpen;
        setIsMenuOpen(newMenuState);
        // Notify parent component about hamburger menu state
        if (onHamburgerMenuToggle) {
            onHamburgerMenuToggle(newMenuState);
        }
    };

    const handleNavigateFromMenu = (page) => {
        onNavigate(page);
        setIsMenuOpen(false); // Close menu after navigation
        // Notify parent that hamburger menu is closed
        if (onHamburgerMenuToggle) {
            onHamburgerMenuToggle(false);
        }
    };

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (isMenuOpen && !event.target.closest('.nav-menu-container') && !event.target.closest('.hamburger-menu')) {
                setIsMenuOpen(false);
                // Notify parent that hamburger menu is closed
                if (onHamburgerMenuToggle) {
                    onHamburgerMenuToggle(false);
                }
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMenuOpen]);

    console.log('Navigation items filtered for user:', currentUser?.role, navItems);

    return (
        <>
            <header className="header-bar">
                <div className="header-content">
                    {/* Hamburger Menu Button */}
                    <button 
                        className={`hamburger-menu ${isMenuOpen ? 'active' : ''}`}
                        onClick={toggleMenu}
                        title="Toggle navigation menu"
                        aria-label="Toggle navigation menu"
                    >
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                        <span className="hamburger-line"></span>
                    </button>

                    {/* Logo/Home */}
                    <div className="logo-section" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
                        <h1>⚓ Port Management System</h1>
                    </div>

                    {/* Header Actions - Right Side */}
                    <div className="header-actions">
                        {/* User Section */}
                        <div className="user-section">
                            <div className="user-info">
                                <span className="user-name">{currentUser?.name || 'Unknown User'}</span>
                                <span className="user-role">({currentUser?.role || 'no role'})</span>
                            </div>
                            <UserRoleSwitcher />
                        </div>
                        
                        {/* Theme Switch */}
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

            {/* Slide-out Navigation Menu */}
            <div className={`nav-menu-container ${isMenuOpen ? 'open' : ''}`}>
                <div className="nav-menu-overlay" onClick={() => {
                    setIsMenuOpen(false);
                    if (onHamburgerMenuToggle) {
                        onHamburgerMenuToggle(false);
                    }
                }}></div>
                <nav className="slide-out-menu">
                    <div className="menu-header">
                        <h3>Navigation</h3>
                        <button 
                            className="menu-close" 
                            onClick={() => {
                                setIsMenuOpen(false);
                                if (onHamburgerMenuToggle) {
                                    onHamburgerMenuToggle(false);
                                }
                            }}
                            title="Close menu"
                        >
                            ✕
                        </button>
                    </div>
                    
                    <ul className="menu-items">
                        <li>
                            <button
                                className={`menu-item ${currentPage === 'home' ? 'active' : ''}`}
                                onClick={() => handleNavigateFromMenu('home')}
                            >
                                <span className="menu-icon">🏠</span>
                                <span className="menu-label">Home</span>
                            </button>
                        </li>
                        
                        {navItems.map(item => (
                            <li key={item.id}>
                                <button
                                    className={`menu-item ${currentPage === item.id ? 'active' : ''}`}
                                    onClick={() => handleNavigateFromMenu(item.id)}
                                >
                                    <span className="menu-icon">{item.icon}</span>
                                    <span className="menu-label">{item.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </>
    );
};
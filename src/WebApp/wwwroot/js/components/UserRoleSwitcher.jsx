// User Role Switcher Component - Elegant toggle similar to theme switcher
const UserRoleSwitcher = () => {
    const { currentUser, switchUser, availableUsers } = useUser();
    const [isExpanded, setIsExpanded] = React.useState(false);

    // Role display configuration
    const roleConfig = {
        administrator: {
            shortName: 'Admin',
            icon: '👑',
            color: '#ef4444', // Red
            description: 'System Administrator'
        },
        portAuthority: {
            shortName: 'Officer',
            icon: '⚓',
            color: '#3b82f6', // Blue
            description: 'Port Authority Officer'
        },
        shippingAgent: {
            shortName: 'Agent',
            icon: '🚢',
            color: '#10b981', // Green
            description: 'Shipping Agent Representative'
        },
        logisticsOperator: {
            shortName: 'Operator',
            icon: '📦',
            color: '#f59e0b', // Amber
            description: 'Logistics Operator'
        }
    };

    const currentRoleConfig = roleConfig[currentUser?.username] || roleConfig.administrator;

    const handleRoleSwitch = (username) => {
        switchUser(username);
        setIsExpanded(false);
    };

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (isExpanded && !event.target.closest('.user-role-switcher')) {
                setIsExpanded(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isExpanded]);

    return (
        <div className="user-role-switcher">
            {/* Current Role Display */}
            <div 
                className={`role-display ${isExpanded ? 'expanded' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
                title={`Current role: ${currentRoleConfig.description}\nClick to switch roles (demo feature)`}
            >
                <div className="role-indicator">
                    <span 
                        className="role-icon" 
                        style={{ color: currentRoleConfig.color }}
                    >
                        {currentRoleConfig.icon}
                    </span>
                    <span className="role-text">{currentRoleConfig.shortName}</span>
                </div>
                <span className={`expand-arrow ${isExpanded ? 'rotated' : ''}`}>
                    ▼
                </span>
            </div>

            {/* Role Options Dropdown */}
            {isExpanded && (
                <div className="role-options">
                    {availableUsers.map(username => {
                        const config = roleConfig[username];
                        const isActive = currentUser?.username === username;
                        
                        return (
                            <button
                                key={username}
                                className={`role-option ${isActive ? 'active' : ''}`}
                                onClick={() => handleRoleSwitch(username)}
                                disabled={isActive}
                            >
                                <span 
                                    className="role-icon" 
                                    style={{ color: config.color }}
                                >
                                    {config.icon}
                                </span>
                                <div className="role-info">
                                    <span className="role-name">{config.shortName}</span>
                                    <span className="role-desc">{config.description}</span>
                                </div>
                                {isActive && (
                                    <span className="active-indicator">✓</span>
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

console.log('UserRoleSwitcher component loaded!');
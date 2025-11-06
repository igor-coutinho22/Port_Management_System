// User Context - Authentication and Role Management
// TODO: Replace mock authentication with real implementation
// This context is prepared for integration with actual authentication system
const UserContext = React.createContext(null);

// Mock user data for demonstration (will be replaced with real authentication)
const MOCK_USERS = {
    administrator: {
        id: 'admin-001',
        username: 'administrator',
        name: 'System Administrator',
        email: 'admin@portmanagement.com',
        role: 'administrator',
        permissions: ['*'] // Administrator has all permissions
    },
    portAuthority: {
        id: 'pao-001',
        username: 'portAuthority',
        name: 'Port Authority Officer',
        email: 'officer@portauthority.com',
        role: 'portAuthority',
        permissions: [
            // Vessel Visit Notification management
            'vessel-visit-notifications.view',
            'vessel-visit-notifications.approve',
            'vessel-visit-notifications.reject',
            'vessel-visit-notifications.manage',
            
            // Dock assignment and management
            'docks.view',
            'docks.assign',
            'docks.manage',
            
            // Shipping agent and vessel authorization management
            'representatives.view',
            'representatives.manage',
            'organizations.view',
            'organizations.manage',
            'vessels.view',
            'vessels.authorize',
            
            // Port operations oversight
            'resources.view',
            'storage-areas.view',
            'staff.view',
            'qualifications.view',
            
            // System access
            'management.access',
            '3d-view.access'
        ]
    },
    shippingAgent: {
        id: 'sar-001',
        username: 'shippingAgent',
        name: 'Shipping Agent Representative',
        email: 'agent@shippingcompany.com',
        role: 'shippingAgent',
        permissions: [
            // Vessel Visit Notification submission and management
            'vessel-visit-notifications.view',
            'vessel-visit-notifications.create',
            'vessel-visit-notifications.update',
            'vessel-visit-notifications.cancel',
            'vessel-visit-notifications.monitor',
            
            // Cargo manifest management
            'cargo-manifests.create',
            'cargo-manifests.update',
            'cargo-manifests.view',
            
            // Vessel information (for vessels they represent)
            'vessels.view',
            'vessel-types.view',
            
            // Documentation and status monitoring
            'organizations.view', // Their own organization
            'representatives.view', // Their own profile
            
            // Limited system access
            '3d-view.access',
            'api-docs.access'
        ]
    },
    logisticsOperator: {
        id: 'lo-001',
        username: 'logisticsOperator',
        name: 'Logistics Operator',
        email: 'operator@portlogistics.com',
        role: 'logisticsOperator',
        permissions: [
            // Operational task management for approved visits
            'vessel-visit-notifications.view',
            'operational-tasks.create',
            'operational-tasks.schedule',
            'operational-tasks.monitor',
            'operational-tasks.adjust',
            
            // Resource allocation and management
            'resources.view',
            'resources.allocate',
            'resources.schedule',
            
            // Dock and storage operations
            'docks.view',
            'docks.operate',
            'storage-areas.view',
            'storage-areas.manage',
            
            // Cargo and logistics management
            'cargo-operations.manage',
            'loading-unloading.schedule',
            'yard-operations.manage',
            'warehouse-operations.manage',
            
            // Equipment management
            'cranes.operate',
            'trucks.schedule',
            'yard-equipment.manage',
            
            // Vessel and logistics information
            'vessels.view',
            'vessel-types.view',
            
            // System access
            'management.access',
            '3d-view.access'
        ]
    }
};

// Role-based menu configuration for port management workflow
const MENU_PERMISSIONS = {
    'home': [], // Always accessible
    'management': ['management.access'],
    '3d-view': ['3d-view.access'],
    'api-docs': ['api-docs.access'],
    
    // Core management entities
    'resources': ['resources.view', 'resources.allocate'],
    'vessels': ['vessels.view', 'vessels.authorize'],
    'vessel-types': ['vessels.view', 'vessel-types.view'],
    'docks': ['docks.view', 'docks.assign', 'docks.operate'],
    'storage-areas': ['storage-areas.view', 'storage-areas.manage'],
    'organizations': ['organizations.view', 'organizations.manage'],
    'representatives': ['representatives.view', 'representatives.manage'],
    'staff': ['staff.view'],
    'vessel-visit-notifications': ['vessel-visit-notifications.view', 'vessel-visit-notifications.create', 'vessel-visit-notifications.approve'],
    'qualifications': ['qualifications.view']
};

// User Context Provider Component
const UserProvider = ({ children }) => {
    // Default to administrator user (only implemented role currently)
    const [currentUser, setCurrentUser] = React.useState(MOCK_USERS.administrator);
    const [isAuthenticated, setIsAuthenticated] = React.useState(true);

    // Check if user has permission for a specific action
    const hasPermission = React.useCallback((permission) => {
        if (!currentUser || !isAuthenticated) return false;
        
        // Admin has all permissions
        if (currentUser.permissions.includes('*')) return true;
        
        // Check specific permission
        return currentUser.permissions.includes(permission);
    }, [currentUser, isAuthenticated]);

    // Check if user can access a menu item
    const canAccessMenu = React.useCallback((menuId) => {
        const requiredPermissions = MENU_PERMISSIONS[menuId] || [];
        
        // If no permissions required, everyone can access
        if (requiredPermissions.length === 0) return true;
        
        // Check if user has any of the required permissions
        return requiredPermissions.some(permission => hasPermission(permission));
    }, [hasPermission]);

    // Login function (mock implementation)
    const login = React.useCallback((username, password) => {
        // In real implementation, this would call your authentication API
        const user = MOCK_USERS[username];
        if (user && password === 'password') { // Mock password check
            setCurrentUser(user);
            setIsAuthenticated(true);
            localStorage.setItem('currentUser', JSON.stringify(user));
            return { success: true, user };
        }
        return { success: false, error: 'Invalid credentials' };
    }, []);

    // Logout function
    const logout = React.useCallback(() => {
        setCurrentUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('currentUser');
    }, []);

    // Switch user for demo purposes
    const switchUser = React.useCallback((username) => {
        const user = MOCK_USERS[username];
        if (user) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            localStorage.setItem('currentUser', JSON.stringify(user));
        }
    }, []);

    // Load user from localStorage on mount
    React.useEffect(() => {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                setCurrentUser(user);
                setIsAuthenticated(true);
            } catch (e) {
                console.error('Error loading saved user:', e);
                localStorage.removeItem('currentUser');
            }
        }
    }, []);

    const contextValue = {
        currentUser,
        isAuthenticated,
        hasPermission,
        canAccessMenu,
        login,
        logout,
        switchUser, // For demo purposes
        availableUsers: Object.keys(MOCK_USERS) // For demo purposes
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

// Custom hook to use the User context
const useUser = () => {
    const context = React.useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

console.log('UserContext and authentication system loaded!');
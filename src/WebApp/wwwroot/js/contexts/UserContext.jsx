/* global React */

const UserContext = React.createContext(null);

// ---- Roles from backend ----
const APP_ROLES = {
    Admin: "Admin",
    Operator: "Operator",
    Officer: "Officer",
    Representative: "Representative",
};

// ---- Role → Permissions mapping ----
const ROLE_PERMISSIONS = {
    [APP_ROLES.Admin]: ["*"],

    [APP_ROLES.Officer]: [
        "vessel-visit-notifications.view",
        "vessel-visit-notifications.approve",
        "vessel-visit-notifications.reject",
        "vessel-visit-notifications.manage",
        "docks.view",
        "docks.assign",
        "docks.manage",
        "representatives.view",
        "representatives.manage",
        "organizations.view",
        "organizations.manage",
        "vessels.view",
        "vessels.authorize",
        "resources.view",
        "storage-areas.view",
        "staff.view",
        "qualifications.view",
        "management.access",
        "3d-view.access",
    ],

    [APP_ROLES.Representative]: [
        "vessel-visit-notifications.view",
        "vessel-visit-notifications.create",
        "vessel-visit-notifications.update",
        "vessel-visit-notifications.cancel",
        "vessel-visit-notifications.monitor",
        "cargo-manifests.create",
        "cargo-manifests.update",
        "cargo-manifests.view",
        "vessels.view",
        "vessel-types.view",
        "organizations.view",
        "representatives.view",
        "3d-view.access",
        "api-docs.access",
    ],

    [APP_ROLES.Operator]: [
        "vessel-visit-notifications.view",
        "operational-tasks.create",
        "operational-tasks.schedule",
        "operational-tasks.monitor",
        "operational-tasks.adjust",
        "resources.view",
        "resources.allocate",
        "resources.schedule",
        "docks.view",
        "docks.operate",
        "storage-areas.view",
        "storage-areas.manage",
        "cargo-operations.manage",
        "loading-unloading.schedule",
        "yard-operations.manage",
        "warehouse-operations.manage",
        "cranes.operate",
        "trucks.schedule",
        "yard-equipment.manage",
        "vessels.view",
        "vessel-types.view",
        "management.access",
        "3d-view.access",
    ],
};

// ---- Menu → permissions ----
const MENU_PERMISSIONS = {
    home: [],
    management: ["management.access"],
    "3d-view": ["3d-view.access"],
    "api-docs": ["api-docs.access"],
    "admin-users": ["*"],

    resources: ["resources.view", "resources.allocate"],
    vessels: ["vessels.view", "vessels.authorize"],
    "vessel-types": ["vessels.view", "vessel-types.view"],
    docks: ["docks.view", "docks.assign", "docks.operate"],
    "storage-areas": ["storage-areas.view", "storage-areas.manage"],
    organizations: ["organizations.view", "organizations.manage"],
    representatives: ["representatives.view", "representatives.manage"],
    staff: ["staff.view"],
    "vessel-visit-notifications": [
        "vessel-visit-notifications.view",
        "vessel-visit-notifications.create",
        "vessel-visit-notifications.approve",
    ],
    qualifications: ["qualifications.view"],
};

function computePermissionsForRole(role) {
    const list = ROLE_PERMISSIONS[role] || [];
    return [...new Set(list)];
}

const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = React.useState(null);
    const [activeRole, setActiveRole] = React.useState(null);
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [isLoadingUser, setIsLoadingUser] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        let cancelled = false;

        async function loadUser() {
            setIsLoadingUser(true);
            setError(null);
            try {
                const me = await window.apiService.getCurrentUser(); // GET /api/me

                if (cancelled) return;

                const roles = me.roles || [];
                const primaryRole = roles[0] || null;
                const name =
                    me.name ||
                    [me.firstName, me.lastName].filter(Boolean).join(" ") ||
                    me.email ||
                    "Unknown User";

                setCurrentUser({
                    ...me, // email, firstName, lastName, roles[]
                    name,
                    roles: me.roles || [],
                });
                setActiveRole(primaryRole);
                setIsAuthenticated(true);
            } catch (e) {
                if (cancelled) return;
                console.warn("Failed to load /api/me:", e);
                setCurrentUser(null);
                setActiveRole(null);
                setIsAuthenticated(false);
                setError(e);
            } finally {
                if (!cancelled) setIsLoadingUser(false);
            }
        }

        loadUser();
        return () => {
            cancelled = true;
        };
    }, []);

    const permissions = React.useMemo(() => {
        if (!currentUser || !activeRole) return [];
        if (ROLE_PERMISSIONS[activeRole]?.includes("*")) return ["*"];
        return computePermissionsForRole(activeRole);
    }, [currentUser, activeRole]);

    const hasPermission = React.useCallback(
        (permission) => {
            if (!currentUser || !isAuthenticated) return false;
            if (permissions.includes("*")) return true;
            return permissions.includes(permission);
        },
        [currentUser, isAuthenticated, permissions]
    );

    const canAccessMenu = React.useCallback(
        (menuId) => {
            if (!currentUser || !isAuthenticated) return false;

            const required = MENU_PERMISSIONS[menuId] || [];
            if (required.length === 0) return true;
            if (permissions.includes("*")) return true;

            return required.some((p) => hasPermission(p));
        },
        [currentUser, isAuthenticated, permissions, hasPermission]
    );

    const logout = React.useCallback(async () => {
        const pca = window.__pca;
        if (!pca) {
            console.error("Logout: MSAL PublicClientApplication (window.__pca) not found.");
            return;
        }
        const account = pca.getActiveAccount() || pca.getAllAccounts()[0] || null;
        await pca.logoutRedirect({
            account: account || undefined,
            postLogoutRedirectUri: window.location.origin,
        });
    }, []);

    const value = {
        currentUser,               // { name, email, roles: [...] }
        roles: currentUser?.roles || [],
        activeRole,                // string | null
        setActiveRole,             // function(role)
        isAuthenticated,
        isLoadingUser,
        error,
        permissions,
        hasPermission,
        canAccessMenu,
        logout,
    };

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
};

const useUser = () => {
    const ctx = React.useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used within a UserProvider");
    return ctx;
};

console.log("UserContext (with activeRole) loaded!");

/* global React */

const UserContext = React.createContext(null);

// ----------------------
// Constants
// ----------------------
const USER_STORAGE_KEY = "pm.currentUser.v1";
const ACTIVE_ROLE_KEY = "pm.activeRole.v1";

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
    "privacy-management": ["privacy.manage"],
};

function computePermissionsForRole(role) {
    const list = ROLE_PERMISSIONS[role] || [];
    return [...new Set(list)];
}

const UserProvider = ({ children }) => {
    // 1) Initial state comes from localStorage (optimistic)
    const [currentUser, setCurrentUser] = React.useState(() => {
        try {
            const raw = localStorage.getItem(USER_STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    });

    const [activeRoleState, setActiveRoleState] = React.useState(() => {
        try {
            const raw = localStorage.getItem(ACTIVE_ROLE_KEY);
            return raw || null;
        } catch {
            return null;
        }
    });

    const [isAuthenticated, setIsAuthenticated] = React.useState(
        !!currentUser
    );
    const [isLoadingUser, setIsLoadingUser] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Wrapper so we always persist activeRole
    const setActiveRole = React.useCallback((role) => {
        setActiveRoleState(role);
        try {
            if (role) localStorage.setItem(ACTIVE_ROLE_KEY, role);
            else localStorage.removeItem(ACTIVE_ROLE_KEY);
        } catch {
            // ignore storage errors
        }
    }, []);

    const activeRole = activeRoleState;

    // ---- Load /api/me and sync with storage ----
    const loadUser = React.useCallback(async () => {
        setIsLoadingUser(true);
        setError(null);

        try {
            const me = await window.apiService.getCurrentUser(); // GET /api/me

            let privacyData = {};
            try {
                privacyData = await window.apiService.getPrivacyStatus();
            } catch (pErr) {
                console.warn("Failed to check privacy status:", pErr);
            }

            const roles = me.roles || [];
            const primaryRole = roles[0] || null;

            const name =
                me.name ||
                [me.firstName, me.lastName].filter(Boolean).join(" ") ||
                me.email ||
                "Unknown User";

            // Prefer stored role if still valid
            let chosenRole = activeRole;
            if (!chosenRole || !roles.includes(chosenRole)) {
                chosenRole = primaryRole;
            }

            const userObj = {
                ...me,
                ...privacyData,
                name,
                roles,
            };

            setCurrentUser(userObj);
            setActiveRole(chosenRole);
            setIsAuthenticated(true);

            try {
                localStorage.setItem(
                    USER_STORAGE_KEY,
                    JSON.stringify(userObj)
                );
            } catch {
                // ignore storage errors
            }
        } catch (e) {
            console.warn("Failed to load /api/me:", e);
            const message = e?.message || "";
            const isNoRole = message.includes("403");

            setCurrentUser(null);
            setActiveRole(null);
            setIsAuthenticated(false);
            setError(isNoRole ? { code: "NO_ROLE", raw: e } : e);

            try {
                localStorage.removeItem(USER_STORAGE_KEY);
            } catch {
                // ignore
            }
        } finally {
            setIsLoadingUser(false);
        }
    }, [activeRole, setActiveRole]);

    React.useEffect(() => {
        loadUser();
    }, [loadUser]);

    // ---- Permissions derived from activeRole ----
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
        const origin = window.location.origin;

        // 1. Clear app-level auth state first
        setCurrentUser(null);
        setActiveRole(null);
        setIsAuthenticated(false);

        try {
            localStorage.removeItem(USER_STORAGE_KEY);
            localStorage.removeItem(ACTIVE_ROLE_KEY);
        } catch {
            // ignore storage errors
        }

        const pca = window.__pca;
        if (!pca) {
            console.error("Logout: MSAL PublicClientApplication (window.__pca) not found.");
            // Hard reload as a fallback
            window.location.href = origin;
            return;
        }

        try {
            // IMPORTANT: do NOT pass `account` here.
            // Let CIAM sign out the current session and redirect back.
            await pca.logoutRedirect({
                postLogoutRedirectUri: origin
            });

            // Browser will navigate away, so code after this may not run.
        } catch (e) {
            console.error("logoutRedirect failed, falling back to local cleanup:", e);

            // Fallback: just clear MSAL cache and reload.
            try {
                const accounts = pca.getAllAccounts();
                for (const acc of accounts) {
                    try { await pca.removeAccount(acc); } catch { /* ignore */ }
                }
            } catch { /* ignore */ }

            window.location.href = origin;
        }
    }, []); 


    const value = {
        currentUser, // { name, email, roles: [...] }
        roles: currentUser?.roles || [],
        activeRole,
        setActiveRole, // function(role)
        isAuthenticated,
        isLoadingUser,
        error,
        permissions,
        hasPermission,
        canAccessMenu,
        logout,
        refreshUser: loadUser, 
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

const useUser = () => {
    const ctx = React.useContext(UserContext);
    if (!ctx) throw new Error("useUser must be used within a UserProvider");
    return ctx;
};

console.log("UserContext (with activeRole + persistence) loaded!");

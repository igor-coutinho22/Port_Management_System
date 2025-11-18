// Simple User Role Switcher:
// - Shows current role or "sem função"
// - Shows dropdown only if there are multiple roles
const UserRoleSwitcher = () => {
    const { currentUser, activeRole, setActiveRole } = useUser();
    const { t } = useTranslation();

    // Hooks: always called in same order, every render
    const [isExpanded, setIsExpanded] = React.useState(false);

    // Normalize roles from user
    const roles = Array.isArray(currentUser?.roles) ? currentUser.roles : [];
    const hasMultipleRoles = roles.length > 1;

    // Pick which role to show:
    const effectiveRole =
        activeRole ||
        (roles.length > 0 ? roles[0] : null);

    const toggleExpanded = () => {
        if (hasMultipleRoles) {
            setIsExpanded((prev) => !prev);
        }
    };

    const handleSelectRole = (role) => {
        if (typeof setActiveRole === "function") {
            setActiveRole(role);
        }
        setIsExpanded(false);
    };

    // --- RENDER ---

    // No roles at all
    if (!effectiveRole) {
        return (
            <div className="user-role-switcher">
                <div className="role-display disabled">
                    <div className="role-indicator">
                        <span className="role-text">
                            {t("user.no_role", "sem função")}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // At least one role
    return (
        <div className="user-role-switcher">
            {/* Current Role Display */}
            <div
                className={
                    "role-display " +
                    (hasMultipleRoles && isExpanded ? "expanded" : "") +
                    (!hasMultipleRoles ? " single-role" : "")
                }
                onClick={toggleExpanded}
                style={{ cursor: hasMultipleRoles ? "pointer" : "default" }}
                title={
                    hasMultipleRoles
                        ? `${t("user.current_role", "Current role")}: ${effectiveRole}\n${t(
                            "user.click_to_switch",
                            "Click to switch roles"
                        )}`
                        : `${t("user.current_role", "Current role")}: ${effectiveRole}`
                }
            >
                <div className="role-indicator">
                    <span className="role-text">{effectiveRole}</span>
                </div>
                {hasMultipleRoles && (
                    <span className={`expand-arrow ${isExpanded ? "rotated" : ""}`}>
                        ▼
                    </span>
                )}
            </div>

            {/* Dropdown only if multiple roles */}
            {hasMultipleRoles && isExpanded && (
                <div className="role-options">
                    {roles.map((role) => {
                        const isActive = role === effectiveRole;
                        return (
                            <button
                                key={role}
                                className={`role-option ${isActive ? "active" : ""}`}
                                onClick={() => handleSelectRole(role)}
                                disabled={isActive}
                            >
                                <div className="role-info">
                                    <span className="role-name">{role}</span>
                                </div>
                                {isActive && <span className="active-indicator">✓</span>}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

console.log("UserRoleSwitcher component loaded!");

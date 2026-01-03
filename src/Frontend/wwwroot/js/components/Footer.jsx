// Footer Component - System Information and Quick Links
const Footer = ({ currentPage, onNavigate }) => {
    const { t, formatDate } = useTranslation();
    const currentYear = new Date().getFullYear();
    const systemVersion = "1.0.0"; // This could be dynamic from config

    const quickLinks = [
        { id: 'home', labelKey: 'nav.home', icon: '⚓' },
        { id: 'management', labelKey: 'nav.management', icon: '⚙️' },
        { id: 'scheduling', labelKey: 'nav.scheduling', icon: '📅' },
        { id: 'admin-users', labelKey: 'nav.admin_users', icon: '👤' },
        { id: '3d-view', labelKey: 'nav.3d_view', icon: '🏗️' },
        { id: 'vvn_representatives', labelKey: 'nav.vvn_representatives', icon: '🔔' },
        { id: 'privacy-management', labelKey: 'nav.privacy_management', icon: '🔒' }
    ];

    const handleQuickNavigate = (page) => {
        onNavigate(page);
        // Smooth scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="app-footer">
            <div className="footer-content">
                {/* Quick Navigation */}
                <div className="footer-section">
                    <h4 className="footer-title">{t('footer.quick_navigation', 'Quick Navigation')}</h4>
                    <nav className="footer-nav">
                        {quickLinks.map(link => (
                            <button
                                key={link.id}
                                className={`footer-link ${currentPage === link.id ? 'active' : ''}`}
                                onClick={() => handleQuickNavigate(link.id)}
                            >
                                <span className="footer-icon">{link.icon}</span>
                                {t(link.labelKey, link.labelKey)}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* System Information */}
                <div className="footer-section">
                    <h4 className="footer-title">{t('footer.system_info', 'System Info')}</h4>
                    <div className="footer-info">
                        <div className="info-item">
                            <span className="info-label">{t('footer.version', 'Version')}:</span>
                            <span className="info-value">{systemVersion}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">{t('footer.status', 'Status')}:</span>
                            <span className="info-value status-online">{t('footer.status_online', 'Online')}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">{t('footer.last_updated', 'Last Updated')}:</span>
                            <span className="info-value">{formatDate(new Date())}</span>
                        </div>
                    </div>
                </div>

                {/* Help & Support */}
                <div className="footer-section">
                    <h4 className="footer-title">{t('footer.help_support', 'Help & Support')}</h4>
                    <div className="footer-links">
                        <button 
                            className="footer-link"
                            onClick={() => handleQuickNavigate('api-docs')}
                        >
                            📖 {t('footer.documentation', 'Documentation')}
                        </button>
                        <button 
                            className="footer-link"
                            onClick={() => alert(t('footer.contact_email', 'Contact support at: support@portmanagement.com'))}
                        >
                            📧 {t('footer.contact_support', 'Contact Support')}
                        </button>
                        <button 
                            className="footer-link"
                            onClick={() => window.open('https://github.com', '_blank')}
                        >
                            🔗 {t('footer.github', 'GitHub')}
                        </button>
                    </div>
                </div>

                {/* About */}
                <div className="footer-section">
                    <h4 className="footer-title">{t('footer.about', 'About')}</h4>
                    <p className="footer-description">
                        {t('footer.description', 'Port Management System - Comprehensive solution for modern port operations, vessel tracking, and resource management.')}
                    </p>
                    <div className="footer-badges">
                        <span className="badge">React</span>
                        <span className="badge">Three.js</span>
                        <span className="badge">REST API</span>
                    </div>
                </div>
            </div>

            {/* Copyright Bar */}
            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <div className="copyright">
                        {t('footer.copyright', '© {{year}} Port Management System. All rights reserved.', { year: currentYear })}
                    </div>
                    <div className="footer-meta">
                        <span>{t('footer.built_for', 'Built for efficient port operations')}</span>
                        <span className="separator">•</span>
                        <button 
                            className="footer-link-small"
                            onClick={() => alert(t('footer.privacy_message', 'Privacy Policy: This system respects your privacy and handles data according to GDPR standards.'))}
                        >
                            {t('footer.privacy_policy', 'Privacy Policy')}
                        </button>
                        <span className="separator">•</span>
                        <button 
                            className="footer-link-small"
                            onClick={() => alert(t('footer.terms_message', 'Terms of Service: This system is provided as-is for port management operations.'))}
                        >
                            {t('footer.terms_of_service', 'Terms of Service')}
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

console.log('Footer component loaded!');
// Footer Component - System Information and Quick Links
const Footer = ({ currentPage, onNavigate }) => {
    const currentYear = new Date().getFullYear();
    const systemVersion = "1.0.0"; // This could be dynamic from config

    const quickLinks = [
        { id: 'home', label: 'Home', icon: '🏠' },
        { id: 'management', label: 'Management', icon: '⚙️' },
        { id: '3d-view', label: '3D View', icon: '🏗️' },
        { id: 'api-docs', label: 'API Docs', icon: '📚' }
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
                    <h4 className="footer-title">Quick Navigation</h4>
                    <nav className="footer-nav">
                        {quickLinks.map(link => (
                            <button
                                key={link.id}
                                className={`footer-link ${currentPage === link.id ? 'active' : ''}`}
                                onClick={() => handleQuickNavigate(link.id)}
                            >
                                <span className="footer-icon">{link.icon}</span>
                                {link.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* System Information */}
                <div className="footer-section">
                    <h4 className="footer-title">System Info</h4>
                    <div className="footer-info">
                        <div className="info-item">
                            <span className="info-label">Version:</span>
                            <span className="info-value">{systemVersion}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Status:</span>
                            <span className="info-value status-online">Online</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Last Updated:</span>
                            <span className="info-value">{new Date().toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Help & Support */}
                <div className="footer-section">
                    <h4 className="footer-title">Help & Support</h4>
                    <div className="footer-links">
                        <button 
                            className="footer-link"
                            onClick={() => handleQuickNavigate('api-docs')}
                        >
                            📖 Documentation
                        </button>
                        <button 
                            className="footer-link"
                            onClick={() => alert('Contact support at: support@portmanagement.com')}
                        >
                            📧 Contact Support
                        </button>
                        <button 
                            className="footer-link"
                            onClick={() => window.open('https://github.com', '_blank')}
                        >
                            🔗 GitHub
                        </button>
                    </div>
                </div>

                {/* About */}
                <div className="footer-section">
                    <h4 className="footer-title">About</h4>
                    <p className="footer-description">
                        Port Management System - Comprehensive solution for modern port operations, 
                        vessel tracking, and resource management.
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
                        © {currentYear} Port Management System. All rights reserved.
                    </div>
                    <div className="footer-meta">
                        <span>Built for efficient port operations</span>
                        <span className="separator">•</span>
                        <button 
                            className="footer-link-small"
                            onClick={() => alert('Privacy Policy: This system respects your privacy and handles data according to GDPR standards.')}
                        >
                            Privacy Policy
                        </button>
                        <span className="separator">•</span>
                        <button 
                            className="footer-link-small"
                            onClick={() => alert('Terms of Service: This system is provided as-is for port management operations.')}
                        >
                            Terms of Service
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

console.log('Footer component loaded!');
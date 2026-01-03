const UserProfilePage = () => {
    const { currentUser } = useUser();
    const [downloading, setDownloading] = React.useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            await window.apiService.downloadMyData();
        } catch (error) {
            console.error(error);
            alert("Failed to download data. Please try again.");
        } finally {
            setDownloading(false);
        }
    };

    if (!currentUser) return <div className="loading-indicator">Loading profile...</div>;

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">My Profile</h2>
                <p>Manage your account settings and exercise your data rights.</p>
            </div>

            <div className="card-container" style={{ maxWidth: '800px' }}>
                {/* User Identity Card */}
                <div style={{ 
                    display: 'flex', 
                    gap: '20px', 
                    alignItems: 'center', 
                    padding: '20px', 
                    backgroundColor: '#1e293b', 
                    borderRadius: '8px',
                    border: '1px solid #334155'
                }}>
                    <div style={{ fontSize: '3rem', padding: '10px', background: '#0f172a', borderRadius: '50%' }}>👤</div>
                    <div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.5rem', color: '#fff' }}>{currentUser.name}</h3>
                        <p style={{ color: '#94a3b8', margin: 0 }}>{currentUser.email}</p>
                        <div style={{ marginTop: '10px' }}>
                            {currentUser.roles.map(r => (
                                <span key={r} className="status-badge" style={{ backgroundColor: '#6366f1', marginRight: '5px' }}>
                                    {r}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="section-divider" style={{ margin: '30px 0', borderTop: '1px solid #334155' }}></div>

                {/* GDPR Section */}
                <h3 style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🔒</span> GDPR Data Rights
                </h3>
                <p style={{ color: '#cbd5e1', marginBottom: '20px' }}>
                    In accordance with GDPR, you have the right to access the personal data stored by this system.
                </p>

                <div className="action-card" style={{ 
                    border: '1px solid #38bdf8', 
                    padding: '20px', 
                    borderRadius: '8px',
                    backgroundColor: 'rgba(56, 189, 248, 0.05)',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '20px'
                }}>
                    <div style={{ flex: 1 }}>
                        <strong style={{ fontSize: '1.1rem', color: '#f0f9ff' }}>Export Personal Data</strong>
                        <p style={{ fontSize: '0.9em', color: '#94a3b8', margin: '5px 0 0 0' }}>
                            Download a machine-readable (JSON) copy of your profile, compliance history, and system logs.
                        </p>
                    </div>
                    <button 
                        onClick={handleDownload} 
                        disabled={downloading}
                        className="submit-btn" 
                        style={{ 
                            width: 'auto', 
                            backgroundColor: '#0284c7',
                            padding: '10px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {downloading ? (
                            <><span>⏳</span> Generating...</>
                        ) : (
                            <><span>📥</span> Download JSON</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
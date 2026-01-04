const PrivacyAcceptanceModal = ({ onAccept }) => {
    const [loading, setLoading] = React.useState(false);
    const [policyText, setPolicyText] = React.useState("Loading policy...");
    const [showText, setShowText] = React.useState(false);

    // Load text on mount
    React.useEffect(() => {
        const fetchPolicy = async () => {
            try {
                const data = await apiService.getLatestPrivacyPolicy();
                setPolicyText(data.content);
            } catch (e) {
                setPolicyText("Failed to load policy text.");
            }
        };
        fetchPolicy();
    }, []);

    const handleAccept = async () => {
        setLoading(true);
        await onAccept();
        setLoading(false);
    };

    return (
        <div className="modal-overlay" style={{ /* existing styles... */ }}>
            <div className="modal-content" style={{ /* existing styles... */ maxWidth: '600px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📜</div>
                <h2 style={{ color: '#fff', marginBottom: '15px' }}>Policy Update Required</h2>
                
                <p style={{ color: '#ccc', marginBottom: '20px' }}>
                    To continue, please review our latest Privacy Policy.
                </p>

                {/* SCROLLABLE TEXT BOX */}
                <div style={{ 
                    backgroundColor: '#2d2d2d', 
                    padding: '15px', 
                    borderRadius: '4px', 
                    marginBottom: '20px', 
                    textAlign: 'left',
                    height: '200px', // Fixed height
                    overflowY: 'auto', // Scrollable
                    color: '#ddd',
                    whiteSpace: 'pre-wrap', // Preserve formatting
                    border: '1px solid #444'
                }}>
                    {policyText}
                </div>

                <button 
                    onClick={handleAccept} 
                    disabled={loading}
                    className="submit-btn"
                    style={{ width: '100%', backgroundColor: '#6610f2' }}
                >
                    {loading ? 'Processing...' : 'I Have Read & Accept'}
                </button>
            </div>
        </div>
    );
};
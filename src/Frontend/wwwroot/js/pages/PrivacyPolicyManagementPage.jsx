const PrivacyPolicyManagementPage = () => {
  // --- STATE ---
  const [history, setHistory] = React.useState([]);
  const [currentPolicy, setCurrentPolicy] = React.useState(null); // The one currently active
  const [draftContent, setDraftContent] = React.useState('');
  const [viewMode, setViewMode] = React.useState('edit'); // 'edit' | 'preview_history'
  const [selectedHistoryItem, setSelectedHistoryItem] = React.useState(null);
  
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState({ type: '', text: '' });

  // --- LOAD DATA ---
  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [histData, latestData] = await Promise.all([
        apiService.getPrivacyPolicyHistory(),
        apiService.getLatestPrivacyPolicy()
      ]);

      setHistory(histData || []);
      setCurrentPolicy(latestData);
      
      // Pre-fill draft with current content to make editing easier
      if (latestData && latestData.content) {
        setDraftContent(latestData.content);
      }
    } catch (error) {
      console.error("Failed to load privacy data", error);
      setMessage({ type: 'error', text: 'Failed to load policy history.' });
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---
  
  const handlePublish = async (e) => {
    e.preventDefault();
    if (!draftContent.trim()) {
        setMessage({ type: 'error', text: 'Policy content cannot be empty.' });
        return;
    }

    if (!window.confirm("Are you sure? Publishing will create a NEW version and notify users.")) {
        return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
        await apiService.publishPrivacyPolicy(draftContent);
        setMessage({ type: 'success', text: 'New version published successfully!' });
        
        // Refresh data
        await loadData();
        setViewMode('edit'); // Return to edit mode

    } catch (error) {
        console.error(error);
        setMessage({ type: 'error', text: 'Failed to publish policy.' });
    } finally {
        setSubmitting(false);
    }
  };

  const handleViewHistory = (item) => {
    setSelectedHistoryItem(item);
    setViewMode('preview_history');
  };

  const handleBackToEditor = () => {
    setSelectedHistoryItem(null);
    setViewMode('edit');
  };

  // --- RENDER HELPERS ---
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString([], {
        year: 'numeric', month: 'short', day: 'numeric', 
        hour: '2-digit', minute:'2-digit'
    });
  };

  return (
    <div className="page-section">
      <div className="hub-header">
        <h2 className="page-title">GDPR Policy Management</h2>
        <p>Manage, version, and publish the system's Privacy Policy.</p>
      </div>

      {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
        
        {/* --- LEFT COLUMN: HISTORY --- */}
        <div className="card-container" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
            <h3 style={{ borderBottom: '2px solid #6610f2', paddingBottom: '10px', color: '#6610f2' }}>
                📜 Version History
            </h3>
            
            {loading ? <p>Loading history...</p> : (
                <div className="history-list">
                    {history.length === 0 && <p style={{color:'#888'}}>No versions found.</p>}
                    
                    {history.map(item => (
                        <div 
                            key={item._id || item.id} 
                            className={`history-item ${currentPolicy && currentPolicy.version === item.version ? 'active-version' : ''}`}
                            onClick={() => handleViewHistory(item)}
                            style={{
                                padding: '15px',
                                borderBottom: '1px solid #444',
                                cursor: 'pointer',
                                backgroundColor: selectedHistoryItem === item ? 'rgba(102, 16, 242, 0.1)' : 'transparent',
                                transition: '0.2s'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <strong style={{ fontSize: '1.1em', color: '#fff' }}>v{item.version}</strong>
                                {currentPolicy && currentPolicy.version === item.version && (
                                    <span className="status-badge" style={{ backgroundColor: '#28a745' }}>Current</span>
                                )}
                            </div>
                            <div style={{ fontSize: '0.85em', color: '#aaa', marginTop: '5px' }}>
                                📅 {formatDate(item.publishedAt)}
                            </div>
                            <div style={{ fontSize: '0.85em', color: '#666' }}>
                                👤 {item.adminId || 'System'}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* --- RIGHT COLUMN: EDITOR / PREVIEW --- */}
        <div className="card-container">
            {viewMode === 'preview_history' && selectedHistoryItem ? (
                // --- VIEW MODE ---
                <div className="fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0 }}>
                            Previewing <span style={{ color: '#6610f2' }}>v{selectedHistoryItem.version}</span>
                        </h3>
                        <button onClick={handleBackToEditor} className="submit-btn" style={{ width: 'auto', backgroundColor: '#6c757d' }}>
                            ✏️ Back to Editor
                        </button>
                    </div>
                    <div style={{ 
                        backgroundColor: '#fff', 
                        color: '#000', 
                        padding: '20px', 
                        borderRadius: '4px', 
                        height: '500px', 
                        overflowY: 'auto',
                        whiteSpace: 'pre-wrap', // Preserves newlines
                        fontFamily: 'sans-serif'
                    }}>
                        {selectedHistoryItem.content}
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '0.9em', color: '#aaa' }}>
                        Published on {formatDate(selectedHistoryItem.publishedAt)}
                    </div>
                </div>
            ) : (
                // --- EDIT MODE ---
                <div className="fade-in">
                    <h3 style={{ borderBottom: '2px solid #fd7e14', paddingBottom: '10px', color: '#fd7e14' }}>
                        ✏️ Draft New Version
                    </h3>
                    <p style={{ fontSize: '0.9em', color: '#ccc' }}>
                        Modifying the text below and clicking "Publish" will create 
                        <strong> v{currentPolicy ? (parseFloat(currentPolicy.version) + 0.1).toFixed(1) : '1.0'}</strong>.
                    </p>

                    <form onSubmit={handlePublish}>
                        <div className="form-group full-width">
                            <textarea
                                value={draftContent}
                                onChange={(e) => setDraftContent(e.target.value)}
                                className="form-input"
                                rows="20"
                                placeholder="Enter the full legal text here..."
                                style={{ 
                                    fontFamily: 'Consolas, Monaco, monospace', 
                                    lineHeight: '1.5',
                                    backgroundColor: '#1e1e1e',
                                    color: '#d4d4d4',
                                    border: '1px solid #444'
                                }}
                            />
                        </div>
                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="submit-btn" 
                                disabled={submitting} 
                                style={{ backgroundColor: '#fd7e14' }}
                            >
                                {submitting ? 'Publishing...' : '🚀 Publish New Version'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};
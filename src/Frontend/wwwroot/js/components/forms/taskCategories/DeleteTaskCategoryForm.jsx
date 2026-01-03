const DeleteTaskCategoryForm = ({ onSuccess }) => {
    // --- STATE ---
    const [searchId, setSearchId] = React.useState('');
    const [data, setData] = React.useState(null);
    const [step, setStep] = React.useState('search'); // 'search' | 'confirm'
    
    const [confirmText, setConfirmText] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // --- HANDLERS ---

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchId.trim()) return;

        setLoading(true);
        setMessage({ type: '', text: '' });
        setData(null);

        try {
            const res = await apiService.getCategoryById(searchId.trim());
            if (res) {
                setData(res);
                setStep('confirm');
                setMessage({ type: 'info', text: 'Category found. Review details below.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Category not found.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();

        // Safety Check
        if (confirmText !== data.code) {
            setMessage({ type: 'error', text: `Confirmation code mismatch. Please type "${data.code}".` });
            return;
        }

        setLoading(true);
        try {
            await apiService.deleteCategory(data.id);
            setMessage({ type: 'success', text: 'Category deleted successfully.' });
            
            if (onSuccess) onSuccess();

            // Reset after delay
            setTimeout(() => {
                setStep('search');
                setSearchId('');
                setData(null);
                setConfirmText('');
                setMessage({ type: '', text: '' });
            }, 2000);

        } catch (err) {
            console.error(err);
            const serverMsg = err.response?.data || 'Delete failed.';
            setMessage({ type: 'error', text: serverMsg });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setStep('search');
        setData(null);
        setConfirmText('');
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container" style={{ borderColor: '#dc3545' }}>
            <div className="form-header">
                <h4 style={{ color: '#dc3545' }}>Delete Category</h4>
                <p>Permanently remove a definition from the catalog.</p>
            </div>

            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-group">
                        <label>Category ID <span className="required">*</span></label>
                        <input 
                            type="text" 
                            value={searchId} 
                            onChange={(e) => setSearchId(e.target.value)} 
                            className="form-input" 
                            placeholder="e.g. 64b..." 
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? 'Searching...' : '🔍 Find Category'}
                        </button>
                    </div>
                </form>
            )}

            {step === 'confirm' && data && (
                <div className="fade-in">
                    
                    {/* Details Card */}
                    <div className="delete-details-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <span className="delete-details-label">Category Name:</span><br/>
                                <strong style={{ fontSize: '1.1em' }}>{data.name}</strong>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span className="delete-details-label">Code:</span><br/>
                                <strong className="monospace-input">{data.code}</strong>
                            </div>
                        </div>
                        <div style={{ marginTop: '10px' }}>
                            <span className="delete-details-label">Impact:</span>
                            <span style={{ marginLeft: '8px', color: data.expectedImpact === 'Suspension' ? '#dc3545' : '#28a745', fontWeight: 'bold' }}>
                                {data.expectedImpact}
                            </span>
                        </div>
                    </div>

                    {/* Warning Card */}
                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ Irreversible Action</span>
                        <p className="delete-warning-desc">
                            This will remove the category from the system. It may affect historical reports if not handled carefully.
                        </p>
                        
                        <form onSubmit={handleDelete} className="delete-form">
                            <div className="form-group">
                                <label htmlFor="confirmCode" style={{ color: '#fff', fontWeight: 500 }}>
                                    To confirm, type the code <strong>{data.code}</strong> below:
                                </label>
                                <input
                                    id="confirmCode"
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder={data.code}
                                    className="delete-confirm-input"
                                    autoComplete="off"
                                    required
                                />
                            </div>

                            <div className="form-actions" style={{ display: 'flex', gap: '10px' }}>
                                <button 
                                    type="submit" 
                                    className="btn-danger-primary" 
                                    disabled={loading || confirmText !== data.code}
                                    style={{ flex: 1 }}
                                >
                                    {loading ? 'Deleting...' : '🗑️ Delete Permanently'}
                                </button>
                                <button 
                                    type="button" 
                                    className="delete-cancel-btn" 
                                    onClick={handleCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
const DeleteIncidentTypeForm = ({ onSuccess }) => {
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [incidentType, setIncidentType] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    
    const [step, setStep] = React.useState('search'); 
    const [confirmationText, setConfirmationText] = React.useState('');

    const handleSearchInputChange = (e) => {
        setSearchData({ id: e.target.value });
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleConfirmationInputChange = (e) => {
        setConfirmationText(e.target.value);
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: 'Incident Type ID is required.' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setIncidentType(null);

        try {
            const data = await apiService.getIncidentTypeById(searchData.id.trim());
            
            if (data) {
                setIncidentType(data);
                setStep('confirm');
                setMessage({ type: 'info', text: 'Incident Type found. Please confirm deletion below.' });
            }
        } catch (error) {
            console.error('Error fetching type:', error);
            
            // Use Controller Message
            const serverMsg = error.response && error.response.data 
                ? error.response.data 
                : (error.message || 'Failed to retrieve Incident Type.');

            setMessage({ type: 'error', text: serverMsg });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();

        if (confirmationText !== incidentType.code) {
            setMessage({ 
                type: 'error', 
                text: 'Confirmation text does not match the Incident Type Code.' 
            });
            return;
        }

        setIsDeleting(true);
        setMessage({ type: '', text: '' });

        try {
            await apiService.deleteIncidentType(incidentType.id);

            setMessage({ 
                type: 'success', 
                text: `✅ Incident Type "${incidentType.code}" deleted successfully.`
            });

            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);

        } catch (error) {
            console.error('Error deleting type:', error);
            
            // Use Controller Message
            const serverMsg = error.response && error.response.data 
                ? error.response.data 
                : (error.message || 'Failed to delete Incident Type.');

            setMessage({ type: 'error', text: serverMsg });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setIncidentType(null);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const handleNewSearch = () => {
        if (message.type === 'success') setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    return (
        <div className="form-container" style={{ borderColor: '#dc3545' }}>
            <div className="form-header">
                <h4 style={{ color: '#dc3545' }}>Delete Incident Type</h4>
                <p>Permanently remove a type definition from the catalog.</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-group">
                        <label htmlFor="searchId">Incident Type ID <span className="required">*</span></label>
                        <input
                            type="text"
                            id="searchId"
                            value={searchData.id}
                            onChange={handleSearchInputChange}
                            placeholder="e.g., 64b..."
                            className="form-input"
                        />
                        <small className="form-help">Enter the system ID of the type to delete.</small>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? 'Searching...' : '🔍 Find Type'}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                             Cancel
                        </button>
                    </div>
                </form>
            )}

            {step === 'confirm' && incidentType && (
                <div className="fade-in">
                    <div className="delete-form-header">
                        <span>⚠️ Confirm Deletion</span>
                        <button type="button" className="link-btn" onClick={handleNewSearch}>
                            <span style={{ marginRight: '4px' }}>🔍</span> Search Different ID
                        </button>
                    </div>

                    <div className="delete-details-card">
                        <span className="delete-details-card-title">⚠️ You are about to delete:</span>
                        <div className="delete-details-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="delete-details-field">
                                <span className="delete-details-label">Code:</span><br />
                                <span style={{ fontFamily: 'monospace', fontSize: '1.1em', fontWeight: 'bold' }}>{incidentType.code}</span>
                            </div>
                            <div className="delete-details-field">
                                <span className="delete-details-label">Name:</span><br />
                                {incidentType.name}
                            </div>
                            <div className="delete-details-field">
                                <span className="delete-details-label">Severity:</span><br />
                                <span className={`status-badge status-${(incidentType.severity || 'minor').toLowerCase()}`}>
                                    {incidentType.severity}
                                </span>
                            </div>
                            <div className="delete-details-field">
                                <span className="delete-details-label">Description:</span><br />
                                {incidentType.description || '-'}
                            </div>
                        </div>
                    </div>

                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ Warning: Irreversible Action</span>
                        <span className="delete-warning-desc">
                            This action cannot be undone. This Incident Type will be removed from the catalog.
                        </span>
                        
                        <form onSubmit={handleDelete} className="delete-form">
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label htmlFor="confirmationText" style={{ color: '#fff', fontWeight: 500 }}>
                                    To confirm, type the Code <strong>{incidentType.code}</strong> below:
                                </label>
                                <input
                                    type="text"
                                    id="confirmationText"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    placeholder={incidentType.code}
                                    className="delete-confirm-input"
                                    autoComplete="off"
                                    required
                                />
                                <small className="delete-confirm-help">Verification is case-sensitive.</small>
                            </div>

                            <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
                                <button 
                                    type="submit" 
                                    className="delete-btn" 
                                    disabled={isDeleting || confirmationText !== incidentType.code}
                                >
                                    {isDeleting ? 'Deleting...' : '🗑️ Delete Permanently'}
                                </button>
                                <button type="button" className="delete-cancel-btn" onClick={handleClear} disabled={isDeleting}>
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
const DeleteIncidentForm = ({ onSuccess }) => {
    // --- STATE ---
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [incident, setIncident] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    
    // Steps: 'search' -> 'confirm'
    const [step, setStep] = React.useState('search'); 
    const [confirmationText, setConfirmationText] = React.useState('');

    // --- HELPER: Determine the Safety Code ---
    // Use the Incident Type Code (e.g., "FOG-01") or fallback to "DELETE" if type is missing
    const getSafetyCode = () => {
        if (incident && incident.type && incident.type.code) {
            return incident.type.code;
        }
        return 'DELETE';
    };

    // --- HANDLERS ---

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: 'Incident ID is required.' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setIncident(null);

        try {
            const data = await apiService.getIncidentById(searchData.id.trim());
            
            if (data) {
                setIncident(data);
                setStep('confirm');
                setMessage({ type: 'info', text: 'Incident found. Review details below.' });
            }
        } catch (error) {
            console.error('Error fetching incident:', error);
            
            // Use Controller Message
            const serverMsg = error.response && error.response.data 
                ? error.response.data 
                : (error.message || 'Failed to retrieve Incident.');

            setMessage({ type: 'error', text: serverMsg });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();

        const targetCode = getSafetyCode();

        // Safety Check: User must type the specific Code
        if (confirmationText !== targetCode) {
            setMessage({ 
                type: 'error', 
                text: `Confirmation text does not match. Please type "${targetCode}".` 
            });
            return;
        }

        setIsDeleting(true);
        setMessage({ type: '', text: '' });

        try {
            await apiService.deleteIncident(incident.id);

            setMessage({ 
                type: 'success', 
                text: `✅ Incident deleted successfully.`
            });

            // Reset after delay
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);

        } catch (error) {
            console.error('Error deleting incident:', error);
            
            const serverMsg = error.response && error.response.data 
                ? error.response.data 
                : (error.message || 'Failed to delete Incident.');

            setMessage({ type: 'error', text: serverMsg });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setIncident(null);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    return (
        <div className="form-container" style={{ borderColor: '#dc3545' }}>
            <div className="form-header">
                <h4 style={{ color: '#dc3545' }}>Delete Incident Record</h4>
                <p>Permanently remove an incident log from the system.</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* STEP 1: SEARCH */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-group">
                        <label>Incident ID <span className="required">*</span></label>
                        <input
                            type="text"
                            value={searchData.id}
                            onChange={(e) => setSearchData({ id: e.target.value })}
                            placeholder="e.g. 64b..."
                            className="form-input"
                        />
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? 'Searching...' : '🔍 Find Incident'}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                             Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* STEP 2: CONFIRM */}
            {step === 'confirm' && incident && (
                <div className="fade-in">
                    
                    {/* DETAILS CARD */}
                    <div className="delete-details-card">
                        <span className="delete-details-card-title">⚠️ You are about to delete:</span>
                        <div className="delete-details-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="delete-details-field">
                                <span className="delete-details-label">Type Code:</span><br />
                                {/* Displaying the Code clearly so the user knows what to type */}
                                <strong className="monospace-input" style={{ fontSize: '1.2em' }}>
                                    {incident.type ? incident.type.code : 'UNKNOWN'}
                                </strong>
                            </div>
                            <div className="delete-details-field">
                                <span className="delete-details-label">Status:</span><br />
                                <span className="status-badge" style={{ backgroundColor: incident.status === 'Resolved' ? '#28a745' : '#dc3545' }}>
                                    {incident.status}
                                </span>
                            </div>
                            <div className="delete-details-field">
                                <span className="delete-details-label">Date:</span><br />
                                {new Date(incident.startTime).toLocaleDateString()}
                            </div>
                            <div className="delete-details-field">
                                <span className="delete-details-label">Description:</span><br />
                                <span style={{fontSize: '0.85em'}}>{incident.description || '-'}</span>
                            </div>
                        </div>
                    </div>

                    {/* WARNING & INPUT CARD */}
                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ Warning: Irreversible Action</span>
                        <span className="delete-warning-desc">
                            This action cannot be undone. The record will be permanently removed from history.
                        </span>
                        
                        <form onSubmit={handleDelete} className="delete-form">
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label htmlFor="confirmationText" style={{ color: '#fff', fontWeight: 500 }}>
                                    To confirm, type the code <strong>{getSafetyCode()}</strong> below:
                                </label>
                                <input
                                    type="text"
                                    value={confirmationText}
                                    onChange={(e) => setConfirmationText(e.target.value)}
                                    placeholder={getSafetyCode()}
                                    className="delete-confirm-input"
                                    autoComplete="off"
                                    required
                                />
                            </div>

                            <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
                                <button 
                                    type="submit" 
                                    className="btn-danger-primary" 
                                    disabled={isDeleting || confirmationText !== getSafetyCode()}
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
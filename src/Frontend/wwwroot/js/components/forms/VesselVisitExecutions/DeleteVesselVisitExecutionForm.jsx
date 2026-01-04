console.log('DeleteVesselVisitExecutionForm component loading...');

const DeleteVesselVisitExecutionForm = ({ onSuccess }) => {
    // State management
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [execution, setExecution] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    
    // Steps: 'search' -> 'confirm'
    const [step, setStep] = React.useState('search'); 
    const [confirmationText, setConfirmationText] = React.useState('');

    // --- Formatters ---
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const isValidGuid = (guid) => 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(guid);

    // --- Handlers ---

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
        
        // Validation
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: 'Execution ID is required.' });
            return;
        }
        if (!isValidGuid(searchData.id.trim())) {
            setMessage({ type: 'error', text: 'Invalid ID format (GUID required).' });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setExecution(null);

        try {
            const data = await apiService.getVesselVisitExecutionById(searchData.id.trim());
            
            if (data) {
                setExecution(data);
                setStep('confirm');
                setMessage({ type: 'info', text: 'Execution found. Please confirm deletion below.' });
            } else {
                setMessage({ type: 'error', text: 'No execution found with this ID.' });
            }
        } catch (error) {
            console.error('Error fetching execution:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to retrieve execution.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();

        // Validate Confirmation (Must match Vessel IMO)
        if (confirmationText !== execution.vesselIMO) {
            setMessage({ 
                type: 'error', 
                text: 'Confirmation text does not match the Vessel IMO.' 
            });
            return;
        }

        setIsDeleting(true);
        setMessage({ type: '', text: '' });

        try {
            await apiService.deleteVesselVisitExecution(execution.id);

            setMessage({ 
                type: 'success', 
                text: `✅ Execution for vessel ${execution.vesselIMO} deleted successfully.`
            });

            // Reset form after delay
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);

        } catch (error) {
            console.error('Error deleting execution:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to delete execution.' 
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setExecution(null);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const handleNewSearch = () => {
        // Keep message if it was an error, otherwise clear
        if (message.type === 'success') setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
        // Keep the input ID so user can edit it
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Delete Execution</h4>
                <p>Permanently remove a Vessel Visit Execution record.</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* STEP 1: SEARCH */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchId">Execution ID <span className="required">*</span></label>
                            <input
                                type="text"
                                id="searchId"
                                value={searchData.id}
                                onChange={handleSearchInputChange}
                                placeholder="e.g., a1b2c3d4-..."
                                className="form-input"
                            />
                            <small className="form-help">Enter the GUID of the execution you want to delete.</small>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="submit-btn" 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <><span className="loading-spinner"></span> Loading...</>
                            ) : (
                                <><span>🔍</span> Find Execution</>
                            )}
                        </button>
                        <button 
                            type="button" 
                            className="clear-btn" 
                            onClick={handleClear}
                            disabled={isLoading}
                        >
                            <span>🧹</span> Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* STEP 2: CONFIRMATION */}
            {step === 'confirm' && execution && (
                <>
                    <div className="delete-form-header">
                        <span>⚠️ Confirm Deletion</span>
                        <button 
                            type="button" 
                            className="link-btn" 
                            onClick={handleNewSearch}
                        >
                            <span style={{ marginRight: '4px' }}>🔍</span> Search Different ID
                        </button>
                    </div>

                    {/* DETAILS CARD */}
                    <div className="delete-details-card">
                        <span className="delete-details-card-title">⚠️ You are about to delete:</span>
                        <div className="delete-details-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <div className="delete-details-field">
                                <span className="delete-details-label">ID:</span><br />
                                <span style={{ fontFamily: 'monospace', fontSize: '0.9em' }}>{execution.id}</span>
                            </div>
                            <div className="delete-details-field">
                                <span className="delete-details-label">Vessel IMO:</span><br />
                                {execution.vesselIMO}
                            </div>
                            <div className="delete-details-field">
                                <span className="delete-details-label">Status:</span><br />
                                {execution.status}
                            </div>
                            <div className="delete-details-field">
                                <span className="delete-details-label">Arrival:</span><br />
                                {formatDate(execution.actualArrivalTime)}
                            </div>
                        </div>
                    </div>

                    {/* WARNING & INPUT CARD */}
                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ Warning: Irreversible Action</span>
                        <span className="delete-warning-desc">
                            This action cannot be undone. The execution record and all associated history will be permanently removed.
                        </span>
                        
                        <form onSubmit={handleDelete} className="delete-form">
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label htmlFor="confirmationText" style={{ color: '#fff', fontWeight: 500 }}>
                                    To confirm, type the Vessel IMO <strong>{execution.vesselIMO}</strong> below:
                                </label>
                                <input
                                    type="text"
                                    id="confirmationText"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    placeholder={execution.vesselIMO}
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
                                    disabled={isDeleting || confirmationText !== execution.vesselIMO}
                                >
                                    {isDeleting ? (
                                        <><span className="loading-spinner"></span> Deleting...</>
                                    ) : (
                                        <>🗑️ Delete Permanently</>
                                    )}
                                </button>
                                <button 
                                    type="button" 
                                    className="delete-cancel-btn" 
                                    onClick={handleClear}
                                    disabled={isDeleting}
                                >
                                    <span>🧹</span> Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};
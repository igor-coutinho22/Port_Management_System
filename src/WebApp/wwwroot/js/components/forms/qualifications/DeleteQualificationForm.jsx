// Delete Qualification Form Component
console.log('🗑️ DeleteQualificationForm component loading...');

const DeleteQualificationForm = ({ onSuccess }) => {
    const [searchData, setSearchData] = React.useState({ code: '' });
    const [qualification, setQualification] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search'); // 'search' or 'confirm'
    const [confirmationText, setConfirmationText] = React.useState('');

    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleConfirmationInputChange = (e) => {
        setConfirmationText(e.target.value);
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchData.code.trim()) {
            setMessage({ type: 'error', text: 'Qualification code is required' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setQualification(null);
        try {
            const data = await apiService.getQualificationByCode(searchData.code.trim());
            if (data) {
                // Add the code to the qualification data if not present
                const qualificationWithCode = { ...data, code: searchData.code.trim() };
                setQualification(qualificationWithCode);
                setHasSearched(true);
                setStep('confirm');
                setMessage({ type: 'info', text: 'Qualification found. Please confirm deletion below.' });
            } else {
                setQualification(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'Qualification not found with the provided code' });
            }
        } catch (error) {
            console.error('Error fetching qualification:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: 'Qualification not found with the provided code' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch qualification. Please try again.' });
            }
            setQualification(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        if (confirmationText !== qualification.name) {
            setMessage({ type: 'error', text: 'Qualification name does not match. Please type the exact qualification name to confirm deletion.' });
            return;
        }
        setIsDeleting(true);
        setMessage({ type: '', text: '' });
        try {
            await apiService.deleteQualification(qualification.code);
            setMessage({ type: 'success', text: `Qualification "${qualification.name}" has been successfully deleted.` });
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (error) {
            console.error('Error deleting qualification:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to delete qualification' });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClear = () => {
        setSearchData({ code: '' });
        setQualification(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const handleNewSearch = () => {
        setSearchData({ code: '' });
        setQualification(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Delete Qualification</h4>
                <p>Search for a qualification by code and confirm deletion</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {/* Step 1: Search for Qualification */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchCode">Qualification Code</label>
                            <input
                                type="text"
                                id="searchCode"
                                name="code"
                                value={searchData.code}
                                onChange={handleSearchInputChange}
                                placeholder="Enter qualification code (e.g., Q-001)"
                                className="form-input"
                            />
                            <small className="form-help">Enter the unique code of the qualification you want to delete</small>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>Loading...</>) : (<>Search Qualification</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>Cancel
                        </button>
                    </div>
                </form>
            )}
            {/* Step 2: Confirm Deletion */}
            {step === 'confirm' && qualification && (
                <>
                    <div className="delete-form-header">
                        <span>⚠️ Confirm deletion of qualification: {qualification.name} <span style={{ fontWeight: 400 }}>(Code: {qualification.code})</span></span>
                        <button type="button" className="link-btn" onClick={handleNewSearch}><span style={{ marginRight: '4px' }}>🔍</span>Search different qualification</button>
                    </div>
                    <div className="delete-details-card">
                        <span className="delete-details-card-title">⚠️ Qualification to be deleted:</span>
                        <div className="delete-details-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <div className="delete-details-field"><span className="delete-details-label">CODE:</span><br />{qualification.code}</div>
                            <div className="delete-details-field"><span className="delete-details-label">NAME:</span><br />{qualification.name}</div>
                        </div>
                    </div>
                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ Warning: This action cannot be undone</span>
                        <span className="delete-warning-desc">Deleting this qualification will permanently remove it from the system. All associated data will be lost.</span>
                        <form onSubmit={handleDelete} className="delete-form">
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label htmlFor="confirmName" style={{ color: '#fff', fontWeight: 500 }}>Type "{qualification.name}" to confirm deletion:</label>
                                <input
                                    type="text"
                                    id="confirmName"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    className="delete-confirm-input"
                                    required
                                />
                                <small className="delete-confirm-help">This confirmation helps prevent accidental deletions</small>
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
                                <button type="submit" className="delete-btn" disabled={isDeleting || confirmationText !== qualification.name}>
                                    {isDeleting ? (<><span className="loading-spinner"></span>Deleting...</>) : (<>Delete Qualification</>)}
                                </button>
                                <button type="button" className="delete-cancel-btn" onClick={handleClear} disabled={isDeleting}>
                                    <span role="img" aria-label="cancel">🧹</span>Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

console.log('DeleteQualificationForm component loaded! 🗑️');

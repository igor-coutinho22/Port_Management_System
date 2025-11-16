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
                    <div className="form-section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(90deg, #1976d2 60%, #2196f3 100%)', color: 'white', borderRadius: '8px', padding: '12px 18px', marginBottom: '18px' }}>
                        <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Confirm deletion of qualification: {qualification.name} <span style={{ fontWeight: 400 }}>(Code: {qualification.code})</span></span>
                        <button type="button" className="link-btn" onClick={handleNewSearch} style={{ color: 'white', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
                            <span role="img" aria-label="search">🔍</span> Search different qualification
                        </button>
                    </div>
                    <div style={{ background: '#2d2323', border: '2px solid #ffa726', borderRadius: '12px', padding: '18px', marginBottom: '24px' }}>
                        <div style={{ color: '#ffa726', fontWeight: 700, fontSize: '1.1rem', marginBottom: '12px' }}>⚠️ Qualification to be deleted:</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '12px' }}>
                            <div style={{ background: '#232b39', borderRadius: '8px', padding: '12px' }}>
                                <div style={{ color: '#ffa726', fontWeight: 600, fontSize: '0.95rem' }}>CODE:</div>
                                <div style={{ color: 'white', fontWeight: 600 }}>{qualification.code}</div>
                            </div>
                            <div style={{ background: '#232b39', borderRadius: '8px', padding: '12px' }}>
                                <div style={{ color: '#ffa726', fontWeight: 600, fontSize: '0.95rem' }}>NAME:</div>
                                <div style={{ color: 'white', fontWeight: 600 }}>{qualification.name}</div>
                            </div>
                        </div>
                    </div>
                    <div style={{ background: '#232b39', border: '2px solid #ff5252', borderRadius: '12px', padding: '18px', marginBottom: '24px' }}>
                        <div style={{ color: '#ff5252', fontWeight: 700, fontSize: '1.1rem', marginBottom: '12px' }}>⚠️ Warning: This action cannot be undone</div>
                        <div style={{ color: 'white', marginBottom: '12px' }}>Deleting this qualification will permanently remove it from the system. All associated data will be lost.</div>
                        <form onSubmit={handleDelete} className="qualification-form">
                            <div className="form-group">
                                <label htmlFor="confirmName" style={{ color: 'white', fontWeight: 600 }}>Type "{qualification.name}" to confirm deletion:</label>
                                <input
                                    type="text"
                                    id="confirmName"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    className="form-input"
                                    required
                                    style={{ marginTop: '8px', background: '#232b39', color: 'white', border: '1px solid #ff5252', borderRadius: '8px', fontWeight: 600 }}
                                />
                                <small className="form-help" style={{ color: '#ff5252', fontWeight: 500 }}>This confirmation helps prevent accidental deletions</small>
                            </div>
                            <div className="form-actions" style={{ marginTop: '18px' }}>
                                <button type="submit" className="delete-btn" disabled={isDeleting} style={{ background: '#ff5252', color: 'white', fontWeight: 700, borderRadius: '8px', padding: '10px 24px', border: 'none' }}>
                                    {isDeleting ? (<><span className="loading-spinner"></span>Deleting...</>) : (<>Delete Qualification</>)}
                                </button>
                                <button type="button" className="clear-btn" onClick={handleClear} disabled={isDeleting} style={{ marginLeft: '12px', background: '#232b39', color: 'white', borderRadius: '8px', padding: '10px 24px', border: '1px solid #fff' }}>
                                    <span>🧹</span>Cancel
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

// Delete Staff Form Component
console.log('DeleteStaffForm component loading...');

const DeleteStaffForm = ({ onSuccess }) => {
    const [searchData, setSearchData] = React.useState({
        mecanographicNumber: ''
    });
    const [staff, setStaff] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search'); // 'search' or 'confirm'
    const [confirmationText, setConfirmationText] = React.useState('');

    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleConfirmationInputChange = (e) => {
        setConfirmationText(e.target.value);
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchData.mecanographicNumber.trim()) {
            setMessage({ type: 'error', text: 'Mecanographic number is required' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setStaff(null);
        try {
            const data = await apiService.getStaffById(searchData.mecanographicNumber.trim());
            if (data) {
                setStaff(data);
                setHasSearched(true);
                setStep('confirm');
                setMessage({ type: 'info', text: 'Staff found successfully. Please confirm deletion below.' });
            } else {
                setStaff(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'Staff not found with the provided number' });
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: 'Staff not found with the provided number' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch staff. Please try again.' });
            }
            setStaff(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        if (confirmationText !== staff.shortName) {
            setMessage({
                type: 'error',
                text: 'Staff name does not match. Please type the exact staff name to confirm deletion.'
            });
            return;
        }
        setIsDeleting(true);
        setMessage({ type: '', text: '' });
        try {
            await apiService.deleteStaff(staff.mecanographicNumber);
            setMessage({
                type: 'success',
                text: `Staff "${staff.shortName}" has been successfully deleted.`
            });
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (error) {
            console.error('Error deleting staff:', error);
            setMessage({
                type: 'error',
                text: error.message || 'Failed to delete staff. Please try again.'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClear = () => {
        setSearchData({ mecanographicNumber: '' });
        setStaff(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const handleNewSearch = () => {
        setSearchData({ mecanographicNumber: '' });
        setStaff(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Delete Staff</h4>
                <p>Search for a staff member by mecanographic number and permanently delete them from the system</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {/* Step 1: Search for Staff */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchMecanographicNumber">Mecanographic Number</label>
                            <input
                                type="text"
                                id="searchMecanographicNumber"
                                name="mecanographicNumber"
                                value={searchData.mecanographicNumber}
                                onChange={handleSearchInputChange}
                                placeholder="Enter staff number (e.g., S12345)"
                                className="form-input"
                            />
                            <small className="form-help">Enter the unique number of the staff you want to delete</small>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (<><span className="loading-spinner"></span>Loading...</>) : (<>Search Staff</>)}
                        </button>
                        <button
                            type="button"
                            className="clear-btn"
                            onClick={handleClear}
                            disabled={isLoading}
                        >
                            <span>🧹</span>
                            Cancel
                        </button>
                    </div>
                </form>
            )}
            {/* Step 2: Confirm Deletion */}
            {step === 'confirm' && staff && (
                <>
                    <div className="delete-form-header">
                        <span>⚠️ Confirm Staff Deletion</span>
                        <button
                            type="button"
                            className="link-btn"
                            onClick={handleNewSearch}
                        >
                            <span style={{ marginRight: '4px' }}>🔍</span>Search different staff
                        </button>
                    </div>
                    <div className="delete-details-card">
                        <span className="delete-details-card-title">⚠️ Staff to be deleted:</span>
                        <div className="delete-details-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                            <div className="delete-details-field"><span className="delete-details-label">MEC NUMBER:</span><br />{staff.mecanographicNumber}</div>
                            <div className="delete-details-field"><span className="delete-details-label">NAME:</span><br />{staff.shortName}</div>
                            <div className="delete-details-field"><span className="delete-details-label">EMAIL:</span><br />{staff.email}</div>
                            <div className="delete-details-field"><span className="delete-details-label">PHONE:</span><br />{staff.phone}</div>
                            <div className="delete-details-field"><span className="delete-details-label">STATUS:</span><br />{staff.status}</div>
                            <div className="delete-details-field"><span className="delete-details-label">OPERATIONAL WINDOW:</span><br />{staff.operationalWindow}</div>
                        </div>
                    </div>
                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ Warning: This action cannot be undone</span>
                        <span className="delete-warning-desc">Deleting this staff member will permanently remove them from the system. All associated data will be lost.</span>
                        <form onSubmit={handleDelete} className="delete-form">
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label htmlFor="confirmDelete" style={{ color: '#fff', fontWeight: 500 }}>Type the staff name to confirm deletion:</label>
                                <input
                                    type="text"
                                    id="confirmDelete"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    placeholder={`Type "${staff.shortName}" to confirm`}
                                    className="delete-confirm-input"
                                    autoComplete="off"
                                />
                                <small className="delete-confirm-help">This confirmation helps prevent accidental deletions</small>
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
                                <button
                                    type="submit"
                                    className="delete-btn"
                                    disabled={isDeleting || confirmationText !== staff.shortName}
                                >
                                    {isDeleting ? (<><span className="loading-spinner"></span>Deleting...</>) : (<>Delete Staff</>)}
                                </button>
                                <button
                                    type="button"
                                    className="delete-cancel-btn"
                                    onClick={handleClear}
                                    disabled={isDeleting}
                                >
                                    <span role="img" aria-label="cancel">🧹</span>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

console.log('DeleteStaffForm component loaded!');

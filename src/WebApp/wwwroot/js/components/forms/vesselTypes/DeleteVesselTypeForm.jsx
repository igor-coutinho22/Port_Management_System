// Delete Vessel Type Form Component
console.log('🗑️ DeleteVesselTypeForm component loading...');

const DeleteVesselTypeForm = ({ onSuccess }) => {
    const [searchData, setSearchData] = React.useState({
        name: ''
    });
    const [vesselType, setVesselType] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // Helper to get color for message type
    const getMessageColor = (type) => {
        if (type === 'error') return 'red';
        if (type === 'success') return 'green';
        if (type === 'info') return '#0074D9'; // blue
        return 'inherit';
    };
    const [step, setStep] = React.useState('search'); // 'search' or 'confirm'
    const [confirmationText, setConfirmationText] = React.useState('');

    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user starts typing
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleConfirmationInputChange = (e) => {
        setConfirmationText(e.target.value);
        // Clear messages when user starts typing
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        // Validate name field
        if (!searchData.name.trim()) {
            setMessage({ type: 'error', text: 'Name is required' });
            return;
        }
        
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setVesselType(null);
        
        try {
            const data = await apiService.getVesselTypeByName(searchData.name.trim());
            if (data) {
                setVesselType(data);
                setHasSearched(true);
                setStep('confirm');
                setMessage({ type: 'info', text: 'Vessel type found successfully' });
            } else {
                setVesselType(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'No vessel type found with this name' });
            }
        } catch (error) {
            console.error('Error fetching vessel type:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: 'No vessel type found with this name' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch vessel type' });
            }
            setVesselType(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        
        // Validate confirmation text
        if (confirmationText !== vesselType.name) {
            setMessage({ 
                type: 'error', 
                text: 'Confirmation text does not match the vessel type name' 
            });
            return;
        }
        
        setIsDeleting(true);
        setMessage({ type: '', text: '' });

        try {
            // Delete vessel type
            await apiService.deleteVesselType(vesselType.name);
            
            setMessage({ 
                type: 'success', 
                text: `Vessel type "${vesselType.name}" has been successfully deleted` 
            });
            
            // Reset form after successful deletion
            setTimeout(() => {
                handleClear();
                // Notify parent component
                if (onSuccess) onSuccess();
            }, 2000);

        } catch (error) {
            console.error('Error deleting vessel type:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to delete vessel type' 
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClear = () => {
        setSearchData({ name: '' });
        setVesselType(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const handleNewSearch = () => {
        setSearchData({ name: '' });
        setVesselType(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    // Calculate TEU capacity for display
    const calculateTEUCapacity = (vesselType) => {
        if (!vesselType) return 0;
        return vesselType.maxBays * vesselType.maxRows * vesselType.maxTiers;
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Delete Vessel Type</h4>
                <p>Remove a vessel type from the system. This action cannot be undone.</p>
            </div>

                {message.text && (
                    <div className={`message ${message.type}`} style={{ color: getMessageColor(message.type) }}>{message.text}</div>
                )}

            {/* Step 1: Search for Vessel Type */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchName">Vessel Type Name</label>
                            <input
                                type="text"
                                id="searchName"
                                name="name"
                                value={searchData.name}
                                onChange={handleSearchInputChange}
                                placeholder="e.g., Container Ship Large"
                                className="form-input"
                            />
                            <small className="form-help">Enter the exact name of the vessel type to delete</small>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <span>🔍</span>
                                    Search Vessel Type
                                </>
                            )}
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

            {/* Step 2: Delete Confirmation */}
            {step === 'confirm' && vesselType && (
                <>
                    <div className="form-section-header">
                        <h5>⚠️ Confirm Deletion</h5>
                        <button 
                            type="button" 
                            className="link-btn"
                            onClick={handleNewSearch}
                        >
                            🔍 Search Different Vessel Type
                        </button>
                    </div>

                    {/* Vessel Type Details */}
                    <div className="delete-vessel-info">
                        <h6>Vessel Type to Delete:</h6>
                        <div className="vessel-summary">
                            <div className="summary-item">
                                <strong>Name:</strong> {vesselType.name}
                            </div>
                            <div className="summary-item">
                                <strong>Description:</strong> {vesselType.description}
                            </div>
                            <div className="summary-item">
                                <strong>Dimensions:</strong> {vesselType.maxBays}m × {vesselType.maxRows}m × {vesselType.maxTiers}m
                            </div>
                            <div className="summary-item">
                                <strong>TEU Capacity:</strong> {calculateTEUCapacity(vesselType)} TEU
                            </div>
                        </div>
                    </div>

                    {/* Confirmation Form */}
                    <form onSubmit={handleDelete} className="delete-form">
                        <div className="danger-zone">
                            <div className="danger-header">
                                <h6>⚠️ Warning: Permanent Action</h6>
                                <p>This action will permanently delete the vessel type and cannot be undone. Any vessels using this type may be affected.</p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmationText">
                                    Type "<strong>{vesselType.name}</strong>" to confirm deletion:
                                </label>
                                <input
                                    type="text"
                                    id="confirmationText"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    placeholder={vesselType.name}
                                    className="form-input danger-input"
                                    required
                                />
                                <small className="form-help danger-help">
                                    This confirmation is required to prevent accidental deletions
                                </small>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="delete-btn"
                                disabled={isDeleting || confirmationText !== vesselType.name}
                            >
                                {isDeleting ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <span>🗑️</span>
                                        Delete Vessel Type
                                    </>
                                )}
                            </button>

                            <button 
                                type="button" 
                                className="clear-btn"
                                onClick={handleClear}
                                disabled={isDeleting}
                            >
                                <span>🧹</span>
                                Cancel
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

console.log('DeleteVesselTypeForm component loaded! 🗑️');
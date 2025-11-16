// Delete Resource Form Component
console.log('🗑️ DeleteResourceForm component loading...');

const DeleteResourceForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        id: ''
    });
    const [resource, setResource] = React.useState(null);
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
        
        // Validate resource ID field
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: 'Resource ID is required' });
            return;
        }
        
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setResource(null);
        
        try {
            const data = await apiService.getResourceById(searchData.id.trim());
            if (data) {
                setResource(data);
                setHasSearched(true);
                setStep('confirm');
                setMessage({ type: 'info', text: 'Resource found successfully' });
            } else {
                setResource(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'No resource found with the provided ID' });
            }
        } catch (error) {
            console.error('Error fetching resource:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: 'No resource found with the provided ID' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to retrieve resource' });
            }
            setResource(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        
        // Validate confirmation text
        if (confirmationText !== resource.description) {
            setMessage({ 
                type: 'error', 
                text: 'Confirmation text does not match the resource description' 
            });
            return;
        }
        
        setIsDeleting(true);
        setMessage({ type: '', text: '' });

        try {
            await apiService.deleteResource(resource.id);
            
            setMessage({ 
                type: 'success', 
                text: `Resource "${resource.description}" has been successfully deleted`
            });
            
            // Reset form after successful deletion
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);

        } catch (error) {
            console.error('Error deleting resource:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to delete resource' 
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setResource(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const handleNewSearch = () => {
        setSearchData({ id: '' });
        setResource(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setConfirmationText('');
    };

    const getResourceTypeLabel = (resourceType) => {
        const types = {
            'STSCrane': 'STS Crane',
            'YardCrane': 'Yard Crane',
            'Truck': 'Truck',
            'Tractor': 'Tractor'
        };
        return types[resourceType] || resourceType;
    };
    
    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Delete Resource</h4>
                <p>⚠️ This action cannot be undone</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            {/* Step 1: Search for Resource */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchId">Resource ID</label>
                            <input
                                type="text"
                                id="searchId"
                                name="id"
                                value={searchData.id}
                                onChange={handleSearchInputChange}
                                placeholder="Enter resource ID"
                                className="form-input"
                            />
                            <small className="form-help">Enter the ID of the resource you want to delete</small>
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
                                    Find Resource
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
            {step === 'confirm' && resource && (
                <>
                    <div className="delete-form-header">
                        <span>⚠️ Confirm Deletion</span>
                        <button 
                            type="button" 
                            className="link-btn"
                            onClick={handleNewSearch}
                        >
                            <span style={{ marginRight: '4px' }}>🔍</span>Search Different Resource
                        </button>
                    </div>
                    <div className="delete-details-card">
                        <span className="delete-details-card-title">⚠️ Resource to delete:</span>
                        <div className="delete-details-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <div className="delete-details-field"><span className="delete-details-label">ID:</span><br />{resource.id}</div>
                            <div className="delete-details-field"><span className="delete-details-label">Description:</span><br />{resource.description}</div>
                            <div className="delete-details-field"><span className="delete-details-label">Type:</span><br />{getResourceTypeLabel(resource.resourceType)}</div>
                            <div className="delete-details-field"><span className="delete-details-label">Status:</span><br /><span className={`status-badge status-${(resource.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>{resource.status || 'N/A'}</span></div>
                            <div className="delete-details-field"><span className="delete-details-label">Capacity:</span><br />{resource.operationalCapacity}</div>
                            <div className="delete-details-field"><span className="delete-details-label">Setup Time:</span><br />{resource.setupTime} minutes</div>
                        </div>
                    </div>
                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ Warning</span>
                        <span className="delete-warning-desc">This action cannot be undone and will permanently remove all resource data.</span>
                        <form onSubmit={handleDelete} className="delete-form">
                            <div className="form-group" style={{ marginBottom: '18px' }}>
                                <label htmlFor="confirmationText" style={{ color: '#fff', fontWeight: 500 }}>Type "<strong>{resource.description}</strong>" to confirm:</label>
                                <input
                                    type="text"
                                    id="confirmationText"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    placeholder={resource.description}
                                    className="delete-confirm-input"
                                    required
                                />
                                <small className="delete-confirm-help">This confirmation helps prevent accidental deletions</small>
                            </div>
                            <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
                                <button 
                                    type="submit" 
                                    className="delete-btn"
                                    disabled={isDeleting || confirmationText !== resource.description}
                                >
                                    {isDeleting ? (
                                        <><span className="loading-spinner"></span>Deleting...</>
                                    ) : (
                                        <>🗑️ Delete Resource</>
                                    )}
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

console.log('DeleteResourceForm component loaded! 🗑️');
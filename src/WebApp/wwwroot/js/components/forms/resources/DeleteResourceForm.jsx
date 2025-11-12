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
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
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
                    <div className="form-section-header">
                        <h5>⚠️ Confirm Deletion</h5>
                        <button 
                            type="button" 
                            className="link-btn"
                            onClick={handleNewSearch}
                        >
                            🔍 Search Different Resource
                        </button>
                    </div>

                    {/* Resource Details */}
                    <div className="delete-resource-info">
                        <h6>Resource to delete:</h6>
                        <div className="resource-summary">
                            <div className="summary-item"><strong>ID:</strong> {resource.id}</div>
                            <div className="summary-item"><strong>Description:</strong> {resource.description}</div>
                            <div className="summary-item"><strong>Type:</strong> {getResourceTypeLabel(resource.resourceType)}</div>
                            <div className="summary-item"><strong>Status:</strong> <span className={`status-badge status-${(resource.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>{resource.status || 'N/A'}</span></div>
                            <div className="summary-item"><strong>Capacity:</strong> {resource.operationalCapacity}</div>
                            <div className="summary-item"><strong>Setup Time:</strong> {resource.setupTime} minutes</div>
                        </div>
                    </div>

                    {/* Confirmation Form */}
                    <form onSubmit={handleDelete} className="delete-form">
                        <div className="danger-zone">
                            <div className="danger-header">
                                <h6>⚠️ Warning</h6>
                                <p>This action cannot be undone and will permanently remove all resource data.</p>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmationText">
                                    Type "<strong>{resource.description}</strong>" to confirm:
                                </label>
                                <input
                                    type="text"
                                    id="confirmationText"
                                    value={confirmationText}
                                    onChange={handleConfirmationInputChange}
                                    placeholder={resource.description}
                                    className="form-input danger-input"
                                    required
                                />
                                <small className="form-help danger-help">
                                    This confirmation helps prevent accidental deletions
                                </small>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="delete-btn"
                                disabled={isDeleting || confirmationText !== resource.description}
                            >
                                {isDeleting ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <span>🗑️</span>
                                        Delete Resource
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

console.log('DeleteResourceForm component loaded! 🗑️');
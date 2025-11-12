// Resource Status Management Form Component
console.log('🔧 ResourceStatusForm component loading...');

const ResourceStatusForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        id: ''
    });
    const [resource, setResource] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [selectedAction, setSelectedAction] = React.useState('');

    // Available status actions
    const statusActions = [
        { value: 'activate', label: 'Activate Resource', description: 'Make resource available for use' },
        { value: 'deactivate', label: 'Deactivate Resource', description: 'Temporarily disable resource' },
        { value: 'maintenance-start', label: 'Start Maintenance', description: 'Put resource under maintenance' },
        { value: 'maintenance-end', label: 'End Maintenance', description: 'Return resource to available status' }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user starts typing
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleActionChange = (e) => {
        setSelectedAction(e.target.value);
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
        setSelectedAction('');
        
        try {
            const data = await apiService.getResourceById(searchData.id.trim());
            if (data) {
                setResource(data);
                setHasSearched(true);
                setMessage({ type: 'success', text: 'Resource found! Select an action below.' });
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

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        
        if (!selectedAction) {
            setMessage({ type: 'error', text: 'Please select an action' });
            return;
        }

        setIsUpdating(true);
        setMessage({ type: '', text: '' });

        try {
            let actionLabel;
            let updated;
            switch (selectedAction) {
                case 'activate':
                    await apiService.activateResource(resource.id);
                    actionLabel = 'activated';
                    break;
                case 'deactivate':
                    await apiService.deactivateResource(resource.id);
                    actionLabel = 'deactivated';
                    break;
                case 'maintenance-start':
                    await apiService.startMaintenance(resource.id);
                    actionLabel = 'put under maintenance';
                    break;
                case 'maintenance-end':
                    await apiService.endMaintenance(resource.id);
                    actionLabel = 'maintenance completed';
                    break;
                default:
                    throw new Error('Invalid action selected');
            }
            // Fetch updated resource info
            updated = await apiService.getResourceById(resource.id);
            setResource(updated);
            setMessage({ 
                type: 'success', 
                text: `Resource ${actionLabel} successfully!` 
            });
            setSelectedAction('');
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error updating resource status:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to update resource status' 
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setResource(null);
        setHasSearched(false);
        setSelectedAction('');
        setMessage({ type: '', text: '' });
    };

    const getStatusBadge = (status) => {
        const badges = {
            'Available': { text: 'Available', class: 'status-available' },
            'InUse': { text: 'In Use', class: 'status-in-use' },
            'UnderMaintenance': { text: 'Under Maintenance', class: 'status-maintenance' },
            'Inactive': { text: 'Inactive', class: 'status-inactive' }
        };
        const badge = badges[status] || { text: status, class: 'status-unknown' };
        return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
    };

    const getAvailableActions = () => {
        if (!resource) return statusActions;

        const currentStatus = resource.availabilityStatus;
        
        switch (currentStatus) {
            case 'Available':
                return statusActions.filter(action => 
                    ['deactivate', 'maintenance-start'].includes(action.value)
                );
            case 'Inactive':
                return statusActions.filter(action => 
                    ['activate'].includes(action.value)
                );
            case 'UnderMaintenance':
                return statusActions.filter(action => 
                    ['maintenance-end'].includes(action.value)
                );
            case 'InUse':
                return []; // No actions available when in use
            default:
                return statusActions;
        }
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
                <h4>Manage Resource Status</h4>
                <p>Activate, deactivate, or manage maintenance status</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="search-section">
                <h5>Search for a resource</h5>
                <p className="help-text">Enter the ID of the resource you want to manage</p>
                
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-group">
                        <label htmlFor="searchResourceId">Resource ID</label>
                        <input
                            type="text"
                            id="searchResourceId"
                            name="id"
                            value={searchData.id}
                            onChange={handleInputChange}
                            placeholder="Enter resource ID"
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="button-group">
                        <button 
                            type="submit" 
                            className="search-btn"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Searching...
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
                            onClick={handleClear}
                            className="clear-btn"
                        >
                            Clear
                        </button>
                    </div>
                </form>
            </div>

            {resource && (
                <div className="status-management-section">
                    <div className="form-section-header">
                        <h5>Resource Information</h5>
                    </div>
                    <div className="form-grid">
                        <div className="form-group">
                            <label>ID</label>
                            <input type="text" value={resource.id} className="form-input" disabled />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <input type="text" value={resource.description} className="form-input" disabled />
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <input type="text" value={getResourceTypeLabel(resource.resourceType)} className="form-input" disabled />
                        </div>
                        <div className="form-group">
                            <label>Current Status</label>
                            <input type="text" value={resource.status || ''} className="form-input" disabled />
                        </div>
                    </div>

                    {resource.availabilityStatus === 'InUse' ? (
                        <div className="warning-section">
                            <h6>⚠️ Resource Currently In Use</h6>
                            <p>This resource is currently being used and cannot have its status changed until it becomes available.</p>
                        </div>
                    ) : (
                        <div className="actions-section">
                            <div style={{ margin: '2rem 0 1.5rem 0', borderTop: '2px solid #2a3b5c', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderRadius: '2px' }}></div>
                            <h5 style={{ marginBottom: '0.5rem' }}>Available Actions</h5>
                            <form onSubmit={handleStatusUpdate} className="status-form">
                                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                    <label htmlFor="statusAction" style={{ fontWeight: 'bold', marginBottom: '0.3rem' }}>Select Action</label>
                                    <select
                                        id="statusAction"
                                        value={selectedAction}
                                        onChange={handleActionChange}
                                        className="form-select"
                                        required
                                        style={{ marginBottom: '0.7rem' }}
                                    >
                                        <option value="">Choose an action</option>
                                        {getAvailableActions().map((action) => (
                                            <option key={action.value} value={action.value}>
                                                {action.label}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedAction && (
                                        <small className="form-help" style={{ display: 'block', marginTop: '0.3rem', color: '#7abaff' }}>
                                            {statusActions.find(a => a.value === selectedAction)?.description}
                                        </small>
                                    )}
                                </div>
                                <div className="form-actions">
                                    <button 
                                        type="submit" 
                                        className="submit-btn"
                                        disabled={isUpdating || !selectedAction}
                                    >
                                        {isUpdating ? (
                                            <>
                                                <span className="loading-spinner"></span>
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                <span>🔧</span>
                                                Apply Action
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {hasSearched && !resource && (
                <div className="no-results">
                    <p>No resource found with ID: <strong>{searchData.id}</strong></p>
                    <p>Please check the ID and try again.</p>
                </div>
            )}
        </div>
    );
};

console.log('ResourceStatusForm component loaded! 🔧');
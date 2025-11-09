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
            let newStatus;
            let actionLabel;

            switch (selectedAction) {
                case 'activate':
                    newStatus = 'Available';
                    actionLabel = 'activated';
                    break;
                case 'deactivate':
                    newStatus = 'Inactive';
                    actionLabel = 'deactivated';
                    break;
                case 'maintenance-start':
                    newStatus = 'UnderMaintenance';
                    actionLabel = 'put under maintenance';
                    break;
                case 'maintenance-end':
                    newStatus = 'Available';
                    actionLabel = 'maintenance completed';
                    break;
                default:
                    throw new Error('Invalid action selected');
            }

            // Create updated resource data
            const updatedResourceData = {
                Id: resource.id,
                Description: resource.description,
                ResourceType: resource.resourceType,
                OperationalCapacity: resource.operationalCapacity,
                SetupTime: resource.setupTime,
                AvailabilityStatus: newStatus,
                QualificationRequirements: resource.qualificationRequirements || []
            };

            // Update resource status
            await apiService.updateResource(resource.id, updatedResourceData);
            
            setMessage({ 
                type: 'success', 
                text: `Resource ${actionLabel} successfully!` 
            });
            
            // Update local resource state
            setResource(prev => ({
                ...prev,
                availabilityStatus: newStatus
            }));

            // Clear selected action
            setSelectedAction('');
            
            // Notify parent component
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
                    <div className="resource-summary">
                        <h5>Resource Information</h5>
                        <div className="summary-grid">
                            <div className="summary-item">
                                <label>ID:</label>
                                <span>{resource.id}</span>
                            </div>
                            <div className="summary-item">
                                <label>Description:</label>
                                <span>{resource.description}</span>
                            </div>
                            <div className="summary-item">
                                <label>Type:</label>
                                <span>{getResourceTypeLabel(resource.resourceType)}</span>
                            </div>
                            <div className="summary-item">
                                <label>Current Status:</label>
                                {getStatusBadge(resource.availabilityStatus)}
                            </div>
                        </div>
                    </div>

                    {resource.availabilityStatus === 'InUse' ? (
                        <div className="warning-section">
                            <h6>⚠️ Resource Currently In Use</h6>
                            <p>This resource is currently being used and cannot have its status changed until it becomes available.</p>
                        </div>
                    ) : (
                        <div className="actions-section">
                            <h5>Available Actions</h5>
                            
                            <form onSubmit={handleStatusUpdate} className="status-form">
                                <div className="form-group">
                                    <label htmlFor="statusAction">Select Action</label>
                                    <select
                                        id="statusAction"
                                        value={selectedAction}
                                        onChange={handleActionChange}
                                        className="form-select"
                                        required
                                    >
                                        <option value="">Choose an action</option>
                                        {getAvailableActions().map((action) => (
                                            <option key={action.value} value={action.value}>
                                                {action.label}
                                            </option>
                                        ))}
                                    </select>
                                    {selectedAction && (
                                        <small className="form-help">
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
// Resources Page Component - React
const ResourcesPage = () => {
    const [resources, setResources] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load resources when component mounts
    React.useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getResources();
            setResources(data || []);
        } catch (err) {
            console.error('Error loading resources:', err);
            setError('Error loading resources. Please check the API connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (resourceId) => {
        try {
            const resource = await apiService.getResourceById(resourceId);
            
            // Handle qualificationRequirements HashSet properly
            let qualifications = 'None';
            if (resource.qualificationRequirements && Array.isArray(resource.qualificationRequirements) && resource.qualificationRequirements.length > 0) {
                qualifications = resource.qualificationRequirements
                    .map(q => q.name || q.code || q)
                    .join(', ');
            } else if (resource.qualificationRequirements && typeof resource.qualificationRequirements === 'object') {
                // In case it's an object with qualification details
                qualifications = Object.values(resource.qualificationRequirements)
                    .map(q => q.name || q.code || q)
                    .join(', ');
            }
            
            alert(`Resource Details:\n\nID: ${resource.id || 'N/A'}\nDescription: ${resource.description || 'N/A'}\nType: ${resource.resourceType || 'N/A'}\nStatus: ${resource.status || 'N/A'}\nCapacity: ${resource.operationalCapacity || 'N/A'}\nSetup Time: ${resource.setupTime || 'N/A'} minutes\nQualification Requirements: ${qualifications}`);
        } catch (error) {
            alert('Error loading resource details: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">Port Resources</h2>
                <div className="loading-indicator">Loading resources...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">Port Resources</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadResources}>Retry</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">Port Resources</h2>
            <p>View and manage port resources including cranes, equipment, and facilities.</p>
            
            {resources.length === 0 ? (
                <div className="no-data">
                    <h3>No Resources Found</h3>
                    <p>There are currently no resources in the system.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Capacity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resources.map(resource => (
                                <tr key={resource.id}>
                                    <td>{resource.id || 'N/A'}</td>
                                    <td>{resource.description || 'N/A'}</td>
                                    <td>{resource.resourceType || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge status-${(resource.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                                            {resource.status || 'N/A'}
                                        </span>
                                    </td>
                                    <td>{resource.operationalCapacity || 'N/A'}</td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(resource.id)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
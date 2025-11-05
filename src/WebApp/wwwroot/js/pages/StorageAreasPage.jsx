// Storage Areas Page Component - React
const StorageAreasPage = () => {
    const [storageAreas, setStorageAreas] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load storage areas when component mounts
    React.useEffect(() => {
        loadStorageAreas();
    }, []);

    const loadStorageAreas = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getStorageAreas();
            setStorageAreas(data || []);
        } catch (err) {
            console.error('Error loading storage areas:', err);
            setError('Error loading storage areas. Please check the API connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (storageAreaId) => {
        try {
            const storageAreaDetails = await apiService.getStorageAreaById(storageAreaId);
            alert(`Storage Area Details:\n\nID: ${storageAreaDetails.id}\nName: ${storageAreaDetails.name}\nDescription: ${storageAreaDetails.description}\nCapacity: ${storageAreaDetails.capacity || 'N/A'}\nArea: ${storageAreaDetails.area || 'N/A'} m²\nType: ${storageAreaDetails.type || 'N/A'}\nStatus: ${storageAreaDetails.status || 'N/A'}`);
        } catch (error) {
            alert('Error loading storage area details: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">Storage Areas</h2>
                <div className="loading-indicator">Loading storage areas...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">Storage Areas</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadStorageAreas}>Retry</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">Storage Areas</h2>
            <p>View and manage port storage areas, warehouses, and container yards.</p>
            
            {storageAreas.length === 0 ? (
                <div className="no-data">
                    <h3>No Storage Areas Found</h3>
                    <p>There are currently no storage areas configured in the system.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Capacity</th>
                                <th>Area (m²)</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {storageAreas.map(area => (
                                <tr key={area.id}>
                                    <td>{area.id || 'N/A'}</td>
                                    <td>{area.name || 'N/A'}</td>
                                    <td>{area.description || 'N/A'}</td>
                                    <td>{area.type || 'N/A'}</td>
                                    <td>{area.capacity || 'N/A'}</td>
                                    <td>{area.area ? `${area.area} m²` : 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge status-${(area.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                                            {area.status || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(area.id)}
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

console.log('StorageAreasPage component loaded!');
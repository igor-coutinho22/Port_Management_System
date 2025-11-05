// Docks Page Component - React
const DocksPage = () => {
    const [docks, setDocks] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load docks when component mounts
    React.useEffect(() => {
        loadDocks();
    }, []);

    const loadDocks = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getDocks();
            setDocks(data || []);
        } catch (err) {
            console.error('Error loading docks:', err);
            setError('Error loading docks. Please check the API connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (dockId) => {
        try {
            const dockDetails = await apiService.getDockById(dockId);
            alert(`Dock Details:\n\nID: ${dockDetails.id}\nName: ${dockDetails.name}\nDescription: ${dockDetails.description}\nCapacity: ${dockDetails.capacity || 'N/A'}\nLocation: ${dockDetails.location || 'N/A'}\nStatus: ${dockDetails.status || 'N/A'}`);
        } catch (error) {
            alert('Error loading dock details: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">Dock Management</h2>
                <div className="loading-indicator">Loading docks...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">Dock Management</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadDocks}>Retry</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">Dock Management</h2>
            <p>View and manage port docks and berths for vessel operations.</p>
            
            {docks.length === 0 ? (
                <div className="no-data">
                    <h3>No Docks Found</h3>
                    <p>There are currently no docks registered in the system.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Capacity</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {docks.map(dock => (
                                <tr key={dock.id}>
                                    <td>{dock.id || 'N/A'}</td>
                                    <td>{dock.name || 'N/A'}</td>
                                    <td>{dock.description || 'N/A'}</td>
                                    <td>{dock.capacity || 'N/A'}</td>
                                    <td>{dock.location || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge status-${(dock.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                                            {dock.status || 'N/A'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(dock.id)}
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

console.log('DocksPage component loaded!');
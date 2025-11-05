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

    const handleViewDetails = async (dockName) => {
        try {
            const dock = docks.find(d => d.name === dockName);
            if (dock) {
                const vesselTypes = dock.allowedVesselTypes ? dock.allowedVesselTypes.join(', ') : 'None specified';
                alert(`Dock Details:\n\nName: ${dock.name}\nLocation: ${dock.location}\nLength: ${dock.lengthMeters}m\nDepth: ${dock.depthMeters}m\nMax Draft: ${dock.maxDraftMeters}m\nAllowed Vessel Types: ${vesselTypes}`);
            } else {
                alert('Dock not found');
            }
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
                                <th>#</th>
                                <th>Name</th>
                                <th>Location</th>
                                <th>Length (m)</th>
                                <th>Depth (m)</th>
                                <th>Max Draft (m)</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {docks.map((dock, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{dock.name || 'N/A'}</td>
                                    <td>{dock.location || 'N/A'}</td>
                                    <td>{dock.lengthMeters ? dock.lengthMeters.toFixed(1) : 'N/A'}</td>
                                    <td>{dock.depthMeters ? dock.depthMeters.toFixed(1) : 'N/A'}</td>
                                    <td>{dock.maxDraftMeters ? dock.maxDraftMeters.toFixed(1) : 'N/A'}</td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(dock.name)}
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
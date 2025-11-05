// VesselTypes Page Component - React
const VesselTypesPage = () => {
    const [vesselTypes, setVesselTypes] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load vessel types when component mounts
    React.useEffect(() => {
        loadVesselTypes();
    }, []);

    const loadVesselTypes = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getVesselTypes();
            setVesselTypes(data || []);
        } catch (err) {
            console.error('Error loading vessel types:', err);
            setError('Error loading vessel types. Please check the API connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (vesselTypeName) => {
        try {
            const vesselType = vesselTypes.find(vt => vt.name === vesselTypeName);
            if (vesselType) {
                alert(`Vessel Type Details:\n\nName: ${vesselType.name}\nDescription: ${vesselType.description || 'N/A'}\nMax Bays: ${vesselType.maxBays || 'N/A'}\nMax Rows: ${vesselType.maxRows || 'N/A'}\nMax Tiers: ${vesselType.maxTiers || 'N/A'}\nMax TEU Capacity: ${vesselType.maxTEUCapacity || 'N/A'}`);
            } else {
                alert('Vessel type not found');
            }
        } catch (error) {
            alert('Error loading vessel type details: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">Vessel Types</h2>
                <div className="loading-indicator">Loading vessel types...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">Vessel Types</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadVesselTypes}>Retry</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">Vessel Types</h2>
            <p>View and manage different types of vessels that can dock at the port.</p>
            
            {vesselTypes.length === 0 ? (
                <div className="no-data">
                    <h3>No Vessel Types Found</h3>
                    <p>There are currently no vessel types configured in the system.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Max Bays</th>
                                <th>Max Rows</th>
                                <th>Max Tiers</th>
                                <th>Max TEU Capacity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vesselTypes.map((vesselType, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{vesselType.name || 'N/A'}</td>
                                    <td>{vesselType.description || 'N/A'}</td>
                                    <td>{vesselType.maxBays || 'N/A'}</td>
                                    <td>{vesselType.maxRows || 'N/A'}</td>
                                    <td>{vesselType.maxTiers || 'N/A'}</td>
                                    <td>{vesselType.maxTEUCapacity || 'N/A'}</td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(vesselType.name)}
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

console.log('VesselTypesPage component loaded!');
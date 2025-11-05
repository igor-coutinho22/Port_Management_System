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

    const handleViewDetails = async (vesselTypeId) => {
        try {
            const vesselType = vesselTypes.find(vt => vt.id === vesselTypeId);
            if (vesselType) {
                alert(`Vessel Type Details:\n\nID: ${vesselType.id}\nName: ${vesselType.name}\nDescription: ${vesselType.description}\nMax Length: ${vesselType.maxLength || 'N/A'}\nMax Width: ${vesselType.maxWidth || 'N/A'}\nMax Draft: ${vesselType.maxDraft || 'N/A'}`);
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
                                <th>ID</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th>Max Length</th>
                                <th>Max Width</th>
                                <th>Max Draft</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vesselTypes.map(vesselType => (
                                <tr key={vesselType.id}>
                                    <td>{vesselType.id || 'N/A'}</td>
                                    <td>{vesselType.name || 'N/A'}</td>
                                    <td>{vesselType.description || 'N/A'}</td>
                                    <td>{vesselType.maxLength ? `${vesselType.maxLength}m` : 'N/A'}</td>
                                    <td>{vesselType.maxWidth ? `${vesselType.maxWidth}m` : 'N/A'}</td>
                                    <td>{vesselType.maxDraft ? `${vesselType.maxDraft}m` : 'N/A'}</td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(vesselType.id)}
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
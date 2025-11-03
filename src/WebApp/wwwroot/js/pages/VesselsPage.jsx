// Vessels Page Component - React
const VesselsPage = () => {
    const [vessels, setVessels] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load vessels when component mounts
    React.useEffect(() => {
        loadVessels();
    }, []);

    const loadVessels = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getVessels();
            setVessels(data || []);
        } catch (err) {
            console.error('Error loading vessels:', err);
            setError('Error loading vessels. Please check the API connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (vesselImo) => {
        try {
            const vessel = await apiService.getVesselByImo(vesselImo);
            alert(`Vessel Details:\n\nIMO: ${vessel.imo}\nName: ${vessel.vesselName}\nOperator: ${vessel.operatorName}\nType: ${vessel.vesselTypeName}`);
        } catch (error) {
            alert('Error loading vessel details: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">Vessel Management</h2>
                <div className="loading-indicator">Loading vessels...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">Vessel Management</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadVessels}>Retry</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">Vessel Management</h2>
            <p>Track vessels, schedules, and operations in the port.</p>
            
            {vessels.length === 0 ? (
                <div className="no-data">
                    <h3>No Vessels Found</h3>
                    <p>There are currently no vessels in the system.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>IMO</th>
                                <th>Name</th>
                                <th>Operator</th>
                                <th>Type</th>
                                <th>Dimensions</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vessels.map(vessel => (
                                <tr key={vessel.imo}>
                                    <td>{vessel.imo || 'N/A'}</td>
                                    <td>{vessel.vesselName || 'N/A'}</td>
                                    <td>{vessel.operatorName || 'N/A'}</td>
                                    <td>{vessel.vesselTypeName || 'N/A'}</td>
                                    <td>
                                        {(vessel.bays || 0)}×{(vessel.rows || 0)}×{(vessel.tiers || 0)}
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(vessel.imo)}
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
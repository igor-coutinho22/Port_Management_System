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
            const area = storageAreas.find(a => a.id === storageAreaId);
            if (area) {
                const utilizationPercent = area.maxCapacityTeu ? Math.round((area.currentOccupancyTeu / area.maxCapacityTeu) * 100) : 0;
                
                // Build specialized information based on storage area type and available properties
                let specializedInfo = '';
                
                if (area.type === 'Warehouse' || area.type === 'warehouse') {
                    if (area.specializedCargoType) {
                        specializedInfo = `\nSpecialized Cargo: ${area.specializedCargoType}`;
                    } else {
                        specializedInfo = `\nSpecialized Cargo: Not specified`;
                    }
                } else if (area.type === 'ContainerYard' || area.type === 'containerYard') {
                    if (area.dockIds && area.dockIds.length > 0) {
                        specializedInfo = `\nDocks Served: ${area.dockIds.length} dock(s) (IDs: ${area.dockIds.join(', ')})`;
                    } else {
                        specializedInfo = `\nDocks Served: None configured`;
                    }
                }
                
                alert(`Storage Area Details:\n\nID: ${area.id || 'N/A'}\nName: ${area.name || 'N/A'}\nType: ${area.type || 'N/A'}\nMax Capacity: ${area.maxCapacityTeu || 'N/A'} TEU\nCurrent Occupancy: ${area.currentOccupancyTeu || 'N/A'} TEU\nUtilization: ${utilizationPercent}%${specializedInfo}`);
            } else {
                alert('Storage area not found');
            }
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
                                <th>Type</th>
                                <th>Max Capacity (TEU)</th>
                                <th>Current Occupancy (TEU)</th>
                                <th>Utilization %</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {storageAreas.map(area => (
                                <tr key={area.id}>
                                    <td>{area.id || 'N/A'}</td>
                                    <td>{area.name || 'N/A'}</td>
                                    <td>{area.type || 'N/A'}</td>
                                    <td>{area.maxCapacityTeu || 'N/A'}</td>
                                    <td>{area.currentOccupancyTeu || 'N/A'}</td>
                                    <td>{area.maxCapacityTeu ? Math.round((area.currentOccupancyTeu / area.maxCapacityTeu) * 100) : 'N/A'}%</td>
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
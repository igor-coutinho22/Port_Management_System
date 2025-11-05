// Representatives Page Component - React
const RepresentativesPage = () => {
    const [representatives, setRepresentatives] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load representatives when component mounts
    React.useEffect(() => {
        loadRepresentatives();
    }, []);

    const loadRepresentatives = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getRepresentatives();
            setRepresentatives(data || []);
        } catch (err) {
            console.error('Error loading representatives:', err);
            setError('Error loading representatives. Please check the API connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (representativeId) => {
        try {
            const representative = representatives.find(r => r.id === representativeId);
            if (representative) {
                alert(`Representative Details:\n\nID: ${representative.id}\nName: ${representative.name}\nCitizen ID: ${representative.citizenId}\nNationality: ${representative.nationality}\nEmail: ${representative.email}\nPhone: ${representative.phone}\nOrganization ID: ${representative.organizationId}\nStatus: ${representative.isActive ? 'Active' : 'Inactive'}`);
            } else {
                alert('Representative not found');
            }
        } catch (error) {
            alert('Error loading representative details: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">Representatives</h2>
                <div className="loading-indicator">Loading representatives...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">Representatives</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadRepresentatives}>Retry</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">Representatives</h2>
            <p>View and manage organization representatives and their contact information.</p>
            
            {representatives.length === 0 ? (
                <div className="no-data">
                    <h3>No Representatives Found</h3>
                    <p>There are currently no representatives registered in the system.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Citizen ID</th>
                                <th>Nationality</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {representatives.map(representative => (
                                <tr key={representative.id}>
                                    <td>{representative.id || 'N/A'}</td>
                                    <td>{representative.name || 'N/A'}</td>
                                    <td>{representative.citizenId || 'N/A'}</td>
                                    <td>{representative.nationality || 'N/A'}</td>
                                    <td>{representative.email || 'N/A'}</td>
                                    <td>{representative.phone || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge status-${representative.isActive ? 'active' : 'inactive'}`}>
                                            {representative.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(representative.id)}
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

console.log('RepresentativesPage component loaded!');
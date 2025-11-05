// Organizations Page Component - React
const OrganizationsPage = () => {
    const [organizations, setOrganizations] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load organizations when component mounts
    React.useEffect(() => {
        loadOrganizations();
    }, []);

    const loadOrganizations = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getOrganizations();
            setOrganizations(data || []);
        } catch (err) {
            console.error('Error loading organizations:', err);
            setError('Error loading organizations. Please check the API connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (organizationId) => {
        try {
            const org = organizations.find(o => o.id === organizationId);
            if (org) {
                alert(`Organization Details:\n\nID: ${org.id}\nLegal Name: ${org.legalName}\nAlternative Names: ${org.alternativeNames || 'None'}\nAddress: ${org.address}\nTax Number: ${org.taxNumber}`);
            } else {
                alert('Organization not found');
            }
        } catch (error) {
            alert('Error loading organization details: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">Organizations</h2>
                <div className="loading-indicator">Loading organizations...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">Organizations</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadOrganizations}>Retry</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">Organizations</h2>
            <p>View and manage shipping companies, port authorities, and other organizations.</p>
            
            {organizations.length === 0 ? (
                <div className="no-data">
                    <h3>No Organizations Found</h3>
                    <p>There are currently no organizations registered in the system.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Legal Name</th>
                                <th>Alternative Names</th>
                                <th>Address</th>
                                <th>Tax Number</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {organizations.map(org => (
                                <tr key={org.id}>
                                    <td>{org.id || 'N/A'}</td>
                                    <td>{org.legalName || 'N/A'}</td>
                                    <td>{org.alternativeNames || 'N/A'}</td>
                                    <td>{org.address || 'N/A'}</td>
                                    <td>{org.taxNumber || 'N/A'}</td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(org.id)}
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

console.log('OrganizationsPage component loaded!');
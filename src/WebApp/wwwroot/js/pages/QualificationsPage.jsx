// Qualifications Page Component - React
const QualificationsPage = () => {
    const [qualifications, setQualifications] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load qualifications when component mounts
    React.useEffect(() => {
        loadQualifications();
    }, []);

    const loadQualifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getQualifications();
            setQualifications(data || []);
        } catch (err) {
            console.error('Error loading qualifications:', err);
            setError('Error loading qualifications. Please check the API connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (qualificationId) => {
        try {
            const qualification = await apiService.getQualificationById(qualificationId);
            alert(`Qualification Details:\n\nID: ${qualification.id}\nName: ${qualification.name}\nDescription: ${qualification.description}\nType: ${qualification.type}\nValidity Period: ${qualification.validityPeriod}\nCertifying Body: ${qualification.certifyingBody}`);
        } catch (error) {
            alert('Error loading qualification details: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">Qualifications</h2>
                <div className="loading-indicator">Loading qualifications...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">Qualifications</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadQualifications}>Retry</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">Qualifications</h2>
            <p>View and manage professional qualifications and certifications required for port operations.</p>
            
            {qualifications.length === 0 ? (
                <div className="no-data">
                    <h3>No Qualifications Found</h3>
                    <p>There are currently no qualifications registered in the system.</p>
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
                                <th>Validity Period</th>
                                <th>Certifying Body</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {qualifications.map(qualification => (
                                <tr key={qualification.id}>
                                    <td>{qualification.id || 'N/A'}</td>
                                    <td>{qualification.name || 'N/A'}</td>
                                    <td>{qualification.description || 'N/A'}</td>
                                    <td>{qualification.type || 'N/A'}</td>
                                    <td>{qualification.validityPeriod || 'N/A'}</td>
                                    <td>{qualification.certifyingBody || 'N/A'}</td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(qualification.id)}
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

console.log('QualificationsPage component loaded!');
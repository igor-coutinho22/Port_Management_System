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

    const handleViewDetails = async (qualificationCode) => {
        try {
            const qualification = qualifications.find(q => q.code === qualificationCode);
            if (qualification) {
                const obtainedDate = qualification.dateObtained ? new Date(qualification.dateObtained).toLocaleDateString() : 'Not specified';
                const expiryDate = qualification.expiryDate ? new Date(qualification.expiryDate).toLocaleDateString() : 'No expiry';
                const isValid = qualification.expiryDate ? new Date(qualification.expiryDate) > new Date() : true;
                alert(`Qualification Details:\n\nCode: ${qualification.code}\nName: ${qualification.name}\nDate Obtained: ${obtainedDate}\nExpiry Date: ${expiryDate}\nStatus: ${isValid ? 'Valid' : 'Expired'}`);
            } else {
                alert('Qualification not found');
            }
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
                                <th>Code</th>
                                <th>Name</th>
                                <th>Date Obtained</th>
                                <th>Expiry Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {qualifications.map((qualification, index) => (
                                <tr key={index}>
                                    <td>{qualification.code || 'N/A'}</td>
                                    <td>{qualification.name || 'N/A'}</td>
                                    <td>{qualification.dateObtained ? new Date(qualification.dateObtained).toLocaleDateString() : 'N/A'}</td>
                                    <td>{qualification.expiryDate ? new Date(qualification.expiryDate).toLocaleDateString() : 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge ${qualification.expiryDate && new Date(qualification.expiryDate) > new Date() ? 'status-valid' : 'status-expired'}`}>
                                            {qualification.expiryDate && new Date(qualification.expiryDate) > new Date() ? 'Valid' : 'Expired'}
                                        </span>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(qualification.code)}
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
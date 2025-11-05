// Staff Page Component - React
const StaffPage = () => {
    const [staff, setStaff] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Load staff when component mounts
    React.useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await apiService.getStaff();
            setStaff(data || []);
        } catch (err) {
            console.error('Error loading staff:', err);
            setError('Error loading staff. Please check the API connection.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (mecanographicNumber) => {
        try {
            const staffMember = staff.find(s => s.mecanographicNumber === mecanographicNumber);
            if (staffMember) {
                const qualifications = staffMember.qualifications ? 
                    staffMember.qualifications.map(q => `${q.name} (${q.code})`).join(', ') : 
                    'None';
                alert(`Staff Details:\n\nMecanographic Number: ${staffMember.mecanographicNumber}\nName: ${staffMember.shortName}\nEmail: ${staffMember.email}\nPhone: ${staffMember.phone}\nStatus: ${staffMember.status}\nOperational Window: ${staffMember.operationalWindow}\nQualifications: ${qualifications}`);
            } else {
                alert('Staff member not found');
            }
        } catch (error) {
            alert('Error loading staff details: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="page-section">
                <h2 className="page-title">Port Staff</h2>
                <div className="loading-indicator">Loading staff...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">Port Staff</h2>
                <p className="error">{error}</p>
                <button className="btn" onClick={loadStaff}>Retry</button>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">Port Staff</h2>
            <p>View and manage port staff members, their roles and contact information.</p>
            
            {staff.length === 0 ? (
                <div className="no-data">
                    <h3>No Staff Found</h3>
                    <p>There are currently no staff members registered in the system.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Mecanographic #</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Status</th>
                                <th>Operational Window</th>
                                <th>Qualifications</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staff.map((staffMember, index) => (
                                <tr key={index}>
                                    <td>{staffMember.mecanographicNumber || 'N/A'}</td>
                                    <td>{staffMember.shortName || 'N/A'}</td>
                                    <td>{staffMember.email || 'N/A'}</td>
                                    <td>{staffMember.phone || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge status-${(staffMember.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                                            {staffMember.status || 'N/A'}
                                        </span>
                                    </td>
                                    <td>{staffMember.operationalWindow || 'N/A'}</td>
                                    <td>{staffMember.qualifications ? staffMember.qualifications.length : 0}</td>
                                    <td>
                                        <button 
                                            className="btn-small"
                                            onClick={() => handleViewDetails(staffMember.mecanographicNumber)}
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

console.log('StaffPage component loaded!');
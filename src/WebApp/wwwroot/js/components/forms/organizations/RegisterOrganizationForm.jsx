
// Register Organization Form Component
console.log('📝 RegisterOrganizationForm component loading...');


const RegisterOrganizationForm = ({ onSuccess }) => {
    const [formData, setFormData] = React.useState({
        legalName: '',
        alternativeNames: '',
        address: '',
        taxNumber: '',
        representatives: []
    });
    const [representativesList, setRepresentativesList] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // Helper to get color for message type
    const getMessageColor = (type) => {
        if (type === 'error') return 'red';
        if (type === 'success') return 'green';
        if (type === 'info') return '#0074D9'; // blue
        return 'inherit';
    };

    React.useEffect(() => {
        loadRepresentatives();
    }, []);

    const loadRepresentatives = async () => {
        try {
            const reps = await apiService.getRepresentatives();
            setRepresentativesList(reps || []);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load representatives.' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleRepresentativeToggle = (repId) => {
        setFormData(prev => {
            const isSelected = prev.representatives.includes(repId);
            const newReps = isSelected
                ? prev.representatives.filter(id => id !== repId)
                : [...prev.representatives, repId];
            return {
                ...prev,
                representatives: newReps
            };
        });
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            if (!formData.legalName?.trim()) throw new Error('Legal name is required.');
            if (!formData.address?.trim()) throw new Error('Address is required.');
            if (!formData.taxNumber?.trim()) throw new Error('Tax number is required.');
            if (!formData.representatives || formData.representatives.length === 0) throw new Error('At least one representative is required.');
            // Find full representative objects for selected IDs
            const selectedReps = representativesList.filter(rep => formData.representatives.includes(rep.id));
            // Validate all required fields for each representative
            for (const rep of selectedReps) {
                if (!rep.name || !rep.email || !rep.phone || !rep.citizenId || !rep.nationality) {
                    throw new Error('All representative fields (Name, Email, Phone, CitizenId, Nationality) are required.');
                }
            }
            const orgData = {
                LegalName: formData.legalName,
                AlternativeNames: formData.alternativeNames,
                Address: formData.address,
                TaxNumber: formData.taxNumber,
                Representatives: selectedReps.map(rep => ({
                    Name: rep.name,
                    Email: rep.email,
                    Phone: rep.phone,
                    CitizenId: rep.citizenId,
                    Nationality: rep.nationality,
                    Id: rep.id
                }))
            };
            await apiService.createOrganization(orgData);
            setMessage({ type: 'success', text: 'Organization registered successfully.' });
            setFormData({ legalName: '', alternativeNames: '', address: '', taxNumber: '', representatives: [] });
            if (onSuccess) onSuccess();
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to register organization.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container" style={{
            background: '#232b3e',
            borderRadius: '10px',
            padding: '32px 32px 28px 32px',
            maxWidth: '700px',
            color: '#fff',
            margin: '0 auto',
            boxShadow: '0 2px 12px 0 rgba(45,225,252,0.08)'
        }}>
            <div className="form-header" style={{ marginBottom: '18px' }}>
                <h2 style={{ color: '#2de1fc', fontWeight: 700, fontSize: '1.35rem', marginBottom: '2px' }}>Register Organization</h2>
                <p style={{ color: '#b8eaff', fontSize: '1rem', marginBottom: '12px' }}>Fill in the details to register a new organization.</p>
                <hr style={{ border: 'none', borderTop: '1px solid #3a4666', margin: '0 0 18px 0' }} />
            </div>
            {message.text && (
                <div className={`message ${message.type}`} style={{ color: getMessageColor(message.type), marginBottom: '16px', fontWeight: 500, fontSize: '1.05em' }}>{message.text}</div>
            )}
            <form onSubmit={handleSubmit} className="register-form">
                <div className="form-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '22px 28px',
                    marginBottom: '18px'
                }}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="legalName" style={{ color: '#b8eaff', fontWeight: 600 }}>Name <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            id="legalName"
                            name="legalName"
                            value={formData.legalName}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #3a4666', background: '#232b3e', color: '#fff', fontSize: '1.05em' }}
                        />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="alternativeNames" style={{ color: '#b8eaff', fontWeight: 600 }}>Alternative Names</label>
                        <input
                            type="text"
                            id="alternativeNames"
                            name="alternativeNames"
                            value={formData.alternativeNames}
                            onChange={handleInputChange}
                            className="form-input"
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #3a4666', background: '#232b3e', color: '#fff', fontSize: '1.05em' }}
                        />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="address" style={{ color: '#b8eaff', fontWeight: 600 }}>Address <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #3a4666', background: '#232b3e', color: '#fff', fontSize: '1.05em' }}
                        />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label htmlFor="taxNumber" style={{ color: '#b8eaff', fontWeight: 600 }}>Tax Number <span style={{ color: 'red' }}>*</span></label>
                        <input
                            type="text"
                            id="taxNumber"
                            name="taxNumber"
                            value={formData.taxNumber}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #3a4666', background: '#232b3e', color: '#fff', fontSize: '1.05em' }}
                        />
                    </div>
                </div>
                <div className="representatives-selection-box" style={{
                    background: 'linear-gradient(135deg, #1a2332 80%, #22304a 100%)',
                    border: '2px solid #2de1fc',
                    borderRadius: '14px',
                    padding: '18px 22px',
                    margin: '18px 0',
                    boxShadow: '0 2px 12px 0 rgba(45,225,252,0.08)',
                    color: '#fff',
                    maxWidth: '540px'
                }}>
                    <div className="selection-header" style={{ marginBottom: '12px', borderBottom: '1px solid #2de1fc', paddingBottom: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <h5 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2de1fc', margin: 0 }}>
                            <span style={{ marginRight: '6px' }}>🧑‍💼</span>Representatives <span className="required" style={{ color: 'red' }}>*</span>
                        </h5>
                        <p style={{ fontSize: '0.98rem', color: '#b8eaff', margin: 0 }}>Select representatives for this organization</p>
                    </div>
                    {representativesList.length === 0 ? (
                        <div className="loading" style={{ color: '#b8eaff' }}>Loading representatives...</div>
                    ) : (
                        <div className="representative-checkboxes" style={{ maxHeight: '220px', overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {representativesList.map(rep => (
                                <div key={rep.id} className="representative-checkbox" style={{ background: '#232b3e', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="checkbox"
                                        id={`register-rep-${rep.id}`}
                                        value={rep.id}
                                        checked={formData.representatives.includes(rep.id)}
                                        onChange={() => handleRepresentativeToggle(rep.id)}
                                        style={{ width: '22px', height: '22px', accentColor: '#2de1fc', marginRight: '10px' }}
                                    />
                                    <label htmlFor={`register-rep-${rep.id}`} style={{ color: '#fff', fontWeight: 600, fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <span>
                                            {rep.name}
                                            {rep.email && (
                                                <span style={{ color: '#b8eaff', fontWeight: 400 }}> - {rep.email}</span>
                                            )}
                                            <span style={{ color: '#b8eaff', fontWeight: 400, fontSize: '0.95em' }}> ({rep.id})</span>
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="form-actions" style={{ marginTop: '8px' }}>
                    <button type="submit" className="submit-btn" disabled={isLoading} style={{
                        background: '#2de1fc',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '10px 22px',
                        fontWeight: 600,
                        fontSize: '1.08em',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 8px 0 rgba(45,225,252,0.08)'
                    }}>
                        {isLoading ? (<><span className="loading-spinner"></span>Registering...</>) : (<>Register Organization</>)}
                    </button>
                </div>
            </form>
        </div>
    );
};

console.log('RegisterOrganizationForm component loaded! 📝');

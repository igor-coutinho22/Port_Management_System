// Register Organization Form Component
console.log('RegisterOrganizationForm component loading...');

const RegisterOrganizationForm = ({ onSuccess }) => {
    const [formData, setFormData] = React.useState({
        identifier: '',
        legalName: '',
        alternativeName: '',
        address: '',
        taxNumber: '',
        representatives: [] // Start with no representatives
    });
    const [existingReps, setExistingReps] = React.useState([]);
    const [selectedRepId, setSelectedRepId] = React.useState('');

    React.useEffect(() => {
        // Load existing representatives on mount
        apiService.getRepresentatives().then(setExistingReps).catch(() => setExistingReps([]));
    }, []);
    const handleSelectRep = (e) => {
        const repId = e.target.value;
        setSelectedRepId(repId);
        if (!repId) return;
        // Prevent duplicates
        if (formData.representatives.some(r => r.citizenId === (existingReps.find(rep => (rep.id || rep.Id) === repId)?.citizenId || existingReps.find(rep => (rep.id || rep.Id) === repId)?.CitizenId))) {
            return;
        }
        const rep = existingReps.find(r => r.id === repId || r.Id === repId);
        if (rep) {
            setFormData(prev => ({
                ...prev,
                representatives: [
                    ...prev.representatives,
                    {
                        id: rep.id || rep.Id || '',
                        name: rep.name || rep.Name || '',
                        citizenId: rep.citizenId || rep.CitizenId || '',
                        nationality: rep.nationality || rep.Nationality || '',
                        email: rep.email || rep.Email || '',
                        phone: rep.phone || rep.Phone || ''
                    }
                ]
            }));
        }
    };
    const handleRemoveRep = (idx) => {
        setFormData(prev => ({
            ...prev,
            representatives: prev.representatives.filter((_, i) => i !== idx)
        }));
    };
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    // No representatives logic needed

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    // No manual rep change or add

    // No representatives logic needed

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            if (!formData.identifier.trim()) throw new Error('Identifier is required');
            if (!formData.legalName.trim()) throw new Error('Legal name is required');
            if (!formData.address.trim()) throw new Error('Address is required');
            if (!formData.taxNumber.trim()) throw new Error('Tax number is required');
            if (!formData.representatives.length || !formData.representatives[0].name.trim()) throw new Error('At least one representative is required');
            // Prepare DTO for backend
            const dto = {
                Identifier: formData.identifier,
                LegalName: formData.legalName,
                AlternativeName: formData.alternativeName,
                Address: formData.address,
                TaxNumber: formData.taxNumber,
                Representatives: formData.representatives.map(r => ({
                    Id: r.id || r.Id || undefined,
                    Name: r.name,
                    CitizenId: r.citizenId,
                    Nationality: r.nationality,
                    Email: r.email,
                    Phone: r.phone
                }))
            };
            await apiService.createOrganization(dto);
            setMessage({ type: 'success', text: 'Organization registered successfully.' });
            if (onSuccess) onSuccess();
            setFormData({
                identifier: '',
                legalName: '',
                alternativeName: '',
                address: '',
                taxNumber: '',
                representatives: []
            });
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to register organization.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Register Organization</h4>
                <p>Register a new shipping agent organization in the system.</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                    <label htmlFor="identifier">Identifier</label>
                    <input type="text" id="identifier" name="identifier" value={formData.identifier} onChange={handleInputChange} className="form-input" required />
                </div>
                <div className="form-group">
                    <label htmlFor="legalName">Legal Name</label>
                    <input type="text" id="legalName" name="legalName" value={formData.legalName} onChange={handleInputChange} className="form-input" required />
                </div>
                <div className="form-group">
                    <label htmlFor="alternativeName">Alternative Name</label>
                    <input type="text" id="alternativeName" name="alternativeName" value={formData.alternativeName} onChange={handleInputChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} className="form-input" required />
                </div>
                <div className="form-group">
                    <label htmlFor="taxNumber">Tax Number</label>
                    <input type="text" id="taxNumber" name="taxNumber" value={formData.taxNumber} onChange={handleInputChange} className="form-input" required />
                </div>
                <div className="form-group">
                    <label>Representatives</label>
                    {/* Dropdown to select existing representative */}
                    <div style={{ marginBottom: '8px' }}>
                        <select value={selectedRepId} onChange={handleSelectRep} className="form-input">
                            <option value="">Select existing representative...</option>
                            {existingReps.map(rep => (
                                <option key={rep.id || rep.Id} value={rep.id || rep.Id}>
                                    {rep.name || rep.Name} ({rep.citizenId || rep.CitizenId})
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Show only selected representatives in a read-only table */}
                    {formData.representatives.length > 0 && (
                        <div>
                            {formData.representatives.map((rep, idx) => (
                                <div key={idx} className="rep-fields" style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                                    <input type="text" name="name" value={rep.name} className="form-input" readOnly />
                                    <input type="text" name="citizenId" value={rep.citizenId} className="form-input" readOnly />
                                    <input type="text" name="nationality" value={rep.nationality} className="form-input" readOnly />
                                    <input type="email" name="email" value={rep.email} className="form-input" readOnly />
                                    <input type="text" name="phone" value={rep.phone} className="form-input" readOnly />
                                    <button type="button" className="remove-btn" onClick={() => handleRemoveRep(idx)} style={{ fontSize: '1.2em' }}>🗑️</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>Register Organization</button>
                </div>
            </form>
        </div>
    );
};

console.log('RegisterOrganizationForm component loaded!');
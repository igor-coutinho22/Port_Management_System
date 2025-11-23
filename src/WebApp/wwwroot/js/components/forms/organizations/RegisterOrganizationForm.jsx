// Register Organization Form Component
console.log('RegisterOrganizationForm component loading...');

const RegisterOrganizationForm = ({ onSuccess }) => {
    const { t } = useTranslation();
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
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    
    // Helper to extract attribute values reliably (handling PascalCase and camelCase)
    const getAttr = (obj, key) => obj?.[key] || obj?.[key.charAt(0).toUpperCase() + key.slice(1)];


    React.useEffect(() => {
        // Load existing representatives on mount
        apiService.getRepresentatives().then(setExistingReps).catch(() => setExistingReps([]));
    }, []);

    const handleSelectRep = (e) => {
        const repId = e.target.value;
        setSelectedRepId(repId);
        if (!repId) return;
        
        const selectedRepData = existingReps.find(rep => getAttr(rep, 'id') === repId);

        // Prevent duplicates using Citizen ID as unique key
        if (selectedRepData) {
            const citizenId = getAttr(selectedRepData, 'citizenId');
            if (formData.representatives.some(r => r.citizenId === citizenId)) {
                return;
            }

            setFormData(prev => ({
                ...prev,
                representatives: [
                    ...prev.representatives,
                    {
                        id: getAttr(selectedRepData, 'id') || '',
                        name: getAttr(selectedRepData, 'name') || '',
                        citizenId: citizenId || '',
                        nationality: getAttr(selectedRepData, 'nationality') || '',
                        email: getAttr(selectedRepData, 'email') || '',
                        phone: getAttr(selectedRepData, 'phone') || ''
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        
        try {
            if (!formData.identifier.trim()) throw new Error(t('organizations.forms.register.error.required.identifier'));
            if (!formData.legalName.trim()) throw new Error(t('organizations.forms.register.error.required.legalName'));
            if (!formData.address.trim()) throw new Error(t('organizations.forms.register.error.required.address'));
            if (!formData.taxNumber.trim()) throw new Error(t('organizations.forms.register.error.required.taxNumber'));
            if (formData.representatives.length === 0) throw new Error(t('organizations.forms.register.error.required.reps'));
            
            // Prepare DTO for backend
            const dto = {
                Identifier: formData.identifier,
                LegalName: formData.legalName,
                AlternativeName: formData.alternativeName,
                Address: formData.address,
                TaxNumber: formData.taxNumber,
                Representatives: formData.representatives.map(r => ({
                    Id: r.id || undefined,
                    Name: r.name,
                    CitizenId: r.citizenId,
                    Nationality: r.nationality,
                    Email: r.email,
                    Phone: r.phone
                }))
            };
            
            await apiService.createOrganization(dto);
            
            setMessage({ type: 'success', text: t('organizations.forms.register.success') });
            
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
            setMessage({ type: 'error', text: error.message || t('organizations.forms.register.error.failed') });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('organizations.forms.register.title')}</h4>
                <p>{t('organizations.forms.register.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSubmit} className="register-form">
                <div className="form-group">
                    <label htmlFor="identifier">{t('organizations.forms.register.identifier.label')}</label>
                    <input type="text" id="identifier" name="identifier" value={formData.identifier} onChange={handleInputChange} className="form-input" required />
                </div>
                <div className="form-group">
                    <label htmlFor="legalName">{t('organizations.forms.register.legalName.label')}</label>
                    <input type="text" id="legalName" name="legalName" value={formData.legalName} onChange={handleInputChange} className="form-input" required />
                </div>
                <div className="form-group">
                    <label htmlFor="alternativeName">{t('organizations.forms.register.altName.label')}</label>
                    <input type="text" id="alternativeName" name="alternativeName" value={formData.alternativeName} onChange={handleInputChange} className="form-input" />
                </div>
                <div className="form-group">
                    <label htmlFor="address">{t('organizations.forms.register.address.label')}</label>
                    <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} className="form-input" required />
                </div>
                <div className="form-group">
                    <label htmlFor="taxNumber">{t('organizations.forms.register.taxNumber.label')}</label>
                    <input type="text" id="taxNumber" name="taxNumber" value={formData.taxNumber} onChange={handleInputChange} className="form-input" required />
                </div>
                <div className="form-group">
                    <label>{t('organizations.forms.register.reps.label')}</label>
                    {/* Dropdown to select existing representative */}
                    <div style={{ marginBottom: '8px' }}>
                        <select value={selectedRepId} onChange={handleSelectRep} className="form-input" disabled={isLoading}>
                            <option value="">{t('organizations.forms.register.reps.select_placeholder')}</option>
                            {existingReps.map(rep => (
                                <option key={getAttr(rep, 'id')} value={getAttr(rep, 'id')}>
                                    {/* Attributes (name, citizenId) are NOT translated */}
                                    {getAttr(rep, 'name')} ({getAttr(rep, 'citizenId')})
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Show only selected representatives in a read-only table */}
                    {formData.representatives.length > 0 && (
                        <div>
                            {formData.representatives.map((rep, idx) => (
                                <div key={idx} className="rep-fields" style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                                    <input type="text" name="name" value={rep.name} placeholder={t('representativesHubPage.table.name')} className="form-input" readOnly />
                                    <input type="text" name="citizenId" value={rep.citizenId} placeholder={t('representativesHubPage.table.citizenId')} className="form-input" readOnly />
                                    <input type="text" name="nationality" value={rep.nationality} placeholder={t('representativesHubPage.table.nationality')} className="form-input" readOnly />
                                    <input type="email" name="email" value={rep.email} placeholder={t('representativesHubPage.table.email')} className="form-input" readOnly />
                                    <input type="text" name="phone" value={rep.phone} placeholder={t('representativesHubPage.table.phone')} className="form-input" readOnly />
                                    <button type="button" className="remove-btn" onClick={() => handleRemoveRep(idx)} style={{ fontSize: '1.2em' }}>🗑️</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (<><span className="loading-spinner"></span>{t('common.loading')}</>) : (<>{t('organizations.forms.register.submit')}</>)}
                    </button>
                </div>
            </form>
        </div>
    );
}

console.log('RegisterOrganizationForm component loaded!');
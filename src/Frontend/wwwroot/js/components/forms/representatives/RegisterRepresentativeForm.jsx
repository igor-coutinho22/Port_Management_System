// Register Representative Form Component

function RegisterRepresentativeForm({ onSuccess }) {
    const { t } = useTranslation();
    const [formData, setFormData] = React.useState({
        organizationId: '',
        name: '',
        citizenId: '',
        nationality: '',
        email: '',
        phone: ''
    });
    const [organizations, setOrganizations] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // Helper to extract attribute values reliably (handling PascalCase and camelCase)
    const getAttr = (obj, key) => obj?.[key] || obj?.[key.charAt(0).toUpperCase() + key.slice(1)];


    React.useEffect(() => {
        const fetchOrganizations = async () => {
            try {
                const orgs = await apiService.getOrganizations();
                setOrganizations(orgs);
            } catch (error) {
                // TRANSLATED: Fallback message for error loading organizations
                setMessage({ type: 'error', text: t('organizations.error_loading') });
                setOrganizations([]);
            }
        };
        fetchOrganizations();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleClear = () => {
        setFormData({ organizationId: '', name: '', citizenId: '', nationality: '', email: '', phone: '' });
        setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // TRANSLATED: Validation messages
            if (!formData.organizationId) {
                throw new Error(t('representatives.forms.register.error.required.organization'));
            }
            if (!formData.name?.trim()) { 
                throw new Error(t('representatives.forms.register.name.label') + t('common.error.required'));
            }
            
            // Logic unchanged for DTO creation
            const representativeData = {
                Name: formData.name.trim(),
                CitizenId: formData.citizenId.trim(),
                Nationality: formData.nationality.trim(),
                Email: formData.email.trim(),
                Phone: formData.phone.trim()
            };

            await apiService.createRepresentative(formData.organizationId, representativeData);
            
            setMessage({ type: 'success', text: t('representatives.forms.register.success') });
            
            if (onSuccess) onSuccess();

        } catch (error) {
            // TRANSLATED: Error handling
            let errorText = error?.message || t('representatives.forms.register.error.failed');
            setMessage({ type: 'error', text: errorText });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container representative-form">
            <div className="form-header">
                <h4>{t('representatives.forms.register.title')}</h4>
                <p>{t('representatives.forms.register.description')}</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={handleSubmit} className="representative-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="organizationId">
                            {t('representatives.forms.register.organization.label')} <span className="required">*</span>
                        </label>
                        <select
                            id="organizationId"
                            name="organizationId"
                            value={formData.organizationId}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                            disabled={organizations.length === 0}
                        >
                            <option value="" disabled>{t('representatives.forms.register.organization.select_placeholder')}</option>
                            {organizations.map(org => (
                                // Attribute values (id, legalName) are NOT translated
                                <option key={getAttr(org, 'id')} value={getAttr(org, 'id')}>{getAttr(org, 'legalName')}</option>
                            ))}
                        </select>
                        <small className="form-help">{t('representatives.forms.register.organization.help')}</small>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="name">
                            {t('representatives.forms.register.name.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder={t('representatives.forms.register.name.placeholder')}
                            className="form-input"
                            maxLength={120}
                            required
                        />
                        <small className="form-help">{t('representatives.forms.register.name.help')}</small>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="citizenId">
                            {t('representatives.forms.register.citizenId.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="citizenId"
                            name="citizenId"
                            value={formData.citizenId}
                            onChange={handleInputChange}
                            placeholder={t('representatives.forms.register.citizenId.placeholder')}
                            className="form-input"
                            maxLength={64}
                            required
                        />
                        <small className="form-help">{t('representatives.forms.register.citizenId.help')}</small>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="nationality">
                            {t('representatives.forms.register.nationality.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="nationality"
                            name="nationality"
                            value={formData.nationality}
                            onChange={handleInputChange}
                            placeholder={t('representatives.forms.register.nationality.placeholder')}
                            className="form-input"
                            maxLength={3}
                            required
                        />
                        <small className="form-help">{t('representatives.forms.register.nationality.help')}</small>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">
                            {t('representatives.forms.register.email.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder={t('representatives.forms.register.email.placeholder')}
                            className="form-input"
                            maxLength={200}
                            required
                        />
                        <small className="form-help">{t('representatives.forms.register.email.help')}</small>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="phone">
                            {t('representatives.forms.register.phone.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder={t('representatives.forms.register.phone.placeholder')}
                            className="form-input"
                            maxLength={32}
                            required
                        />
                        <small className="form-help">{t('representatives.forms.register.phone.help')}</small>
                    </div>
                </div>
                
                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading-spinner"></span>
                                {t('representatives.forms.register.registering')}
                            </>
                        ) : (
                            <>
                                <span>👤</span>
                                {t('representatives.forms.register.submit')}
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        className="clear-btn"
                        onClick={handleClear}
                        disabled={isLoading}
                    >
                        <span>🧹</span>
                        {t('representatives.forms.register.clear')}
                    </button>
                </div>
            </form>
        </div>
    );
}

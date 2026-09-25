// Register Staff Form Component

const RegisterStaffForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = React.useState({
        mecanographicNumber: '',
        shortName: '',
        email: '',
        phone: '',
        status: 'Available',
        operationalWindow: ''
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // Validate required fields (LOGIC UNCHANGED)
            if (!formData.mecanographicNumber?.trim()) throw new Error(t('staff.forms.register.error.mec_number_required'));
            if (!formData.shortName?.trim()) throw new Error(t('staff.forms.register.error.name_required'));
            if (!formData.email?.trim()) throw new Error(t('staff.forms.register.error.email_required'));
            if (!formData.phone?.trim()) throw new Error(t('staff.forms.register.error.phone_required'));
            if (!formData.operationalWindow?.trim()) throw new Error(t('staff.forms.register.error.window_required'));

            // Transform data to match backend DTO expectations (LOGIC UNCHANGED)
            const staffData = {
                MecanographicNumber: formData.mecanographicNumber.trim(),
                ShortName: formData.shortName.trim(),
                Email: formData.email.trim(),
                Phone: formData.phone.trim(),
                Status: formData.status,
                OperationalWindow: formData.operationalWindow.trim()
            };

            await apiService.createStaff(staffData);
            
            setMessage({ type: 'success', text: t('staff.forms.register.success') });
            
            // Reset form (LOGIC UNCHANGED)
            setFormData({
                mecanographicNumber: '',
                shortName: '',
                email: '',
                phone: '',
                status: 'Available',
                operationalWindow: ''
            });
            
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error registering staff:', error);
            setMessage({ type: 'error', text: error.message || t('staff.forms.register.error.failed') });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setFormData({
            mecanographicNumber: '',
            shortName: '',
            email: '',
            phone: '',
            status: 'Available',
            operationalWindow: ''
        });
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container staff-form">
            <div className="form-header">
                <h4>{t('staff.forms.register.title')}</h4>
                <p>{t('staff.forms.register.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSubmit} className="staff-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="mecanographicNumber">
                            {t('staff.forms.register.mec_number.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="mecanographicNumber"
                            name="mecanographicNumber"
                            value={formData.mecanographicNumber}
                            onChange={handleInputChange}
                            placeholder={t('staff.forms.register.mec_number.placeholder')}
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('staff.forms.register.mec_number.help')}</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="shortName">
                            {t('staff.forms.register.name.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="shortName"
                            name="shortName"
                            value={formData.shortName}
                            onChange={handleInputChange}
                            placeholder={t('staff.forms.register.name.placeholder')}
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('staff.forms.register.name.help')}</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">
                            {t('staff.forms.register.email.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder={t('staff.forms.register.email.placeholder')}
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('staff.forms.register.email.help')}</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">
                            {t('staff.forms.register.phone.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder={t('staff.forms.register.phone.placeholder')}
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('staff.forms.register.phone.help')}</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">
                            {t('staff.forms.register.status.label')} <span className="required">*</span>
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="form-select"
                            required
                        >
                            <option value="Available">{t('staff.forms.register.status.available')}</option>
                            <option value="Unavailable">{t('staff.forms.register.status.unavailable')}</option>
                        </select>
                        <small className="form-help">{t('staff.forms.register.status.help')}</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="operationalWindow">
                            {t('staff.forms.register.window.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="operationalWindow"
                            name="operationalWindow"
                            value={formData.operationalWindow}
                            onChange={handleInputChange}
                            placeholder={t('staff.forms.register.window.placeholder')}
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('staff.forms.register.window.help')}</small>
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="loading-spinner"></span>
                                {t('staff.forms.register.registering')}
                            </>
                        ) : (
                            <>
                                <span>🏗️</span>
                                {t('staff.forms.register.submit')}
                            </>
                        )}
                    </button>
                    <button 
                        type="button" 
                        className="clear-btn"
                        onClick={handleClear}
                    >
                        <span>🧹</span>
                        {t('common.clear')}
                    </button>
                </div>
            </form>
        </div>
    );
}

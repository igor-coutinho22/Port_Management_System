// Register Qualification Form Component
console.log('📝 RegisterQualificationForm component loading...');

const RegisterQualificationForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = React.useState({
        code: '',
        name: ''
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

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
            if (!formData.code?.trim()) throw new Error(t('qualifications.forms.register.error.code_required'));
            if (!formData.name?.trim()) throw new Error(t('qualifications.forms.register.error.name_required'));

            const qualificationData = {
                Code: formData.code.trim(),
                Name: formData.name.trim()
            };
            
            await apiService.registerQualification(qualificationData);
            
            setMessage({ type: 'success', text: t('qualifications.forms.register.success') });
            
            setFormData({ code: '', name: '' });
            if (onSuccess) onSuccess();

        } catch (error) {
            let errorText = error.message || t('qualifications.forms.register.error.failed_generic');
            
            // Logic to show a specific message for duplicate code (if the backend returns it in a complex string)
            if (errorText.includes("Qualification with code") && errorText.includes("already exists")) {
                errorText = t('qualifications.forms.register.error.code_exists');
            }
            
            setMessage({ type: 'error', text: errorText });
            
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleClear = () => {
        setFormData({ code: '', name: '' });
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container qualification-form">
            <div className="form-header">
                <h4>{t('qualifications.forms.register.title')}</h4>
                <p>{t('qualifications.forms.register.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSubmit} className="qualification-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="code">
                            {t('qualifications.forms.register.code.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="code"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            placeholder={t('qualifications.forms.register.code.placeholder')}
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('qualifications.forms.register.code.help')}</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">
                            {t('qualifications.forms.register.name.label')} <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder={t('qualifications.forms.register.name.placeholder')}
                            className="form-input"
                            required
                        />
                        <small className="form-help">{t('qualifications.forms.register.name.help')}</small>
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (
                            <><span className="loading-spinner"></span>{t('qualifications.forms.register.registering')}</>
                        ) : (
                            <>{t('qualifications.forms.register.submit')}</>
                        )}
                    </button>
                    <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                        <span>🧹</span>{t('common.clear')}
                    </button>
                </div>
            </form>
        </div>
    );
}

console.log('RegisterQualificationForm component loaded! 📝');
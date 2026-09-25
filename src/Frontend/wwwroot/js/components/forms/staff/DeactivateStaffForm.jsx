// Deactivate Staff Form Component

const DeactivateStaffForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [number, setNumber] = React.useState('');
    const [isDeactivating, setIsDeactivating] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        setNumber(e.target.value);
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleDeactivate = async (e) => {
        e.preventDefault();
        const staffNumber = number.trim();

        if (!staffNumber) {
            setMessage({ type: 'error', text: t('staff.forms.deactivate.error.required') });
            return;
        }
        setIsDeactivating(true);
        setMessage({ type: '', text: '' });
        try {
            await apiService.deactivateStaff(staffNumber);
            
            setMessage({ type: 'success', text: t('staff.forms.deactivate.success', { number: staffNumber }) });
            
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);
            
        } catch (error) {
            if (error.message && error.message.toLowerCase().includes('not found')) {
                setMessage({ type: 'info', text: t('staff.forms.deactivate.error.not_found', { number: staffNumber }) });
            } else {
                setMessage({ type: 'error', text: error.message || t('staff.forms.deactivate.error.failed') });
            }
        } finally {
            setIsDeactivating(false);
        }
    };

    const handleClear = () => {
        setNumber('');
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('staff.forms.deactivate.title')}</h4>
                <p>{t('staff.forms.deactivate.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleDeactivate} className="search-form">
                <div className="form-group">
                    <label htmlFor="deactivateMecanographicNumber">{t('staff.forms.deactivate.number.label')}</label>
                    <input
                        type="text"
                        id="deactivateMecanographicNumber"
                        name="deactivateMecanographicNumber"
                        value={number}
                        onChange={handleInputChange}
                        placeholder={t('staff.forms.deactivate.number.placeholder')}
                        className="form-input"
                    />
                </div>
                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isDeactivating}
                    >
                        {isDeactivating ? (<><span className="loading-spinner"></span>{t('staff.forms.deactivate.deactivating')}</>) : (<>{t('staff.forms.deactivate.submit')}</>)}
                    </button>
                    <button
                        type="button"
                        className="clear-btn"
                        onClick={handleClear}
                        disabled={isDeactivating}
                    >
                        <span>🧹</span>
                        {t('staff.forms.deactivate.clear')}
                    </button>
                </div>
            </form>
        </div>
    );
}

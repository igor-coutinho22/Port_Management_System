// Activate Staff Form Component
console.log('ActivateStaffForm component loading...');

const ActivateStaffForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [number, setNumber] = React.useState('');
    const [isActivating, setIsActivating] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        setNumber(e.target.value);
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleActivate = async (e) => {
        e.preventDefault();
        const staffNumber = number.trim();

        if (!staffNumber) {
            setMessage({ type: 'error', text: t('staff.forms.activate.error.required') });
            return;
        }
        setIsActivating(true);
        setMessage({ type: '', text: '' });
        try {
            await apiService.activateStaff(staffNumber);
            
            setMessage({ type: 'success', text: t('staff.forms.activate.success', { number: staffNumber }) });
            
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);
            
        } catch (error) {
            // If staff not found, show info message like other forms
            if (error.message && error.message.toLowerCase().includes('not found')) {
                setMessage({ type: 'info', text: t('staff.forms.activate.error.not_found', { number: staffNumber }) });
            } else {
                setMessage({ type: 'error', text: error.message || t('staff.forms.activate.error.failed') });
            }
        } finally {
            setIsActivating(false);
        }
    };

    const handleClear = () => {
        setNumber('');
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('staff.forms.activate.title')}</h4>
                <p>{t('staff.forms.activate.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleActivate} className="search-form">
                <div className="form-group">
                    <label htmlFor="activateMecanographicNumber">{t('staff.forms.activate.number.label')}</label>
                    <input
                        type="text"
                        id="activateMecanographicNumber"
                        name="activateMecanographicNumber"
                        value={number}
                        onChange={handleInputChange}
                        placeholder={t('staff.forms.activate.number.placeholder')}
                        className="form-input"
                    />
                </div>
                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isActivating}
                    >
                        {isActivating ? (<><span className="loading-spinner"></span>{t('staff.forms.activate.activating')}</>) : (<>{t('staff.forms.activate.submit')}</>)}
                    </button>
                    <button
                        type="button"
                        className="clear-btn"
                        onClick={handleClear}
                        disabled={isActivating}
                    >
                        <span>🧹</span>
                        {t('staff.forms.activate.clear')}
                    </button>
                </div>
            </form>
        </div>
    );
}

console.log('ActivateStaffForm component loaded!');
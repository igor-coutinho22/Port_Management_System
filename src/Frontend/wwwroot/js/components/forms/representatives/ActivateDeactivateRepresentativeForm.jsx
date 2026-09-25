// Activate/Deactivate Representative Form Component

const ActivateDeactivateRepresentativeForm = ({ onSuccess }) => {
    const { t } = useTranslation();

    // Helper to extract attribute values reliably (handling PascalCase and camelCase)
    const getAttr = (obj, key) => obj?.[key] || obj?.[key.charAt(0).toUpperCase() + key.slice(1)];
    
    const [step, setStep] = React.useState(1); // 1: enter ID, 2: confirm
    const [repId, setRepId] = React.useState('');
    const [rep, setRep] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // Step 1: Validate rep ID and fetch rep
    const handleRepIdSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        
        try {
            if (!repId.trim()) throw new Error(t('representatives.forms.manage_status.search_error.required'));

            const representative = await apiService.getRepresentativeById(repId.trim());
            
            if (!representative) throw new Error(t('representatives.forms.manage_status.search_error.not_found'));
            
            // Ensure ID is present for display/API calls
            const repWithId = { ...representative, id: repId.trim() };
            setRep(repWithId);
            setStep(2);
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.message || t('representatives.forms.manage_status.search_error.not_found') 
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Confirm activate/deactivate
    const handleConfirm = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        
        try {
            if (!rep) throw new Error(t('representatives.forms.manage_status.confirm.no_rep_loaded'));

            const repCurrentId = getAttr(rep, 'id');
            const isActive = getAttr(rep, 'isActive');
            let successMessage;
            
            if (isActive) {
                await apiService.deactivateRepresentative(repCurrentId);
                successMessage = t('representatives.forms.manage_status.success.deactivated');
            } else {
                await apiService.activateRepresentative(repCurrentId);
                successMessage = t('representatives.forms.manage_status.success.activated');
            }
            
            setMessage({ type: 'success', text: successMessage });
            
            if (onSuccess) onSuccess();
            
            setTimeout(() => {
                handleClear();
            }, 2000);
            
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.message || t('representatives.forms.manage_status.operation_failed') 
            });
        } finally {
            if (message.type !== 'success') {
                 setIsLoading(false);
            }
        }
    };

    const handleClear = () => {
        setStep(1);
        setRepId('');
        setRep(null);
        setMessage({ type: '', text: '' });
        setIsLoading(false);
    };

    // Extract attributes for display (UNTRANSLATED VALUES)
    const repName = getAttr(rep, 'name');
    const repDisplayId = getAttr(rep, 'id') || repId;
    const repIsActive = getAttr(rep, 'isActive');
    
    // Determine dynamic text based on current status
    const statusStyle = repIsActive ? '#2ecc40' : '#e74c3c';
    const statusTextKey = repIsActive ? 'representatives.forms.manage_status.confirm.status_active' : 'representatives.forms.manage_status.confirm.status_inactive';
    const actionTextKey = repIsActive ? 'representatives.forms.manage_status.confirm.button_deactivate' : 'representatives.forms.manage_status.confirm.button_activate';
    const questionTextKey = repIsActive ? 'representatives.forms.manage_status.confirm.question_deactivate' : 'representatives.forms.manage_status.confirm.question_activate';
    
    // Placeholder required for dynamic text in JSX
    const activationVerb = repIsActive ? t('common.deactivate') : t('common.activate');


    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('representatives.forms.manage_status.title')}</h4>
                <p>{t('representatives.forms.manage_status.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {step === 1 && (
                <form onSubmit={handleRepIdSubmit} className="search-form">
                    <div className="form-group">
                        <label htmlFor="repId">{t('representatives.forms.manage_status.id.label')}</label>
                        <input
                            type="text"
                            id="repId"
                            name="repId"
                            value={repId}
                            onChange={e => {setRepId(e.target.value); setMessage({ type: '', text: '' });}}
                            placeholder={t('representatives.forms.manage_status.id.placeholder')}
                            className="form-input"
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>{t('common.loading')}</>) : (<><span>🔍</span>{t('representatives.forms.manage_status.search_button')}</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>{t('representatives.forms.manage_status.cancel')}
                        </button>
                    </div>
                </form>
            )}
            {step === 2 && rep && (
                <form onSubmit={handleConfirm} className="confirm-form">
                    <div className="form-section-header" style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'flex-start', background: 'var(--plane-bg, #0a1a2f)', borderRadius: '10px', padding: '18px 24px', marginBottom: '18px', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: '1.1em', fontWeight: 600, color: '#fff' }}>
                            {t('representatives.forms.manage_status.confirm.header_label')}: <strong>{repName}</strong> ({t('representativesHubPage.table.id')}: <strong>{repDisplayId}</strong>)
                        </div>
                        <div style={{ fontSize: '1em', fontWeight: 500, color: statusStyle, background: 'rgba(0,0,0,0.08)', borderRadius: '6px', padding: '6px 14px', marginTop: '0' }}>
                            {t('representatives.forms.manage_status.confirm.status_label')}: <span style={{ fontWeight: 700 }}>{t(statusTextKey)}</span>
                        </div>
                        <div style={{ fontSize: '1.05em', color: '#fff', marginTop: '0', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '10px 14px', width: '100%' }}>
                            {t(questionTextKey)}
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>{t('representatives.forms.manage_status.processing')}</>) : (<>{t(actionTextKey)}</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>{t('representatives.forms.manage_status.cancel')}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

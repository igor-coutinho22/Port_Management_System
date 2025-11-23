// Activate/Deactivate Organization Form Component
console.log('ActivateDeactivateOrganizationForm component loading...');

const ActivateDeactivateOrganizationForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [step, setStep] = React.useState(1); // 1: enter ID, 2: confirm
    const [orgId, setOrgId] = React.useState('');
    const [org, setOrg] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [confirm, setConfirm] = React.useState(false); // State not used, can be removed but kept here for stability

    // Helper to determine the status and related text/styles
    const isOrgActive = org && (org.isActive || org.IsActive);
    const orgLegalName = org?.legalName || org?.LegalName || '';
    const orgDisplayId = org?.id || org?.Id || orgId;

    // Step 1: Validate org ID and fetch org
    const handleOrgIdSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        
        try {
            if (!orgId.trim()) throw new Error(t('organizations.forms.manage_status.search_error.required'));

            const organization = await apiService.getOrganizationById(orgId.trim());
            
            if (!organization) throw new Error(t('organizations.forms.manage_status.search_error.not_found'));
            
            setOrg(organization);
            setStep(2);
        } catch (error) {
            // Check if the error message is a translated string, otherwise use the fallback
            const errorMessage = error.message.startsWith('Organization') ? error.message : t('organizations.forms.manage_status.search_error.not_found');
            setMessage({ type: 'error', text: errorMessage });
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
            if (!org) throw new Error(t('organizations.forms.manage_status.confirm.no_org_loaded'));

            let successMessage;
            
            if (isOrgActive) {
                // Deactivate
                await apiService.deactivateOrganization(orgDisplayId);
                successMessage = t('organizations.forms.manage_status.success.deactivated');
            } else {
                // Activate
                await apiService.activateOrganization(orgDisplayId);
                successMessage = t('organizations.forms.manage_status.success.activated');
            }
            
            setMessage({ type: 'success', text: successMessage });
            
            if (onSuccess) onSuccess();
            
            setTimeout(() => {
                handleClear();
            }, 2000);
            
        } catch (error) {
            console.error("Operation failed:", error);
            setMessage({ 
                type: 'error', 
                text: error.message || t('organizations.forms.manage_status.operation_failed') 
            });
        } finally {
            // Note: The clear function handles setIsLoading(false) implicitly after timeout
            if (message.type !== 'success') {
                 setIsLoading(false);
            }
        }
    };

    const handleClear = () => {
        setStep(1);
        setOrgId('');
        setOrg(null);
        setConfirm(false);
        setMessage({ type: '', text: '' });
        setIsLoading(false);
    };

    const statusStyle = isOrgActive ? '#2ecc40' : '#e74c3c';
    const statusTextKey = isOrgActive ? 'organizations.forms.manage_status.confirm.status_active' : 'organizations.forms.manage_status.confirm.status_inactive';
    const actionTextKey = isOrgActive ? 'organizations.forms.manage_status.confirm.button_deactivate' : 'organizations.forms.manage_status.confirm.button_activate';
    const questionTextKey = isOrgActive ? 'organizations.forms.manage_status.confirm.question_deactivate' : 'organizations.forms.manage_status.confirm.question_activate';
    
    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('organizations.forms.manage_status.title')}</h4>
                <p>{t('organizations.forms.manage_status.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            
            {step === 1 && (
                <form onSubmit={handleOrgIdSubmit} className="search-form">
                    <div className="form-group">
                        <label htmlFor="orgId">{t('organizations.forms.manage_status.id.label')}</label>
                        <input
                            type="text"
                            id="orgId"
                            name="orgId"
                            value={orgId}
                            onChange={e => {setOrgId(e.target.value); setMessage({ type: '', text: '' });}}
                            placeholder={t('organizations.forms.manage_status.id.placeholder')}
                            className="form-input"
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>{t('common.loading')}</>) : (<><span>🔍</span>{t('organizations.forms.manage_status.search_button')}</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>{t('common.cancel')}
                        </button>
                    </div>
                </form>
            )}
            
            {step === 2 && org && (
                <form onSubmit={handleConfirm} className="confirm-form">
                    <div className="form-section-header" style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'flex-start', background: 'var(--plane-bg, #0a1a2f)', borderRadius: '10px', padding: '18px 24px', marginBottom: '18px', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: '1.1em', fontWeight: 600, color: '#fff' }}>
                            {/* FIX: Use standard translation keys for Legal Name and ID */}
                            {t('organizationsHubPage.table.legalName')}: {orgLegalName} ({t('organizationsHubPage.table.id')}: {orgDisplayId})
                        </div>
                        <div style={{ fontSize: '1em', fontWeight: 500, color: statusStyle, background: 'rgba(0,0,0,0.08)', borderRadius: '6px', padding: '6px 14px', marginTop: '0' }}>
                            {t('organizations.forms.manage_status.confirm.status_label')}: <span style={{ fontWeight: 700 }}>{t(statusTextKey)}</span>
                        </div>
                        <div style={{ fontSize: '1.05em', color: '#fff', marginTop: '0', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '10px 14px', width: '100%' }}>
                            {t(questionTextKey, { status: t(statusTextKey).toLowerCase() })}
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>{t('organizations.forms.manage_status.processing')}</>) : (<>{t(actionTextKey)}</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>{t('common.cancel')}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

console.log('ActivateDeactivateOrganizationForm component loaded!');
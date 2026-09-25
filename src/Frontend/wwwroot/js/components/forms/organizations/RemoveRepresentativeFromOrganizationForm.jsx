// Remove Representative From Organization Form Component

const RemoveRepresentativeFromOrganizationForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [orgId, setOrgId] = React.useState('');
    const [org, setOrg] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search');
    const [selectedRepId, setSelectedRepId] = React.useState('');
    const [selectedRep, setSelectedRep] = React.useState(null);

    // Helper to extract attribute values reliably (handling PascalCase and camelCase)
    const getAttr = (obj, key) => obj?.[key] || obj?.[key.charAt(0).toUpperCase() + key.slice(1)];
    
    const handleOrgIdChange = (e) => {
        setOrgId(e.target.value);
        setMessage({ type: '', text: '' });
    };

    const isValidGuid = (guid) => {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return guidRegex.test(guid);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!orgId.trim()) {
            setMessage({ type: 'error', text: t('organizations.forms.remove_rep.search_error.required') });
            return;
        }
        if (!isValidGuid(orgId.trim())) {
            setMessage({ type: 'error', text: t('organizations.forms.remove_rep.search_error.format') });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setOrg(null);
        try {
            const data = await apiService.getOrganizationById(orgId.trim());
            if (data) {
                // Ensure org ID is present for consistency
                const orgWithId = { ...data, id: data.id || orgId.trim() };
                setOrg(orgWithId);
                setStep('remove');
            } else {
                setMessage({ type: 'info', text: t('organizations.forms.remove_rep.search_error.not_found') });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || t('organizations.forms.remove_rep.search_error.failed') });
        } finally {
            setIsLoading(false);
        }
    };

    // Only allow selection of representatives already assigned to the org
    const getAssignedReps = () => {
        if (!org || !org.representatives) return [];
        return org.representatives;
    };

    const handleSelectRep = (e) => {
        const repId = e.target.value;
        setSelectedRepId(repId);
        setMessage({ type: '', text: '' });
        if (!repId) {
            setSelectedRep(null);
            return;
        }
        const rep = getAssignedReps().find(r => (getAttr(r, 'id')) === repId);
        setSelectedRep(rep || null);
    };

    const handleRemoveRepresentative = async (e) => {
        e.preventDefault();
        if (!selectedRepId || !selectedRep) {
            setMessage({ type: 'error', text: t('organizations.forms.remove_rep.error.no_rep_selected') });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // Backend expects DELETE /organizations/{id}/remove with repId in body
            await apiService.removeRepresentativeFromOrganization(orgId.trim(), selectedRep.id || selectedRep.Id || '');
            
            setMessage({ type: 'success', text: t('organizations.forms.remove_rep.success') });
            
            // Reload org, reset selection
            const data = await apiService.getOrganizationById(orgId.trim());
            setOrg(data);
            setSelectedRepId('');
            setSelectedRep(null);
            if (onSuccess) onSuccess();

        } catch (error) {
            setMessage({ type: 'error', text: error.message || t('organizations.forms.remove_rep.error.failed') });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setOrgId('');
        setOrg(null);
        setSelectedRepId('');
        setSelectedRep(null);
        setMessage({ type: '', text: '' });
        setStep('search');
        setIsLoading(false);
    };

    const orgLegalName = getAttr(org, 'legalName');
    const orgDisplayId = getAttr(org, 'id') || orgId;

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('organizations.forms.remove_rep.title')}</h4>
                <p>{t('organizations.forms.remove_rep.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-group">
                        <label htmlFor="orgId">{t('organizations.forms.remove_rep.id.label')}</label>
                        <input
                            type="text"
                            id="orgId"
                            name="orgId"
                            value={orgId}
                            onChange={handleOrgIdChange}
                            placeholder={t('organizations.forms.remove_rep.id.placeholder')}
                            className="form-input"
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>{t('common.loading')}</>) : (<><span>🔍</span>{t('organizations.forms.remove_rep.search_button')}</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>{t('organizations.forms.remove_rep.cancel')}
                        </button>
                    </div>
                </form>
            )}
            {step === 'remove' && org && (
                <form onSubmit={handleRemoveRepresentative} className="remove-rep-form">
                    <div className="form-section-header">
                        {/* Header built with translated labels and untranslated attributes */}
                        <h5>
                            {t('organizationsHubPage.table.legalName')}: <strong>{orgLegalName}</strong> ({t('organizationsHubPage.table.id')}: <strong>{orgDisplayId}</strong>)
                        </h5>
                        <p>{t('organizations.forms.remove_rep.select.desc')}</p>
                    </div>
                    
                    <div className="form-group" style={{ marginBottom: '18px' }}>
                        <label htmlFor="selectRep">{t('organizations.forms.remove_rep.select.title')}</label>
                        <select id="selectRep" value={selectedRepId} onChange={handleSelectRep} className="form-input" disabled={isLoading}>
                            <option value="">{t('organizations.forms.remove_rep.select.placeholder')}</option>
                            {getAssignedReps().map(rep => (
                                <option key={getAttr(rep, 'id')} value={getAttr(rep, 'id')}>
                                    {/* Attributes (name, citizenId) are NOT translated */}
                                    {getAttr(rep, 'name')} ({getAttr(rep, 'citizenId')})
                                </option>
                            ))}
                        </select>
                        <small className="form-help">
                            {t('common.found') + ' ' + getAssignedReps().length + ' ' + t('entities.representatives') + ' ' + t('common.found') + '.'}
                        </small>
                    </div>

                    {selectedRep && (
                        <div style={{ marginBottom: '18px', padding: '15px', border: '1px solid #1e3a5f', borderRadius: '8px', background: '#0a1a2f' }}>
                            <div className="rep-fields" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                                {/* Placeholders used as read-only labels/context for the data */}
                                <input type="text" name="name" value={getAttr(selectedRep, 'name')} readOnly placeholder={t('representativesHubPage.table.name')} className="form-input" style={{ flex: '1 1 180px', minWidth: '120px', maxWidth: '200px', background: '#0a1a2f80' }} />
                                <input type="text" name="citizenId" value={getAttr(selectedRep, 'citizenId')} readOnly placeholder={t('representativesHubPage.table.citizenId')} className="form-input" style={{ flex: '1 1 120px', minWidth: '100px', maxWidth: '140px', background: '#0a1a2f80' }} />
                                <input type="text" name="nationality" value={getAttr(selectedRep, 'nationality')} readOnly placeholder={t('representativesHubPage.table.nationality')} className="form-input" style={{ flex: '1 1 80px', minWidth: '80px', maxWidth: '100px', background: '#0a1a2f80' }} />
                                <input type="email" name="email" value={getAttr(selectedRep, 'email')} readOnly placeholder={t('representativesHubPage.table.email')} className="form-input" style={{ flex: '2 1 220px', minWidth: '160px', maxWidth: '260px', background: '#0a1a2f80' }} />
                                <input type="text" name="phone" value={getAttr(selectedRep, 'phone')} readOnly placeholder={t('representativesHubPage.table.phone')} className="form-input" style={{ flex: '1 1 120px', minWidth: '100px', maxWidth: '140px', background: '#0a1a2f80' }} />
                            </div>
                        </div>
                    )}

                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading || !selectedRepId}>
                            {isLoading ? (<><span className="loading-spinner"></span>{t('organizations.forms.remove_rep.removing')}</>) : (<>{t('organizations.forms.remove_rep.remove_button')}</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>{t('organizations.forms.remove_rep.cancel')}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

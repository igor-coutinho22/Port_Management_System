// Get Organization by ID Form Component
console.log('GetOrganizationByIdForm component loading...');

const GetOrganizationByIdForm = () => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [organization, setOrganization] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    // Validate GUID format
    const isValidGuid = (guid) => {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return guidRegex.test(guid);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: t('organizations.forms.get_by_id.error.required') });
            return;
        }
        if (!isValidGuid(searchData.id.trim())) {
            setMessage({ type: 'error', text: t('organizations.forms.get_by_id.error.format') });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setOrganization(null);
        try {
            const data = await apiService.getOrganizationById(searchData.id.trim());
            if (data) {
                // Ensure ID is set on the organization object if API doesn't return it
                const orgWithId = { ...data, id: data.id || searchData.id.trim() };
                setOrganization(orgWithId);
                setHasSearched(true);
                setMessage({ type: 'success', text: t('organizations.forms.get_by_id.success') });
            } else {
                setOrganization(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: t('organizations.forms.get_by_id.not_found') });
            }
        } catch (error) {
            console.error('Error fetching organization:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: t('organizations.forms.get_by_id.error.not_found_with_id') });
            } else {
                setMessage({ type: 'error', text: error.message || t('organizations.forms.get_by_id.error.failed') });
            }
            setOrganization(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setOrganization(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    // Helper to extract attribute values reliably (handling PascalCase and camelCase)
    const getAttr = (org, key) => org?.[key] || org?.[key.charAt(0).toUpperCase() + key.slice(1)];

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('organizations.forms.get_by_id.title')}</h4>
                <p>{t('organizations.forms.get_by_id.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchId">{t('organizations.forms.get_by_id.id.label')}</label>
                        <input
                            type="text"
                            id="searchId"
                            name="id"
                            value={searchData.id}
                            onChange={handleInputChange}
                            placeholder={t('organizations.forms.get_by_id.id.placeholder')}
                            className="form-input"
                        />
                        <small className="form-help">{t('organizations.forms.get_by_id.id.help')}</small>
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (<><span className="loading-spinner"></span>{t('common.loading')}</>) : (<><span>🔍</span>{t('organizations.forms.get_by_id.submit')}</>)}
                    </button>
                    <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                        <span>🔄</span>{t('common.clear')}
                    </button>
                </div>
            </form>
            
            {/* Results Section */}
            {hasSearched && organization && (
                <div className="results-section">
                    <div className="results-header">
                        <h4>{t('organizations.forms.get_by_id.results.details_title')}</h4>
                        <span className="results-count">{t('organizationsHubPage.table.id')}: {getAttr(organization, 'id')}</span>
                    </div>
                    <div className="organization-details-card">
                        <div className="organization-header">
                            <h3 className="organization-name">{getAttr(organization, 'legalName')}</h3>
                            <span className="organization-id">{t('organizationsHubPage.table.id')}: {getAttr(organization, 'id')}</span>
                        </div>
                        <div className="organization-info-grid">
                            <div className="info-group">
                                <label>{t('organizationsHubPage.table.identifier')}</label>
                                <span>{getAttr(organization, 'identifier') || t('common.na')}</span>
                            </div>
                            <div className="info-group">
                                <label>{t('organizationsHubPage.table.alternativeNames')}</label>
                                <span>{getAttr(organization, 'alternativeNames') || t('common.na')}</span>
                            </div>
                            <div className="info-group">
                                <label>{t('organizationsHubPage.table.address')}</label>
                                <span>{getAttr(organization, 'address') || t('common.na')}</span>
                            </div>
                            <div className="info-group">
                                <label>{t('organizationsHubPage.table.taxNumber')}</label>
                                <span>{getAttr(organization, 'taxNumber') || t('common.na')}</span>
                            </div>
                            <div className="info-group">
                                <label>{t('organizationsHubPage.table.status')}</label>
                                <span>
                                    {getAttr(organization, 'isActive') 
                                        ? t('organizationsHubPage.table.active') 
                                        : t('organizationsHubPage.table.inactive')
                                    }
                                </span>
                            </div>
                            <div className="info-group full-width">
                                <label>{t('organizationsHubPage.table.representatives')}</label>
                                <div className="representatives-list">
                                    {getAttr(organization, 'representatives') && getAttr(organization, 'representatives').length > 0 ? (
                                        getAttr(organization, 'representatives').map((rep, idx) => (
                                            <div key={idx} className="representative-card" style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <div style={{ minWidth: 180, marginRight: 24 }}>
                                                    <strong>{getAttr(rep, 'name')}</strong> ({getAttr(rep, 'citizenId')})
                                                </div>
                                                <span style={{ marginRight: 12 }}>{getAttr(rep, 'nationality')}</span>
                                                <span style={{ marginRight: 12 }}>{getAttr(rep, 'email')}</span>
                                                <span>{getAttr(rep, 'phone')}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="no-representatives">{t('organizations.forms.get_by_id.reps_none')}</span>
                                    )}
                                </div>
                            </div>
                            <div className="info-group full-width">
                                <label>{t('organizationsHubPage.table.notifications')}</label>
                                <div className="notifications-list">
                                    {getAttr(organization, 'vesselVisitNotifications') && getAttr(organization, 'vesselVisitNotifications').length > 0 ? (
                                        getAttr(organization, 'vesselVisitNotifications').map((notif, idx) => (
                                            <div key={idx} className="notification-card" style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <span style={{ fontFamily: 'monospace', fontSize: '0.9em', color: '#b8eaff' }}>{getAttr(notif, 'id')}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="no-notifications">{t('organizationsHubPage.table.none')}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

console.log('GetOrganizationByIdForm component loaded!');
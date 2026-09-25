// Get Representative by ID Form Component

const GetRepresentativeByIdForm = () => {
    const { t } = useTranslation();
    
    // Helper to extract attribute values reliably (handling PascalCase and camelCase)
    const getAttr = (obj, key) => obj?.[key] || obj?.[key.charAt(0).toUpperCase() + key.slice(1)];

    const [searchData, setSearchData] = React.useState({ id: '' });
    const [representative, setRepresentative] = React.useState(null);
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
        const searchId = searchData.id.trim();

        if (!searchId) {
            setMessage({ type: 'error', text: t('representatives.forms.get_by_id.error.required') });
            return;
        }
        if (!isValidGuid(searchId)) {
            setMessage({ type: 'error', text: t('representatives.forms.get_by_id.error.format') });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setRepresentative(null);
        try {
            const data = await apiService.getRepresentativeById(searchId);
            if (data) {
                // Ensure ID is set on the organization object if API doesn't return it
                const repWithId = { ...data, id: data.id || searchId };
                setRepresentative(repWithId);
                setHasSearched(true);
                setMessage({ type: 'success', text: t('representatives.forms.get_by_id.success') });
            } else {
                setRepresentative(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: t('representatives.forms.get_by_id.not_found') });
            }
        } catch (error) {
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: t('representatives.forms.get_by_id.error.not_found_with_id') });
            } else {
                setMessage({ type: 'error', text: error.message || t('representatives.forms.get_by_id.error.failed') });
            }
            setRepresentative(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setRepresentative(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };
    
    const repName = getAttr(representative, 'name');
    const repDisplayId = getAttr(representative, 'id');
    const repCitizenId = getAttr(representative, 'citizenId');
    const repNationality = getAttr(representative, 'nationality');
    const repEmail = getAttr(representative, 'email');
    const repPhone = getAttr(representative, 'phone');
    const repIsActive = getAttr(representative, 'isActive');
    const repOrgId = getAttr(representative, 'organizationId');

    const statusTextKey = repIsActive === true ? 'representatives.forms.get_by_id.results.status_active' : 'representatives.forms.get_by_id.results.status_inactive';


    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('representatives.forms.get_by_id.title')}</h4>
                <p>{t('representatives.forms.get_by_id.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchId">{t('representatives.forms.get_by_id.id.label')}</label>
                        <input
                            type="text"
                            id="searchId"
                            name="id"
                            value={searchData.id}
                            onChange={handleInputChange}
                            placeholder={t('representatives.forms.get_by_id.id.placeholder')}
                            className="form-input"
                        />
                        <small className="form-help">{t('representatives.forms.get_by_id.id.help')}</small>
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <span className="loading-spinner"></span>
                                {t('common.loading')}
                            </>
                        ) : (
                            <>
                                <span>🎯</span>
                                {t('representatives.forms.get_by_id.submit')}
                            </>
                        )}
                    </button>
                    <button 
                        type="button" 
                        className="clear-btn"
                        onClick={handleClear}
                        disabled={isLoading}
                    >
                        <span>🔄</span>
                        {t('common.clear')}
                    </button>
                </div>
            </form>
            
            {/* Results Section */}
            {hasSearched && representative && (
                <div className="results-section">
                    <div className="results-header">
                        <h4>{t('representatives.forms.get_by_id.results.details_title')}</h4>
                        <span className="results-count">{t('representatives.forms.get_by_id.results.id_prefix')}{repDisplayId}</span>
                    </div>
                    <div className="representative-details-card">
                        <div className="rep-header">
                            <h3 className="rep-name">{repName}</h3>
                            <span className="rep-id">{t('representatives.forms.get_by_id.results.id_prefix')}{repDisplayId}</span>
                        </div>
                        <div className="rep-info-grid">
                            <div className="info-group">
                                <label>{t('representativesHubPage.table.citizenId')}</label>
                                <span>{repCitizenId || t('common.na')}</span>
                            </div>
                            <div className="info-group">
                                <label>{t('representativesHubPage.table.nationality')}</label>
                                <span>{repNationality || t('common.na')}</span>
                            </div>
                            <div className="info-group">
                                <label>{t('representativesHubPage.table.email')}</label>
                                <span>{repEmail || t('common.na')}</span>
                            </div>
                            <div className="info-group">
                                <label>{t('representativesHubPage.table.phone')}</label>
                                <span>{repPhone || t('common.na')}</span>
                            </div>
                            <div className="info-group">
                                <label>{t('representativesHubPage.table.status')}</label>
                                <span>
                                    {repIsActive === true 
                                        ? t(statusTextKey) 
                                        : repIsActive === false 
                                            ? t(statusTextKey) 
                                            : t('common.na')
                                    }
                                </span>
                            </div>
                            <div className="info-group">
                                <label>{t('representativesHubPage.table.organizationId')}</label>
                                <span>{repOrgId || t('representatives.forms.get_by_id.results.organization_none')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

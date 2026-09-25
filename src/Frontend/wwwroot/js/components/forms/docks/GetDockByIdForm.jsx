// Get Dock by ID Form Component

const GetDockByIdForm = () => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        id: ''
    });
    const [dock, setDock] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user starts typing
        if (message.text) setMessage({ type: '', text: '' });
    };

    // Validate GUID format
    const isValidGuid = (guid) => {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return guidRegex.test(guid);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        // Validate ID field
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: t('docks.forms.get_by_id.error.required') });
            return;
        }
        
        if (!isValidGuid(searchData.id.trim())) {
            setMessage({ type: 'error', text: t('docks.forms.get_by_id.error.format') });
            return;
        }
        
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setDock(null);
        
        try {
            const data = await apiService.getDockById(searchData.id.trim());
            if (data) {
                // Add the ID to the dock data since getDockById doesn't return it
                const dockWithId = { ...data, id: searchData.id.trim() };
                setDock(dockWithId);
                setHasSearched(true);
                setMessage({ type: 'success', text: t('docks.forms.get_by_id.success') });
            } else {
                setDock(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: t('docks.forms.get_by_id.not_found') });
            }
        } catch (error) {
            console.error('Error fetching dock:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: t('docks.forms.get_by_id.error.not_found_with_id') });
            } else {
                setMessage({ type: 'error', text: error.message || t('docks.forms.get_by_id.error.failed') });
            }
            setDock(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setDock(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('docks.forms.get_by_id.title')}</h4>
                <p>{t('docks.forms.get_by_id.description')}</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchId">{t('docksHubPage.table.id')}</label>
                        <input
                            type="text"
                            id="searchId"
                            name="id"
                            value={searchData.id}
                            onChange={handleInputChange}
                            placeholder={t('docks.forms.get_by_id.id.placeholder')}
                            className="form-input"
                        />
                        <small className="form-help">{t('docks.forms.get_by_id.id.help')}</small>
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
                                {t('common.loading')}
                            </>
                        ) : (
                            <>
                                <span>🎯</span>
                                {t('docks.forms.get_by_id.submit')}
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
            {hasSearched && dock && (
                <div className="results-section">
                    <div className="results-header">
                        <h4>{t('docks.forms.get_by_id.results.details_title')}</h4>
                        <span className="results-count">{t('docksHubPage.table.id')}: {dock.id}</span>
                    </div>
                    
                    <div className="dock-details-card">
                        <div className="dock-header">
                            <h3 className="dock-name">{dock.name}</h3>
                            <span className="dock-id">{t('docksHubPage.table.id')}: {dock.id}</span>
                        </div>
                        
                        <div className="dock-info-grid">
                            <div className="info-group">
                                <label>{t('docksHubPage.table.location')}</label>
                                <span>{dock.location || t('common.na')}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>{t('docksHubPage.table.length')}</label>
                                <span>{dock.lengthMeters ? `${dock.lengthMeters}${t('docks.details.length_unit')}` : t('common.na')}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>{t('docksHubPage.table.depth')}</label>
                                <span>{dock.depthMeters ? `${dock.depthMeters}${t('docks.details.length_unit')}` : t('common.na')}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>{t('docksHubPage.table.maxDraft')}</label>
                                <span>{dock.maxDraftMeters ? `${dock.maxDraftMeters}${t('docks.details.length_unit')}` : t('common.na')}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>{t('docks.details.dimensions')}</label>
                                <span>
                                    {dock.lengthMeters || 0}{t('docks.details.length_unit')} × 
                                    {dock.depthMeters || 0}{t('docks.details.length_unit')} × 
                                    {dock.maxDraftMeters || 0}{t('docks.details.length_unit')}
                                </span>
                            </div>
                            
                            <div className="info-group full-width">
                                <label>{t('docks.details.allowed_vessel_types')}</label>
                                <div className="vessel-types-list">
                                    {dock.allowedVesselTypes && dock.allowedVesselTypes.length > 0 ? (
                                        dock.allowedVesselTypes.map((vesselType, index) => (
                                            <span key={index} className="vessel-type-tag">
                                                {vesselType}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="no-vessel-types">{t('docks.details.no_vessel_types')}</span>
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

// Get Vessel by IMO Form Component

const GetVesselByImoForm = () => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        imo: ''
    });
    const [vessel, setVessel] = React.useState(null);
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

    const handleSearch = async (e) => {
        e.preventDefault();
        
        // Validate IMO field
        if (!searchData.imo.trim()) {
            setMessage({ type: 'error', text: t('vessels.forms.get_by_imo.error.required') });
            return;
        }
        
        if (!/^\d{7}$/.test(searchData.imo.trim())) {
            setMessage({ type: 'error', text: t('vessels.forms.get_by_imo.error.format') });
            return;
        }
        
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setVessel(null);
        
        try {
            const data = await apiService.getVesselByImo(searchData.imo.trim());
            if (data) {
                setVessel(data);
                setHasSearched(true);
                setMessage({ type: 'success', text: t('vessels.forms.get_by_imo.success') });
            } else {
                setVessel(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: t('vessels.forms.get_by_imo.not_found') });
            }
        } catch (error) {
            console.error('Error fetching vessel:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: t('vessels.forms.get_by_imo.not_found') });
            } else {
                setMessage({ type: 'error', text: error.message || t('vessels.forms.get_by_imo.error.failed') });
            }
            setVessel(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ imo: '' });
        setVessel(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('vessels.forms.get_by_imo.title')}</h4>
                <p>{t('vessels.forms.get_by_imo.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchImo">{t('vessels.forms.get_by_imo.imo.label')}</label>
                        <input
                            type="text"
                            id="searchImo"
                            name="imo"
                            value={searchData.imo}
                            onChange={handleInputChange}
                            placeholder={t('vessels.forms.get_by_imo.placeholder')}
                            maxLength="7"
                            className="form-input"
                        />
                        <small className="form-help">{t('vessels.forms.get_by_imo.help')}</small>
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
                                {t('vessels.forms.get_by_imo.submit')}
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
                        {t('vessels.forms.get_by_imo.clear')}
                    </button>
                </div>
            </form>

            {/* Results Section */}
            {hasSearched && vessel && (
                <div className="results-section">
                    <div className="results-header">
                        <h4>{t('vessels.details.title')}</h4>
                        <span className="results-count">{t('vessels.details.imo')}: {vessel.imo}</span>
                    </div>
                    
                    <div className="vessel-details-card">
                        <div className="vessel-header">
                            <h3 className="vessel-name">{vessel.vesselName}</h3>
                            <span className="vessel-imo">{t('vessels.details.imo')}: {vessel.imo}</span>
                        </div>
                        
                        <div className="vessel-info-grid">
                            <div className="info-group">
                                <label>{t('vessels.details.operator')}</label>
                                <span>{vessel.operatorName || 'N/A'}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>{t('vessels.details.type')}</label>
                                <span>{vessel.vesselTypeName || 'N/A'}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>{t('vessels.details.crane_count')}</label>
                                <span>{vessel.requiredCraneCount || 'N/A'}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>{t('vessels.details.dock_length')}</label>
                                <span>{vessel.requiredDockLength || 'N/A'}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>Bays</label>
                                <span>{vessel.bays || 'N/A'}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>Rows</label>
                                <span>{vessel.rows || 'N/A'}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>Tiers</label>
                                <span>{vessel.tiers || 'N/A'}</span>
                            </div>
                            
                            <div className="info-group">
                                <label>Dimensions</label>
                                <span>{(vessel.bays || 0)}×{(vessel.rows || 0)}×{(vessel.tiers || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

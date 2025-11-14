// Search Vessels Form Component
console.log('🔍 SearchVesselsForm component loading...');

const SearchVesselsForm = () => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        name: '',
        operatorName: ''
    });
    const [searchResults, setSearchResults] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // Helper to get color for message type
    const getMessageColor = (type) => {
        if (type === 'error') return 'red';
        if (type === 'success') return 'green';
        if (type === 'info') return '#0074D9'; // blue
        return 'inherit';
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user starts typing
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleViewDetails = async (vesselImo) => {
        try {
            const vessel = await apiService.getVesselByImo(vesselImo);
            alert(`${t('vessels.details.title')}:\n\n${t('vessels.details.imo')}: ${vessel.IMO || vessel.imo}\n${t('vessels.details.name')}: ${vessel.VesselName || vessel.vesselName}\n${t('vessels.details.operator')}: ${vessel.OperatorName || vessel.operatorName}\n${t('vessels.details.type')}: ${vessel.VesselTypeName || vessel.vesselTypeName}\n${t('vessels.details.crane_count')}: ${vessel.RequiredCraneCount || vessel.requiredCraneCount}\n${t('vessels.details.dock_length')}: ${vessel.RequiredDockLength || vessel.requiredDockLength}\n${t('vessels.details.bays')}: ${vessel.Bays || vessel.bays}\n${t('vessels.details.rows')}: ${vessel.Rows || vessel.rows}\n${t('vessels.details.tiers')}: ${vessel.Tiers || vessel.tiers}`);
        } catch (error) {
            alert(t('common.error') + ': ' + error.message);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        // Validate at least one field is filled
        if (!searchData.name.trim() && !searchData.operatorName.trim()) {
            setMessage({ type: 'error', text: t('vessels.forms.search.error.criteria') });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);

        try {
            const results = await apiService.searchVessels(
                searchData.name.trim() || null,
                searchData.operatorName.trim() || null
            );
            
            setSearchResults(results);
            setHasSearched(true);
            
            if (results.length === 0) {
                setMessage({ type: 'info', text: t('vessels.forms.search.no_results') });
            } else {
                const resultText = results.length === 1 ? 
                    t('vessels.forms.search.result_found') : 
                    t('vessels.forms.search.results_found');
                setMessage({ type: 'success', text: `${t('common.found')} ${results.length} ${resultText}` });
            }

        } catch (error) {
            console.error('Error searching vessels:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || t('vessels.forms.search.error.failed') 
            });
            setSearchResults([]);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ name: '', operatorName: '' });
        setSearchResults([]);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('vessels.forms.search.title')}</h4>
                <p>{t('vessels.forms.search.description')}</p>
            </div>

            {message.text && (
                <div style={{ color: getMessageColor(message.type), marginTop: '10px' }}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchName">{t('vessels.forms.search.name.label')}</label>
                        <input
                            type="text"
                            id="searchName"
                            name="name"
                            value={searchData.name}
                            onChange={handleInputChange}
                            placeholder={t('search.name.placeholder')}
                            className="form-input"
                        />
                        <small className="form-help">{t('search.partial_matches')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="searchOperator">{t('vessels.forms.search.operator.label')}</label>
                        <input
                            type="text"
                            id="searchOperator"
                            name="operatorName"
                            value={searchData.operatorName}
                            onChange={handleInputChange}
                            placeholder={t('search.operator.placeholder')}
                            className="form-input"
                        />
                        <small className="form-help">{t('search.partial_matches')}</small>
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
                                <span>🔍</span>
                                {t('vessels.forms.search.submit')}
                            </>
                        )}
                    </button>

                    <button 
                        type="button" 
                        className="clear-btn"
                        onClick={handleClear}
                    >
                        <span>🧹</span>
                        {t('vessels.forms.search.clear')}
                    </button>
                </div>
            </form>

            {/* Search Results */}
            {hasSearched && searchResults.length > 0 && (
                <div className="search-results">
                    <h5>{t('search.results_title')} ({searchResults.length} {t('common.found')})</h5>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t('vessels.details.imo')}</th>
                                    <th>{t('vessels.details.name')}</th>
                                    <th>{t('vessels.details.operator')}</th>
                                    <th>{t('vessels.details.type')}</th>
                                    <th>{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchResults.map((vessel) => (
                                    <tr key={vessel.imo}>
                                        <td>{vessel.imo}</td>
                                        <td>{vessel.vesselName}</td>
                                        <td>{vessel.operatorName}</td>
                                        <td>{vessel.vesselTypeName || 'N/A'}</td>
                                        <td>
                                            <button 
                                                className="btn-small view-btn"
                                                onClick={() => handleViewDetails(vessel.imo)}
                                            >
                                                👁️ {t('common.view')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

console.log('SearchVesselsForm component loaded! 🔍');
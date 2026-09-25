// Search Docks Form Component

const SearchDocksForm = () => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        name: '',
        location: '',
        vesselTypeName: ''
    });
    const [searchResults, setSearchResults] = React.useState([]);
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

    const handleViewDetails = async (dockId) => {
        try {
            const dock = await apiService.getDockById(dockId);
            const vesselTypesText = dock.allowedVesselTypes && dock.allowedVesselTypes.length > 0 
                ? dock.allowedVesselTypes.join(', ') 
                : t('docks.forms.search.alert.none_allowed');
            
            // Reverting to alert() as requested by the user, with translated content
            window.alert(
                `${t('docks.forms.search.alert.details_header')}:\n\n` +
                `${t('docksHubPage.table.id')}: ${dockId}\n` +
                `${t('docksHubPage.table.name')}: ${dock.name}\n` +
                `${t('docksHubPage.table.location')}: ${dock.location}\n` +
                `${t('docksHubPage.table.length')}: ${dock.lengthMeters}${t('docks.details.length_unit')}\n` +
                `${t('docksHubPage.table.depth')}: ${dock.depthMeters}${t('docks.details.length_unit')}\n` +
                `${t('docksHubPage.table.maxDraft')}: ${dock.maxDraftMeters}${t('docks.details.length_unit')}\n` +
                `${t('docks.forms.search.alert.allowed_vessel_types')}: ${vesselTypesText}`
            );

        } catch (error) {
            window.alert(`${t('docks.forms.search.alert.error')}: ${error.message}`);
        }
    };

    // The modal closing function is no longer relevant but can be kept as a placeholder if needed.
    // const handleCloseModal = () => { setModalDock(null); }; 

    const handleSearch = async (e) => {
        e.preventDefault();
        
        const name = searchData.name.trim();
        const location = searchData.location.trim();
        const vesselTypeName = searchData.vesselTypeName.trim();

        // Validate at least one field is filled
        if (!name && !location && !vesselTypeName) {
            setMessage({ type: 'error', text: t('docks.forms.search.error.criteria_missing') });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setSearchResults([]);

        try {
            const results = await apiService.searchDocks(
                name || null,
                location || null,
                vesselTypeName || null
            );
            
            setSearchResults(results);
            setHasSearched(true);
            
            if (results.length === 0) {
                setMessage({ type: 'info', text: t('docks.forms.search.no_results') });
            } else {
                const countKey = results.length === 1 ? 'docks.forms.search.results.count_one' : 'docks.forms.search.results.count_plural';
                // Using t() for combining translation keys here
                const resultText = `${t('docks.forms.search.results.header')} ${t(countKey, { count: results.length })}`;
                setMessage({ type: 'success', text: resultText });
            }

        } catch (error) {
            console.error('Error searching docks:', error);
            // Using t() for error message
            setMessage({ 
                type: 'error', 
                text: error.message || t('docks.forms.search.error.failed') 
            });
            setSearchResults([]);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ name: '', location: '', vesselTypeName: '' });
        setSearchResults([]);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('docks.forms.search.title')}</h4>
                <p>{t('docks.forms.search.description')}</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchName">{t('docks.forms.search.name.label')}</label>
                        <input
                            type="text"
                            id="searchName"
                            name="name"
                            value={searchData.name}
                            onChange={handleInputChange}
                            placeholder={t('docks.forms.search.name.placeholder')}
                            className="form-input"
                        />
                        <small className="form-help">{t('docks.forms.search.partial_match_help')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="searchLocation">{t('docks.forms.search.location.label')}</label>
                        <input
                            type="text"
                            id="searchLocation"
                            name="location"
                            value={searchData.location}
                            onChange={handleInputChange}
                            placeholder={t('docks.forms.search.location.placeholder')}
                            className="form-input"
                        />
                        <small className="form-help">{t('docks.forms.search.partial_match_help')}</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="searchVesselType">{t('docks.forms.search.vessel_type.label')}</label>
                        <input
                            type="text"
                            id="searchVesselType"
                            name="vesselTypeName"
                            value={searchData.vesselTypeName}
                            onChange={handleInputChange}
                            placeholder={t('docks.forms.search.vessel_type.placeholder')}
                            className="form-input"
                        />
                        <small className="form-help">{t('docks.forms.search.vessel_type.help')}</small>
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
                                {t('docks.forms.search.searching')}
                            </>
                        ) : (
                            <>
                                <span>🔍</span>
                                {t('docks.forms.search.submit')}
                            </>
                        )}
                    </button>

                    <button 
                        type="button" 
                        className="clear-btn"
                        onClick={handleClear}
                        disabled={isLoading}
                    >
                        <span>🧹</span>
                        {t('docks.forms.search.clear')}
                    </button>
                </div>
            </form>

            {/* Search Results */}
            {hasSearched && searchResults.length > 0 && (
                <div className="search-results">
                    <h5>
                        {t('docks.forms.search.results.header')} 
                        {searchResults.length === 1 
                            ? t('docks.forms.search.results.count_one', { count: searchResults.length })
                            : t('docks.forms.search.results.count_plural', { count: searchResults.length })
                        }
                    </h5>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>{t('docksHubPage.table.id')}</th>
                                    <th>{t('docksHubPage.table.name')}</th>
                                    <th>{t('docksHubPage.table.location')}</th>
                                    <th>{t('docks.forms.search.table.dimensions')}</th>
                                    <th>{t('docks.details.allowed_vessel_types')}</th>
                                    <th>{t('docks.forms.search.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchResults.map((dock) => (
                                    <tr key={dock.id}>
                                        <td>{dock.id}</td>
                                        <td>{dock.name}</td>
                                        <td>{dock.location}</td>
                                        <td>
                                            {dock.lengthMeters}{t('docks.details.length_unit')} × {dock.depthMeters}{t('docks.details.length_unit')} × {dock.maxDraftMeters}{t('docks.details.length_unit')}
                                        </td>
                                        <td>
                                            {dock.allowedVesselTypes && dock.allowedVesselTypes.length > 0 
                                                ? dock.allowedVesselTypes.join(', ') 
                                                : t('docks.forms.search.allowed_vessel_types.none')}
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-small view-btn"
                                                onClick={() => handleViewDetails(dock.id)}
                                            >
                                                {t('docks.forms.search.view_details')}
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
}

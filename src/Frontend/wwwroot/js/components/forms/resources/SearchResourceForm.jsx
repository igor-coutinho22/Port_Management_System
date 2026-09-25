// Search Resource Form Component

const SearchResourceForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        id: '',
        description: '',
        type: '',
        status: ''
    });
    const [results, setResults] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // Helper to get color for message type (LOGIC UNCHANGED)
    const getMessageColor = (type) => {
        if (type === 'error') return 'red';
        if (type === 'success') return 'green';
        if (type === 'info') return '#0074D9'; // blue
        return 'inherit';
    };

    // Helper to get translated resource type label (REUSED from Delete Resource Form)
    const getResourceTypeLabel = (resourceType) => {
        const key = resourceType 
            ? resourceType.replace(/([A-Z])/g, '_$1').toUpperCase() 
            : '';
        return t(`resources.type.${key}`, { defaultValue: resourceType });
    };

    // Resource type options for search (LABELS TRANSLATED)
    const resourceTypes = [
        { value: 'STSCrane', label: t('resources.type.STS_Crane') },
        { value: 'YardCrane', label: t('resources.type.Yard_Crane') },
        { value: 'Truck', label: t('resources.type.Truck') },
        { value: 'Tractor', label: t('resources.type.Tractor') }
    ];

    // Status options for search (LABELS TRANSLATED)
    const statusOptions = [
        { value: 'Active', label: t('resources.status.Active') },
        { value: 'Inactive', label: t('resources.status.Inactive') },
        { value: 'UnderMaintenance', label: t('resources.status.UnderMaintenance') }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user starts typing
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check if at least one search criterion is provided
        if (!searchData.id.trim() && !searchData.description.trim() && 
            !searchData.type && !searchData.status) {
            // TRANSLATION APPLIED
            setMessage({ type: 'error', text: t('resources.forms.search.error.criteria_missing') });
            return;
        }

        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);

        try {
            // Build query parameters (LOGIC UNCHANGED)
            const params = new URLSearchParams();
            if (searchData.id.trim()) params.append('id', searchData.id.trim());
            if (searchData.description.trim()) params.append('description', searchData.description.trim());
            if (searchData.type) params.append('type', searchData.type);
            if (searchData.status) params.append('status', searchData.status);

            // Call API with search parameters (LOGIC UNCHANGED)
            const response = await apiService.getResources(params.toString());
            
            setResults(response || []);
            setHasSearched(true);
            
            if (response && response.length > 0) {
                const countKey = response.length === 1 ? 'resources.forms.search.results.count_one' : 'resources.forms.search.results.count_plural';
                
                // TRANSLATION APPLIED
                const resultText = `${t('common.found')} ${response.length} ${t(countKey)}`;
                setMessage({ 
                    type: 'success', 
                    text: resultText 
                });
            } else {
                // TRANSLATION APPLIED
                setMessage({ 
                    type: 'info', 
                    text: t('resources.forms.search.no_results.message') 
                });
            }

        } catch (error) {
            console.error('Error searching resources:', error);
            // TRANSLATION APPLIED
            setMessage({ 
                type: 'error', 
                text: error.message || t('resources.forms.search.error.failed') 
            });
            setResults([]);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({
            id: '',
            description: '',
            type: '',
            status: ''
        });
        setResults([]);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    const handleViewDetails = async (resourceId) => {
        try {
            const resource = await apiService.getResourceById(resourceId);
            
            // Handle qualifications properly
            let qualifications = t('resources.forms.search.alert.none');
            if (resource.qualificationRequirements && Array.isArray(resource.qualificationRequirements) && resource.qualificationRequirements.length > 0) {
                qualifications = resource.qualificationRequirements
                    .map(q => q.name || q.code || q) // UNTRANSLATED ATTRIBUTE VALUES
                    .join(', ');
            }
            
            // LOGIC UNCHANGED (using alert()), with TRANSLATED strings
            window.alert(
                `${t('resources.forms.search.alert.details_header')}:\n\n` +
                `${t('resourcesHubPage.table.id')}: ${resource.id || t('common.na')}\n` +
                `${t('resourcesHubPage.table.description')}: ${resource.description || t('common.na')}\n` +
                `${t('resourcesHubPage.table.type')}: ${getResourceTypeLabel(resource.resourceType) || t('common.na')}\n` +
                `${t('resourcesHubPage.table.status')}: ${resource.status || t('common.na')}\n` +
                `${t('resources.forms.search.alert.capacity')}: ${resource.operationalCapacity || t('common.na')}\n` +
                `${t('resources.forms.search.alert.setup_time')}: ${resource.setupTime || t('common.na')} ${t('resources.forms.search.alert.minutes')}\n` +
                `${t('resources.forms.search.alert.qualifications')}: ${qualifications}`
            );

        } catch (error) {
            window.alert(`${t('resources.forms.search.alert.error')}: ${error.message}`);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                {/* TRANSLATION APPLIED */}
                <h4>{t('resources.forms.search.title')}</h4>
                <p>{t('resources.forms.search.description')}</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={handleSubmit} className="resource-search-form">
                <div className="form-grid">
                    <div className="form-group">
                        {/* TRANSLATION APPLIED */}
                        <label htmlFor="searchId">{t('resources.forms.search.id.label')}</label>
                        <input
                            type="text"
                            id="searchId"
                            name="id"
                            value={searchData.id}
                            onChange={handleInputChange}
                            placeholder={t('resources.forms.search.id.placeholder')}
                            className="form-input"
                        />
                        {/* TRANSLATION APPLIED */}
                        <small className="form-help">{t('resources.forms.search.id.help')}</small>
                    </div>

                    <div className="form-group">
                        {/* TRANSLATION APPLIED */}
                        <label htmlFor="searchDescription">{t('resources.forms.search.description.label')}</label>
                        <input
                            type="text"
                            id="searchDescription"
                            name="description"
                            value={searchData.description}
                            onChange={handleInputChange}
                            placeholder={t('resources.forms.search.description.placeholder')}
                            className="form-input"
                        />
                        {/* TRANSLATION APPLIED */}
                        <small className="form-help">{t('resources.forms.search.description.help')}</small>
                    </div>

                    <div className="form-group">
                        {/* TRANSLATION APPLIED */}
                        <label htmlFor="searchType">{t('resources.forms.search.type.label')}</label>
                        <select
                            id="searchType"
                            name="type"
                            value={searchData.type}
                            onChange={handleInputChange}
                            className="form-select"
                        >
                            {/* TRANSLATION APPLIED */}
                            <option value="">{t('resources.forms.search.type.option_all')}</option>
                            {resourceTypes.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {/* TRANSLATED LABEL */}
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        {/* TRANSLATION APPLIED */}
                        <label htmlFor="searchStatus">{t('resources.forms.search.status.label')}</label>
                        <select
                            id="searchStatus"
                            name="status"
                            value={searchData.status}
                            onChange={handleInputChange}
                            className="form-select"
                        >
                            {/* TRANSLATION APPLIED */}
                            <option value="">{t('resources.forms.search.status.option_all')}</option>
                            {statusOptions.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {/* TRANSLATED LABEL */}
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={isLoading}
                    >
                        {/* TRANSLATION APPLIED */}
                        {isLoading ? (
                            <>
                                <span className="loading-spinner"></span>
                                {t('resources.forms.search.searching')}
                            </>
                        ) : (
                            <>
                                <span>🔍</span>
                                {t('resources.forms.search.submit')}
                            </>
                        )}
                    </button>
                    <button 
                        type="button" 
                        onClick={handleClear}
                        className="clear-btn"
                    >
                        {/* TRANSLATION APPLIED */}
                        {t('resources.forms.search.clear')}
                    </button>
                </div>
            </form>

            {/* Search Results */}
            {hasSearched && results.length > 0 && (
                <div className="search-results">
                    <h5>
                        {/* TRANSLATION APPLIED */}
                        {t('resources.forms.search.no_results.title')} ({results.length} {results.length === 1 ? t('resources.forms.search.results.count_one') : t('resources.forms.search.results.count_plural')} {t('common.found')})
                    </h5>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {/* TRANSLATION APPLIED (using Hub table keys) */}
                                    <th>{t('resourcesHubPage.table.id')}</th>
                                    <th>{t('resourcesHubPage.table.description')}</th>
                                    <th>{t('resourcesHubPage.table.type')}</th>
                                    <th>{t('resourcesHubPage.table.status')}</th>
                                    <th>{t('resourcesHubPage.table.capacity')}</th>
                                    <th>{t('resources.forms.search.table.setup_time')}</th>
                                    <th>{t('resources.forms.search.table.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((resource) => (
                                    <tr key={resource.id}>
                                        {/* UNTRANSLATED ATTRIBUTE VALUES */}
                                        <td>{resource.id}</td>
                                        <td>{resource.description || t('common.na')}</td>
                                        <td>{resource.resourceType}</td>
                                        <td>
                                            <span className={`status-badge status-${(resource.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                                                {resource.status || t('common.na')}
                                            </span>
                                        </td>
                                        <td>{resource.operationalCapacity}</td>
                                        {/* UNTRANSLATED ATTRIBUTE VALUES + TRANSLATED UNIT */}
                                        <td>{resource.setupTime} {t('resources.forms.search.table.min_unit')}</td>
                                        <td>
                                            <button 
                                                className="btn-small view-btn"
                                                onClick={() => handleViewDetails(resource.id)}
                                            >
                                                {/* TRANSLATION APPLIED */}
                                                👁️ {t('resources.forms.search.view_details')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* No Results Message */}
            {hasSearched && results.length === 0 && (
                <div className="search-results">
                    <h5>{t('resources.forms.search.no_results.title')}</h5>
                    <div className="empty-results">
                        <p>{t('resources.forms.search.no_results.message')}</p>
                        <p>{t('resources.forms.search.no_results.advice')}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

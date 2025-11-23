// Search Staff Form Component
console.log('SearchStaffForm component loading...');

const SearchStaffForm = () => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        name: '',
        status: '',
        qualification: ''
    });
    const [results, setResults] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    
    // Helper to extract attribute values reliably (handling PascalCase and camelCase)
    const getAttr = (obj, key) => obj?.[key] || obj?.[key.charAt(0).toUpperCase() + key.slice(1)];


    // Resource type options for search (reusing status keys already translated)
    const statusOptions = [
        { value: 'Available', label: t('staff.forms.edit.status.available') },
        { value: 'Unavailable', label: t('staff.forms.edit.status.unavailable') }
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setResults([]);
        
        // Check if at least one search criterion is provided
        if (!searchData.name.trim() && !searchData.status.trim() && !searchData.qualification.trim()) {
            setMessage({ type: 'error', text: t('staff.forms.search.error.criteria_missing') });
            setIsLoading(false);
            return;
        }

        try {
            const data = await apiService.searchStaff(
                searchData.name.trim(),
                searchData.status.trim(),
                searchData.qualification.trim()
            );
            
            setResults(data);
            setHasSearched(true);
            
            // Handle search success message with pluralization
            const count = data.length;
            const countKey = count === 1 ? 'staff.forms.search.results.found_one' : 'staff.forms.search.results.found_plural';
            const messageText = `${count} ${t(countKey)}`;
            
            setMessage({ type: 'success', text: messageText });
            
        } catch (error) {
            console.error('Error searching staff:', error);
            setMessage({ type: 'error', text: error.message || t('staff.forms.search.error.failed') });
            setResults([]);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ name: '', status: '', qualification: '' });
        setResults([]);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };

    const handleViewDetails = async (mecanographicNumber) => {
        try {
            const staff = await apiService.getStaffById(mecanographicNumber);
            
            // Prepare qualifications string
            let qualifications = t('staff.forms.search.table.qualifications_none');
            if (getAttr(staff, 'qualifications') && getAttr(staff, 'qualifications').length > 0) {
                qualifications = getAttr(staff, 'qualifications')
                    .map(q => getAttr(q, 'name') || getAttr(q, 'code'))
                    .join(', ');
            }
            
            // Use window.alert as per original logic, with translated headers
            window.alert(
                `${t('staff.forms.get_by_number.results.details_title')}:\n\n` +
                `${t('staff.columns.mecanographic')}: ${getAttr(staff, 'mecanographicNumber') || t('common.na')}\n` +
                `${t('staff.columns.name')}: ${getAttr(staff, 'shortName') || t('common.na')}\n` +
                `${t('staff.columns.email')}: ${getAttr(staff, 'email') || t('common.na')}\n` +
                `${t('staff.columns.phone')}: ${getAttr(staff, 'phone') || t('common.na')}\n` +
                `${t('staff.columns.status')}: ${getAttr(staff, 'status') || t('common.na')}\n` +
                `${t('staff.columns.operational_window')}: ${getAttr(staff, 'operationalWindow') || t('common.na')}\n` +
                `${t('staff.columns.qualifications')}: ${qualifications}`
            );
            
        } catch (error) {
            window.alert(`${t('common.error')}: ${error.message}`);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('staff.forms.search.title')}</h4>
                <p>{t('staff.forms.search.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchName">{t('staff.forms.search.name.label')}</label>
                        <input
                            type="text"
                            id="searchName"
                            name="name"
                            value={searchData.name}
                            onChange={handleInputChange}
                            placeholder={t('staff.forms.search.name.placeholder')}
                            className="form-input"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="searchStatus">{t('staff.forms.search.status.label')}</label>
                        <select
                            id="searchStatus"
                            name="status"
                            value={searchData.status}
                            onChange={handleInputChange}
                            className="form-select"
                        >
                            <option value="">{t('staff.forms.search.status.option_any')}</option>
                            {statusOptions.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="searchQualification">{t('staff.forms.search.qualification.label')}</label>
                        <input
                            type="text"
                            id="searchQualification"
                            name="qualification"
                            value={searchData.qualification}
                            onChange={handleInputChange}
                            placeholder={t('staff.forms.search.qualification.placeholder')}
                            className="form-input"
                        />
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
                                {t('staff.forms.search.searching')}
                            </>
                        ) : (
                            <>
                                <span>🔍</span>
                                {t('staff.forms.search.submit')}
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
                        {t('staff.forms.search.clear')}
                    </button>
                </div>
            </form>
            
            {/* Results Section */}
            {hasSearched && results.length > 0 && (
                <div className="results-section">
                    <div className="results-header">
                        <h4>{t('staff.forms.search.results.header')}</h4>
                        <span className="results-count">
                            ({results.length} {results.length === 1 ? t('staff.forms.search.results.found_one') : t('staff.forms.search.results.found_plural')} {t('common.found')})
                        </span>
                    </div>
                    <div className="table-container">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {/* Using global staff column keys */}
                                    <th>{t('staff.columns.mecanographic')}</th>
                                    <th>{t('staff.columns.name')}</th>
                                    <th>{t('staff.columns.email')}</th>
                                    <th>{t('staff.columns.phone')}</th>
                                    <th>{t('staff.columns.status')}</th>
                                    <th>{t('staff.columns.operational_window')}</th>
                                    <th>{t('staff.columns.qualifications')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((staff) => (
                                    <tr key={staff.mecanographicNumber}>
                                        <td>{getAttr(staff, 'mecanographicNumber')}</td>
                                        <td>{getAttr(staff, 'shortName')}</td>
                                        <td>{getAttr(staff, 'email')}</td>
                                        <td>{getAttr(staff, 'phone')}</td>
                                        <td>{getAttr(staff, 'status')}</td>
                                        <td>{getAttr(staff, 'operationalWindow')}</td>
                                        <td>
                                            {getAttr(staff, 'qualifications') && getAttr(staff, 'qualifications').length > 0 
                                                ? getAttr(staff, 'qualifications').map(q => getAttr(q, 'name')).join(', ') 
                                                : t('staff.forms.search.table.qualifications_none')}
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

console.log('SearchStaffForm component loaded! 🔍');
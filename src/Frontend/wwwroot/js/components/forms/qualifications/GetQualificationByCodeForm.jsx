// Get Qualification by Code Form Component

const GetQualificationByCodeForm = () => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        code: ''
    });
    const [qualification, setQualification] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // Helper to extract attribute values reliably (handling PascalCase and camelCase)
    const getAttr = (obj, key) => obj?.[key] || obj?.[key.charAt(0).toUpperCase() + key.slice(1)];

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
        const searchCode = searchData.code.trim();

        if (!searchCode) {
            setMessage({ type: 'error', text: t("qualifications.forms.get_by_code.error.required") });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setQualification(null);
        try {
            const data = await apiService.getQualificationByCode(searchCode);
            if (data) {
                // Ensure code is present for display purposes
                const qualWithCode = { ...data, code: data.code || data.Code || searchCode };
                setQualification(qualWithCode);
                setHasSearched(true);
                setMessage({ type: 'success', text: t('qualifications.forms.get_by_code.success', { code: qualWithCode.code }) });
            } else {
                setQualification(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: t('qualifications.forms.get_by_code.not_found_with_code', { code: searchCode }) });
            }
        } catch (error) {
            console.error('Error fetching qualification:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: t('qualifications.forms.get_by_code.not_found_with_code', { code: searchCode }) });
            } else {
                setMessage({ type: 'error', text: error.message || t('qualifications.forms.get_by_code.error.failed') });
            }
            setQualification(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setSearchData({ code: '' });
        setQualification(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
    };
    
    // Extract attributes for display
    const qualName = getAttr(qualification, 'name');
    const qualCode = getAttr(qualification, 'code');

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('qualifications.forms.get_by_code.title')}</h4>
                <p>{t('qualifications.forms.get_by_code.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchCode">{t('qualifications.forms.get_by_code.id.label')}</label>
                        <input
                            type="text"
                            id="searchCode"
                            name="code"
                            value={searchData.code}
                            onChange={handleInputChange}
                            placeholder={t('qualifications.forms.get_by_code.id.placeholder')}
                            className="form-input"
                        />
                        <small className="form-help">{t('qualifications.forms.get_by_code.id.help')}</small>
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
                                {t('qualifications.forms.get_by_code.submit')}
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
            {hasSearched && qualification && (
                <div className="results-section">
                    <div className="results-header">
                        <h4>{t('qualifications.forms.get_by_code.results.details_title')}</h4>
                        <span className="results-count">{t('qualifications.forms.get_by_code.results.code_prefix')}{qualCode}</span>
                    </div>
                    <div className="qualification-details-card">
                        <div className="qualification-info-grid">
                            <div className="info-group">
                                <label>{t('qualifications.forms.get_by_code.results.name_label')}</label>
                                <span>{qualName || t('common.na')}</span>
                            </div>
                            <div className="info-group">
                                <label style={{ marginTop: '16px', display: 'inline-block' }}>{t('qualifications.forms.get_by_code.results.code_label')}</label>
                                <span>{qualCode || t('common.na')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

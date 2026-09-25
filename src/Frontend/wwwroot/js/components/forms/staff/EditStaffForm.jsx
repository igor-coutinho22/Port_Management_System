// Edit Staff Form Component

const EditStaffForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    
    // Helper to extract attribute values reliably (handling PascalCase and camelCase)
    const getAttr = (obj, key) => obj?.[key] || obj?.[key.charAt(0).toUpperCase() + key.slice(1)];
    
    const [searchData, setSearchData] = React.useState({
        mecanographicNumber: ''
    });
    const [formData, setFormData] = React.useState({
        mecanographicNumber: '',
        shortName: '',
        email: '',
        phone: '',
        status: '',
        operationalWindow: '',
        qualifications: []
    });
    const [qualificationList, setQualificationList] = React.useState([]);
    const [staff, setStaff] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search'); // 'search' or 'edit'

    // Load qualifications on mount
    React.useEffect(() => {
        loadQualifications();
    }, []);

    const loadQualifications = async () => {
        try {
            const list = await apiService.getQualifications();
            setQualificationList(list);
        } catch (error) {
            console.error('Error loading qualifications:', error);
            setMessage({ type: 'error', text: t('staff.forms.edit.error.load_qualifications') });
        }
    };

    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleFormInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleQualificationChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            qualifications: checked
                ? [...prev.qualifications, value]
                : prev.qualifications.filter(q => q !== value)
        }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        const staffNumber = searchData.mecanographicNumber.trim();

        if (!staffNumber) {
            setMessage({ type: 'error', text: t('staff.forms.edit.search_error.required') });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setStaff(null);
        try {
            const data = await apiService.getStaffById(staffNumber);
            if (data) {
                const staffWithNumber = { ...data, mecanographicNumber: staffNumber };
                setStaff(staffWithNumber);
                setFormData({
                    mecanographicNumber: getAttr(data, 'mecanographicNumber') || staffNumber,
                    shortName: getAttr(data, 'shortName') || '',
                    email: getAttr(data, 'email') || '',
                    phone: getAttr(data, 'phone') || '',
                    status: getAttr(data, 'status') || '',
                    operationalWindow: getAttr(data, 'operationalWindow') || '',
                    qualifications: getAttr(data, 'qualifications') ? getAttr(data, 'qualifications').map(q => getAttr(q, 'code')) : []
                });
                setHasSearched(true);
                setStep('edit');
                setMessage({ type: 'success', text: t('staff.forms.edit.search_success') });
            } else {
                setStaff(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: t('staff.forms.edit.search_error.not_found') });
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: t('staff.forms.edit.search_error.not_found_with_number') });
            } else {
                setMessage({ type: 'error', text: error.message || t('staff.forms.edit.search_error.failed') });
            }
            setStaff(null);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setMessage({ type: '', text: '' });
        try {
            // Validate required fields
            if (!formData.shortName?.trim() || !formData.email?.trim() || !formData.phone?.trim() || !formData.status?.trim() || !formData.operationalWindow?.trim()) {
                throw new Error(t('staff.forms.edit.error.all_fields_required'));
            }
            // Validate email
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
                throw new Error(t('staff.forms.edit.error.email_invalid'));
            }
            // Validate phone
            if (!/^\+?[0-9\s-]{7,}$/.test(formData.phone)) {
                throw new Error(t('staff.forms.edit.error.phone_invalid'));
            }
            
            // Prepare staff data for update (LOGIC UNCHANGED)
            const staffData = {
                shortName: formData.shortName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                status: formData.status.trim(),
                operationalWindow: formData.operationalWindow.trim(),
                qualifications: formData.qualifications.map(code => {
                    const q = qualificationList.find(q => q.code === code || q.Code === code);
                    // LOGIC UNCHANGED: Map to DTO structure
                    return { Code: code, Name: q ? q.name || q.Name : '' };
                }) // array of objects with code and name
            };
            const result = await apiService.updateStaff(formData.mecanographicNumber, staffData);
            setMessage({ type: 'success', text: t('staff.forms.edit.update_success') });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error updating staff:', error);
            setMessage({ type: 'error', text: error.message || t('staff.forms.edit.update_error') });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClear = () => {
        setSearchData({ mecanographicNumber: '' });
        setFormData({
            mecanographicNumber: '',
            shortName: '',
            email: '',
            phone: '',
            status: '',
            operationalWindow: '',
            qualifications: []
        });
        setStaff(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    const handleNewSearch = () => {
        setSearchData({ mecanographicNumber: '' });
        setStaff(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    // Derived values for display
    const mecNumber = getAttr(staff, 'mecanographicNumber') || formData.mecanographicNumber;
    const shortName = getAttr(staff, 'shortName') || formData.shortName;

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>{t('staff.forms.edit.title')}</h4>
                <p>{t('staff.forms.edit.description')}</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {/* Step 1: Search for Staff */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchMecanographicNumber">{t('staff.forms.edit.number.label')}</label>
                            <input
                                type="text"
                                id="searchMecanographicNumber"
                                name="mecanographicNumber"
                                value={searchData.mecanographicNumber}
                                onChange={handleSearchInputChange}
                                placeholder={t('staff.forms.edit.number.placeholder')}
                                className="form-input"
                            />
                            <small className="form-help">{t('staff.forms.edit.number.search_help')}</small>
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
                                    {t('staff.forms.edit.search_button')}
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
                            {t('staff.forms.edit.cancel')}
                        </button>
                    </div>
                </form>
            )}
            {/* Step 2: Edit Staff Form */}
            {step === 'edit' && staff && (
                <>
                    <div className="form-section-header">
                        <h5>{t('staff.forms.edit.editing_header')}: <strong>{shortName}</strong> {'('} <strong>{mecNumber}</strong> {')'}</h5>
                        <button 
                            type="button" 
                            className="link-btn"
                            onClick={handleNewSearch}
                        >
                            🔍 {t('staff.forms.edit.search_different')}
                        </button>
                    </div>
                    <form onSubmit={handleUpdate} className="staff-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="editMecanographicNumber">{t('staff.forms.edit.number.label')}</label>
                                <input
                                    type="text"
                                    id="editMecanographicNumber"
                                    name="mecanographicNumber"
                                    value={formData.mecanographicNumber}
                                    className="form-input"
                                    disabled
                                />
                                <small className="form-help">{t('staff.forms.edit.number_readonly_help')}</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editShortName">
                                    {t('staff.forms.edit.name.label')} <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="editShortName"
                                    name="shortName"
                                    value={formData.shortName}
                                    onChange={handleFormInputChange}
                                    placeholder={t('staff.forms.edit.name.placeholder')}
                                    className="form-input"
                                    required
                                />
                                <small className="form-help">{t('staff.forms.edit.name.help')}</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editEmail">
                                    {t('staff.forms.edit.email.label')} <span className="required">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="editEmail"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFormInputChange}
                                    placeholder={t('staff.forms.edit.email.placeholder')}
                                    className="form-input"
                                    required
                                />
                                <small className="form-help">{t('staff.forms.edit.email.help')}</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editPhone">
                                    {t('staff.forms.edit.phone.label')} <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="editPhone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleFormInputChange}
                                    placeholder={t('staff.forms.edit.phone.placeholder')}
                                    className="form-input"
                                    required
                                />
                                <small className="form-help">{t('staff.forms.edit.phone.help')}</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editStatus">
                                    {t('staff.forms.edit.status.label')} <span className="required">*</span>
                                </label>
                                <select
                                    id="editStatus"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleFormInputChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="Available">{t('staff.forms.edit.status.available')}</option>
                                    <option value="Unavailable">{t('staff.forms.edit.status.unavailable')}</option>
                                </select>
                                <small className="form-help">{t('staff.forms.edit.status.help')}</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editOperationalWindow">
                                    {t('staff.forms.edit.window.label')} <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="editOperationalWindow"
                                    name="operationalWindow"
                                    value={formData.operationalWindow}
                                    onChange={handleFormInputChange}
                                    placeholder={t('staff.forms.edit.window.placeholder')}
                                    className="form-input"
                                    required
                                />
                                <small className="form-help">{t('staff.forms.edit.window.help')}</small>
                            </div>
                        </div>
                        {/* Qualifications Selection */}
                        <div className="qualifications-selection" style={{ marginTop: '32px', marginBottom: '16px' }}>
                            <div className="selection-header" style={{ marginBottom: '18px' }}>
                                <h5 style={{ marginBottom: '6px', fontSize: '1.15em', letterSpacing: '0.5px' }}>{t('staff.forms.edit.qualifications.header')}</h5>
                                <p style={{ marginBottom: '0', fontSize: '1em', color: '#b0b8c1', lineHeight: '1.5' }}>{t('staff.forms.edit.qualifications.desc')}</p>
                            </div>
                            <div className="qualification-cards-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', marginTop: '10px' }}>
                                {qualificationList.map((q) => {
                                    const selected = formData.qualifications.includes(q.code);
                                    return (
                                        <label
                                            key={q.code}
                                            htmlFor={`edit-qualification-${q.code}`}
                                            className={`qualification-card${selected ? ' selected' : ''}`}
                                            style={{
                                                border: selected ? '2px solid #2980b9' : '2px solid #444',
                                                background: selected ? '#eaf6fb' : '#222',
                                                color: selected ? '#2980b9' : '#fff',
                                                boxShadow: selected ? '0 0 8px #2980b9' : 'none',
                                                margin: '0',
                                                borderRadius: '12px',
                                                padding: '18px 22px',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'flex-start',
                                                cursor: 'pointer',
                                                minWidth: '220px',
                                                transition: 'all 0.2s',
                                                gap: '8px'
                                            }}
                                        >
                                            <input
                                                type="checkbox"
                                                id={`edit-qualification-${q.code}`}
                                                value={q.code}
                                                checked={selected}
                                                onChange={handleQualificationChange}
                                                style={{ display: 'none' }}
                                            />
                                            <strong style={{ fontSize: '1.13em', marginBottom: '4px', letterSpacing: '0.2px' }}>{q.name}</strong>
                                            {q.description && (
                                                <span style={{ fontSize: '0.97em', opacity: 0.85, marginTop: '2px', lineHeight: '1.4' }}>{q.description}</span>
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="form-actions">
                            <button 
                                type="submit" 
                                className="submit-btn"
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        {t('staff.forms.edit.updating')}
                                    </>
                                ) : (
                                    <>
                                        <span>✏️</span>
                                        {t('staff.forms.edit.update_button')}
                                    </>
                                )}
                            </button>
                            <button 
                                type="button" 
                                className="clear-btn"
                                onClick={handleClear}
                                disabled={isUpdating}
                            >
                                <span>🧹</span>
                                {t('staff.forms.edit.cancel')}
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}

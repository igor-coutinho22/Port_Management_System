// Edit Staff Form Component
console.log('EditStaffForm component loading...');

const EditStaffForm = ({ onSuccess }) => {
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
            setMessage({ type: 'error', text: 'Failed to load qualifications' });
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
        if (!searchData.mecanographicNumber.trim()) {
            setMessage({ type: 'error', text: 'Mecanographic number is required' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setStaff(null);
        try {
            const data = await apiService.getStaffById(searchData.mecanographicNumber.trim());
            if (data) {
                setStaff(data);
                setFormData({
                    mecanographicNumber: data.mecanographicNumber || '',
                    shortName: data.shortName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    status: data.status || '',
                    operationalWindow: data.operationalWindow || '',
                    qualifications: data.qualifications ? data.qualifications.map(q => q.code) : []
                });
                setHasSearched(true);
                setStep('edit');
                setMessage({ type: 'success', text: 'Staff found successfully' });
            } else {
                setStaff(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'Staff not found' });
            }
        } catch (error) {
            console.error('Error fetching staff:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: 'Staff not found with the provided number' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch staff. Please try again.' });
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
            if (!formData.shortName?.trim() || !formData.email?.trim() || !formData.phone?.trim() || !formData.status?.trim() || !formData.operationalWindow?.trim()) {
                throw new Error('All fields are required');
            }
            // Validate email
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
                throw new Error('Invalid email format');
            }
            // Validate phone
            if (!/^\+?[0-9\s-]{7,}$/.test(formData.phone)) {
                throw new Error('Invalid phone number');
            }
            // Prepare staff data for update
            const staffData = {
                shortName: formData.shortName.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                status: formData.status.trim(),
                operationalWindow: formData.operationalWindow.trim(),
                qualifications: formData.qualifications.map(code => {
                    const q = qualificationList.find(q => q.code === code);
                    return { code, name: q ? q.name : '' };
                }) // array of objects with code and name
            };
            const result = await apiService.updateStaff(formData.mecanographicNumber, staffData);
            setMessage({ type: 'success', text: 'Staff updated successfully' });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error updating staff:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to update staff. Please try again.' });
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

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Edit Staff</h4>
                <p>Search for a staff member by mecanographic number and modify their information</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {/* Step 1: Search for Staff */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchMecanographicNumber">Mecanographic Number</label>
                            <input
                                type="text"
                                id="searchMecanographicNumber"
                                name="mecanographicNumber"
                                value={searchData.mecanographicNumber}
                                onChange={handleSearchInputChange}
                                placeholder="Enter mecanographic number (e.g., 12345)"
                                className="form-input"
                            />
                            <small className="form-help">Enter the unique number of the staff you want to edit</small>
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
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <span>🔍</span>
                                    Search Staff
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
                            Cancel
                        </button>
                    </div>
                </form>
            )}
            {/* Step 2: Edit Staff Form */}
            {step === 'edit' && staff && (
                <>
                    <div className="form-section-header">
                        <h5>Editing staff: {staff.shortName} (MEC: {staff.mecanographicNumber})</h5>
                        <button 
                            type="button" 
                            className="link-btn"
                            onClick={handleNewSearch}
                        >
                            🔍 Search different staff
                        </button>
                    </div>
                    <form onSubmit={handleUpdate} className="staff-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="editMecanographicNumber">Mecanographic Number</label>
                                <input
                                    type="text"
                                    id="editMecanographicNumber"
                                    name="mecanographicNumber"
                                    value={formData.mecanographicNumber}
                                    className="form-input"
                                    disabled
                                />
                                <small className="form-help">Number cannot be changed</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editShortName">
                                    Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="editShortName"
                                    name="shortName"
                                    value={formData.shortName}
                                    onChange={handleFormInputChange}
                                    placeholder="Enter staff name"
                                    className="form-input"
                                    required
                                />
                                <small className="form-help">Full name of the staff member</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editEmail">
                                    Email <span className="required">*</span>
                                </label>
                                <input
                                    type="email"
                                    id="editEmail"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFormInputChange}
                                    placeholder="Enter email address"
                                    className="form-input"
                                    required
                                />
                                <small className="form-help">Valid email address</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editPhone">
                                    Phone <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="editPhone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleFormInputChange}
                                    placeholder="Enter phone number"
                                    className="form-input"
                                    required
                                />
                                <small className="form-help">Contact phone number</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editStatus">
                                    Status <span className="required">*</span>
                                </label>
                                <select
                                    id="editStatus"
                                    name="status"
                                    value={formData.status}
                                    onChange={handleFormInputChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="Available">Available</option>
                                    <option value="Unavailable">Unavailable</option>
                                </select>
                                <small className="form-help">Current status of the staff member</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editOperationalWindow">
                                    Operational Window <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="editOperationalWindow"
                                    name="operationalWindow"
                                    value={formData.operationalWindow}
                                    onChange={handleFormInputChange}
                                    placeholder="Enter operational window"
                                    className="form-input"
                                    required
                                />
                                <small className="form-help">Working hours or operational window</small>
                            </div>
                        </div>
                        {/* Qualifications Selection */}
                        <div className="qualifications-selection" style={{ marginTop: '32px', marginBottom: '16px' }}>
                            <div className="selection-header" style={{ marginBottom: '18px' }}>
                                <h5 style={{ marginBottom: '6px', fontSize: '1.15em', letterSpacing: '0.5px' }}>Qualifications</h5>
                                <p style={{ marginBottom: '0', fontSize: '1em', color: '#b0b8c1', lineHeight: '1.5' }}>Select the qualifications for this staff member</p>
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
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <span>✏️</span>
                                        Update Staff
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
                                Cancel
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

console.log('EditStaffForm component loaded!');

// Edit Qualification Form Component
console.log('EditQualificationForm component loading...');

const EditQualificationForm = ({ onSuccess }) => {
    const [searchData, setSearchData] = React.useState({ code: '' });
    const [formData, setFormData] = React.useState({ code: '', name: '' });
    const [qualification, setQualification] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search'); // 'search' or 'edit'

    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleFormInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchData.code.trim()) {
            setMessage({ type: 'error', text: 'Qualification code is required' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setQualification(null);
        try {
            const data = await apiService.getQualificationByCode(searchData.code.trim());
            if (data) {
                setQualification(data);
                setFormData({
                    code: searchData.code.trim(),
                    name: data.name || ''
                });
                setHasSearched(true);
                setStep('edit');
                setMessage({ type: 'success', text: `Found qualification: ${data.code}` });
            } else {
                setQualification(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: `Qualification '${searchData.code}' not found` });
            }
        } catch (error) {
            console.error('Error fetching qualification:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: `Qualification '${searchData.code}' not found` });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch qualification. Please try again.' });
            }
            setQualification(null);
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
            if (!formData.code?.trim()) throw new Error('Qualification code is required');
            if (!formData.name?.trim()) throw new Error('Qualification name is required');
            const qualificationData = {
                Code: formData.code.trim(),
                Name: formData.name.trim()
            };
            await apiService.updateQualification(formData.code, qualificationData);
            setMessage({ type: 'success', text: 'Qualification updated successfully!' });
            if (onSuccess) onSuccess();
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to update qualification' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClear = () => {
        setSearchData({ code: '' });
        setFormData({ code: '', name: '' });
        setQualification(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    const handleNewSearch = () => {
        setSearchData({ code: '' });
        setQualification(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Edit Qualification</h4>
                <p>Search for a qualification by code and modify its information</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {/* Step 1: Search for Qualification */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchCode">Qualification Code</label>
                            <input
                                type="text"
                                id="searchCode"
                                name="code"
                                value={searchData.code}
                                onChange={handleSearchInputChange}
                                placeholder="Enter qualification code (e.g., Q-001)"
                                className="form-input"
                            />
                            <small className="form-help">Enter the unique code of the qualification you want to edit</small>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>Loading...</>) : (<>Search Qualification</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>Cancel
                        </button>
                    </div>
                </form>
            )}
            {/* Step 2: Edit Qualification Form */}
            {step === 'edit' && qualification && (
                <>
                    <div className="form-section-header">
                        <h5>Editing qualification: {qualification.name} (Code: {qualification.code})</h5>
                        <button type="button" className="link-btn" onClick={handleNewSearch}>
                            🔍 Search different qualification
                        </button>
                    </div>
                    <form onSubmit={handleUpdate} className="qualification-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="editCode">Qualification Code</label>
                                <input
                                    type="text"
                                    id="editCode"
                                    name="code"
                                    value={formData.code}
                                    className="form-input"
                                    disabled
                                />
                                <small className="form-help">Code cannot be changed</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editName">Qualification Name</label>
                                <input
                                    type="text"
                                    id="editName"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormInputChange}
                                    className="form-input"
                                    required
                                />
                                <small className="form-help">Name/description of the qualification</small>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="submit-btn" disabled={isUpdating}>
                                {isUpdating ? (<><span className="loading-spinner"></span>Updating...</>) : (<>Update Qualification</>)}
                            </button>
                            <button type="button" className="clear-btn" onClick={handleClear} disabled={isUpdating}>
                                <span>🧹</span>Cancel
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
};

console.log('EditQualificationForm component loaded!');

// Edit Representative Form Component
console.log('EditRepresentativeForm is loading...');

const EditRepresentativeForm = ({ onSuccess }) => {
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [formData, setFormData] = React.useState({
        nationality: '',
        email: '',
        phone: ''
    });
    const [representative, setRepresentative] = React.useState(null);
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

    // Validate GUID format
    const isValidGuid = (guid) => {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return guidRegex.test(guid);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: 'Representative ID is required' });
            return;
        }
        if (!isValidGuid(searchData.id.trim())) {
            setMessage({ type: 'error', text: 'Invalid GUID format. Please enter a valid representative ID (e.g., 12345678-1234-1234-1234-123456789abc)' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setRepresentative(null);
        try {
            const data = await apiService.getRepresentativeById(searchData.id.trim());
            if (data) {
                setRepresentative(data);
                setFormData({
                    nationality: data.nationality || '',
                    email: data.email || '',
                    phone: data.phone || ''
                });
                setStep('edit');
                setHasSearched(true);
                setMessage({ type: 'success', text: 'Representative found. You can now edit.' });
            } else {
                setRepresentative(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'Representative not found' });
            }
        } catch (error) {
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: 'Representative not found with the provided ID' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch representative. Please try again.' });
            }
            setRepresentative(null);
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
            await apiService.updateRepresentative(searchData.id.trim(), formData);
            setMessage({ type: 'success', text: 'Representative updated successfully!' });
            if (onSuccess) onSuccess();
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to update representative.' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setFormData({ nationality: '', email: '', phone: '' });
        setRepresentative(null);
        setHasSearched(false);
        setStep('search');
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Edit Representative</h4>
                <p>Search for a representative by ID, then edit their details.</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchId">Representative ID</label>
                            <input
                                type="text"
                                id="searchId"
                                name="id"
                                value={searchData.id}
                                onChange={handleSearchInputChange}
                                placeholder="Enter representative ID (e.g., 12345678-1234-1234-1234-123456789abc)"
                                className="form-input"
                            />
                            <small className="form-help">Must be a valid GUID format</small>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>Loading...</>) : (<><span>✏️</span>Search</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🔄</span>Clear
                        </button>
                    </div>
                </form>
            )}
            {step === 'edit' && representative && (
                <form onSubmit={handleUpdate} className="edit-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>Nationality</label>
                            <input
                                name="nationality"
                                value={formData.nationality}
                                onChange={handleFormInputChange}
                                className="form-input"
                                maxLength={3}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleFormInputChange}
                                className="form-input"
                                maxLength={200}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleFormInputChange}
                                className="form-input"
                                maxLength={32}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isUpdating}>
                            {isUpdating ? (<><span className="loading-spinner"></span>Updating...</>) : (<><span>💾</span>Update Representative</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isUpdating}>
                            <span>🔄</span>Clear
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

console.log('EditRepresentativeForm component loaded!');
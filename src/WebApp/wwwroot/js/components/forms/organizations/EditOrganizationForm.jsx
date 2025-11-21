// Edit Organization Form Component
console.log('EditOrganizationForm component loading...');

const EditOrganizationForm = ({ onSuccess }) => {
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [formData, setFormData] = React.useState({
        id: '',
        alternativeNames: '',
        address: ''
    });
    const [organization, setOrganization] = React.useState(null);
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
            setMessage({ type: 'error', text: 'Organization ID is required' });
            return;
        }
        if (!isValidGuid(searchData.id.trim())) {
            setMessage({ type: 'error', text: 'Invalid GUID format. Please enter a valid organization ID' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setOrganization(null);
        try {
            const data = await apiService.getOrganizationById(searchData.id.trim());
            if (data) {
                setOrganization(data);
                setFormData({
                    id: searchData.id.trim(),
                    alternativeNames: data.alternativeNames || '',
                    address: data.address || ''
                });
                setHasSearched(true);
                setStep('edit');
                setMessage({ type: 'success', text: 'Organization found successfully' });
            } else {
                setOrganization(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'Organization not found' });
            }
        } catch (error) {
            console.error('Error fetching organization:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: 'Organization not found with the provided ID' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch organization. Please try again.' });
            }
            setOrganization(null);
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
            if (!formData.address?.trim()) {
                throw new Error('Address is required');
            }
            // Prepare DTO for backend
            const orgData = {
                AlternativeNames: formData.alternativeNames,
                Address: formData.address.trim()
            };
            await apiService.updateOrganization(formData.id, orgData);
            setMessage({ type: 'success', text: 'Organization updated successfully' });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error updating organization:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to update organization. Please try again.' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setFormData({
            id: '',
            alternativeNames: '',
            address: ''
        });
        setOrganization(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    const handleNewSearch = () => {
        setSearchData({ id: '' });
        setOrganization(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Edit Organization</h4>
                <p>Search for an organization by ID and modify its information</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {/* Step 1: Search for Organization */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchId">Organization ID</label>
                            <input
                                type="text"
                                id="searchId"
                                name="id"
                                value={searchData.id}
                                onChange={handleSearchInputChange}
                                placeholder="Enter organization ID (e.g., 12345678-1234-1234-1234-123456789abc)"
                                className="form-input"
                            />
                            <small className="form-help">Enter the unique GUID of the organization you want to edit</small>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>Loading...</>) : (<><span>🔍</span>Search Organization</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>Cancel
                        </button>
                    </div>
                </form>
            )}
            {/* Step 2: Edit Organization Form */}
            {step === 'edit' && organization && (
                <>
                    <div className="form-section-header">
                        <h5>Editing organization: {organization.legalName} (ID: {organization.id})</h5>
                        <button type="button" className="link-btn" onClick={handleNewSearch}>🔍 Search different organization</button>
                    </div>
                    <form onSubmit={handleUpdate} className="organization-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="editId">Organization ID</label>
                                <input type="text" id="editId" name="id" value={formData.id} className="form-input" disabled />
                                <small className="form-help">ID cannot be changed</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editAlternativeNames">Alternative Names</label>
                                <input type="text" id="editAlternativeNames" name="alternativeNames" value={formData.alternativeNames} onChange={handleFormInputChange} placeholder="Enter alternative names" className="form-input" />
                                <small className="form-help">Other names or abbreviations</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editAddress">Address <span className="required">*</span></label>
                                <input type="text" id="editAddress" name="address" value={formData.address} onChange={handleFormInputChange} placeholder="Enter address" className="form-input" required />
                                <small className="form-help">Physical address</small>
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="submit-btn" disabled={isUpdating}>
                                {isUpdating ? (<><span className="loading-spinner"></span>Updating...</>) : (<><span>✏️</span>Update Organization</>)}
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

console.log('EditOrganizationForm component loaded!');
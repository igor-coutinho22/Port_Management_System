// Edit Dock Form Component
console.log('✏️ EditDockForm component loading...');

const EditDockForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        id: ''
    });
    const [formData, setFormData] = React.useState({
        id: '',
        name: '',
        location: '',
        lengthMeters: '',
        depthMeters: '',
        maxDraftMeters: '',
        allowedVesselTypes: []
    });
    const [vesselTypes, setVesselTypes] = React.useState([]);
    const [dock, setDock] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search'); // 'search' or 'edit'

    // Load vessel types on mount
    React.useEffect(() => {
        loadVesselTypes();
    }, []);

    const loadVesselTypes = async () => {
        try {
            const types = await apiService.getVesselTypes();
            setVesselTypes(types);
        } catch (error) {
            console.error('Error loading vessel types:', error);
            setMessage({ type: 'error', text: 'Failed to load vessel types' });
        }
    };

    const handleSearchInputChange = (e) => {
        const { name, value } = e.target;
        setSearchData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user starts typing
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleFormInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user starts typing
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleVesselTypeChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            allowedVesselTypes: checked 
                ? [...prev.allowedVesselTypes, value]
                : prev.allowedVesselTypes.filter(type => type !== value)
        }));
    };

    // Validate GUID format
    const isValidGuid = (guid) => {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return guidRegex.test(guid);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        // Validate ID field
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: 'Dock ID is required' });
            return;
        }
        
        if (!isValidGuid(searchData.id.trim())) {
            setMessage({ type: 'error', text: 'Invalid GUID format. Please enter a valid dock ID' });
            return;
        }
        
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setDock(null);
        
        try {
            const data = await apiService.getDockById(searchData.id.trim());
            console.log('🔍 API Response from getDockById:', data);
            if (data) {
                setDock(data);
                // Use the searchData.id since the API response doesn't include the ID
                setFormData({
                    id: searchData.id.trim(), // Use the ID we searched with
                    name: data.name || '',
                    location: data.location || '',
                    lengthMeters: data.lengthMeters || '',
                    depthMeters: data.depthMeters || '',
                    maxDraftMeters: data.maxDraftMeters || '',
                    allowedVesselTypes: data.allowedVesselTypes || []
                });
                console.log('🔍 Form data after setting:', {
                    id: searchData.id.trim(),
                    name: data.name || '',
                    location: data.location || '',
                    lengthMeters: data.lengthMeters || '',
                    depthMeters: data.depthMeters || '',
                    maxDraftMeters: data.maxDraftMeters || '',
                    allowedVesselTypes: data.allowedVesselTypes || []
                });
                setHasSearched(true);
                setStep('edit');
                setMessage({ type: 'success', text: 'Dock found successfully' });
            } else {
                setDock(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'Dock not found' });
            }
        } catch (error) {
            console.error('Error fetching dock:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: 'Dock not found with the provided ID' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch dock. Please try again.' });
            }
            setDock(null);
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
            if (!formData.name?.trim() || !formData.location?.trim() || 
                !formData.lengthMeters?.toString().trim() || !formData.depthMeters?.toString().trim() || 
                !formData.maxDraftMeters?.toString().trim()) {
                throw new Error('All fields are required');
            }

            // Validate vessel types selection
            if (!formData.allowedVesselTypes || formData.allowedVesselTypes.length === 0) {
                throw new Error('At least one allowed vessel type must be selected');
            }

            // Validate numeric fields
            if (isNaN(parseFloat(formData.lengthMeters)) || parseFloat(formData.lengthMeters) <= 0) {
                throw new Error('Length must be a valid positive number');
            }
            if (isNaN(parseFloat(formData.depthMeters)) || parseFloat(formData.depthMeters) <= 0) {
                throw new Error('Depth must be a valid positive number');
            }
            if (isNaN(parseFloat(formData.maxDraftMeters)) || parseFloat(formData.maxDraftMeters) <= 0) {
                throw new Error('Max draft must be a valid positive number');
            }

            // Transform data to match backend DTO expectations
            const dockData = {
                Name: formData.name.trim(),
                Location: formData.location.trim(),
                LengthMeters: parseFloat(formData.lengthMeters),
                DepthMeters: parseFloat(formData.depthMeters),
                MaxDraftMeters: parseFloat(formData.maxDraftMeters),
                AllowedVesselTypes: formData.allowedVesselTypes
            };

            console.log('🔍 Updating dock with data:', dockData);
            console.log('🔍 Dock ID:', formData.id);

            // Update dock
            const result = await apiService.updateDock(formData.id, dockData);
            console.log('🔍 Update result:', result);
            
            setMessage({ type: 'success', text: 'Dock updated successfully' });
            
            // Notify parent component
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error('Error updating dock:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to update dock. Please try again.' 
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setFormData({
            id: '',
            name: '',
            location: '',
            lengthMeters: '',
            depthMeters: '',
            maxDraftMeters: '',
            allowedVesselTypes: []
        });
        setDock(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    const handleNewSearch = () => {
        setSearchData({ id: '' });
        setDock(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Edit Dock</h4>
                <p>Search for a dock by ID and modify its information</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {/* Step 1: Search for Dock */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchId">Dock ID</label>
                            <input
                                type="text"
                                id="searchId"
                                name="id"
                                value={searchData.id}
                                onChange={handleSearchInputChange}
                                placeholder="Enter dock ID (e.g., 12345678-1234-1234-1234-123456789abc)"
                                className="form-input"
                            />
                            <small className="form-help">Enter the unique GUID of the dock you want to edit</small>
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
                                    Search Dock
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

            {/* Step 2: Edit Dock Form */}
            {step === 'edit' && dock && (
                <>
                    <div className="form-section-header">
                        <h5>Editing dock: {dock.name} (ID: {dock.id})</h5>
                        <button 
                            type="button" 
                            className="link-btn"
                            onClick={handleNewSearch}
                        >
                            🔍 Search different dock
                        </button>
                    </div>

                    <form onSubmit={handleUpdate} className="dock-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="editId">Dock ID</label>
                                <input
                                    type="text"
                                    id="editId"
                                    name="id"
                                    value={formData.id}
                                    className="form-input"
                                    disabled
                                />
                                <small className="form-help">ID cannot be changed</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="editName">
                                    Dock Name <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="editName"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormInputChange}
                                    placeholder="Enter dock name"
                                    className="form-input"
                                    required
                                />
                                <small className="form-help">Unique identifier for the dock</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="editLocation">
                                    Location <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="editLocation"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleFormInputChange}
                                    placeholder="Enter dock location"
                                    className="form-input"
                                    required
                                />
                                <small className="form-help">Physical location of the dock</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="editLengthMeters">
                                    Length (meters) <span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="editLengthMeters"
                                    name="lengthMeters"
                                    value={formData.lengthMeters}
                                    onChange={handleFormInputChange}
                                    placeholder="Enter length in meters"
                                    min="0.1"
                                    step="0.1"
                                    className="form-input"
                                    required
                                />
                                <small className="form-help">Total length of the dock</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="editDepthMeters">
                                    Depth (meters) <span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="editDepthMeters"
                                    name="depthMeters"
                                    value={formData.depthMeters}
                                    onChange={handleFormInputChange}
                                    placeholder="Enter depth in meters"
                                    min="0.1"
                                    step="0.1"
                                    className="form-input"
                                    required
                                />
                                <small className="form-help">Water depth at the dock</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="editMaxDraftMeters">
                                    Max Draft (meters) <span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    id="editMaxDraftMeters"
                                    name="maxDraftMeters"
                                    value={formData.maxDraftMeters}
                                    onChange={handleFormInputChange}
                                    placeholder="Enter maximum draft in meters"
                                    min="0.1"
                                    step="0.1"
                                    className="form-input"
                                    required
                                />
                                <small className="form-help">Maximum vessel draft that can be accommodated</small>
                            </div>
                        </div>

                        {/* Vessel Types Selection */}
                        <div className="vessel-types-selection">
                            <div className="selection-header">
                                <h5>Allowed Vessel Types</h5>
                                <p>Select the types of vessels that can use this dock</p>
                            </div>
                            
                            <div className="vessel-types-checkboxes">
                                {vesselTypes.map((vesselType) => (
                                    <div key={vesselType.id} className="vessel-type-checkbox">
                                        <input
                                            type="checkbox"
                                            id={`edit-vessel-type-${vesselType.id}`}
                                            value={vesselType.name}
                                            checked={formData.allowedVesselTypes.includes(vesselType.name)}
                                            onChange={handleVesselTypeChange}
                                        />
                                        <label htmlFor={`edit-vessel-type-${vesselType.id}`}>
                                            <strong>{vesselType.name}</strong>
                                            {vesselType.description && (
                                                <span>{vesselType.description}</span>
                                            )}
                                        </label>
                                    </div>
                                ))}
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
                                        Update Dock
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

console.log('EditDockForm component loaded! ✏️');
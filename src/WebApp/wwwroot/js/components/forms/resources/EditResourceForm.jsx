// Edit Resource Form Component
console.log('✏️ EditResourceForm component loading...');

const EditResourceForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        id: ''
    });
    const [formData, setFormData] = React.useState({
        id: '',
        description: '',
        resourceType: '',
        operationalCapacity: '',
        setupTime: '',
        qualificationRequirements: []
    });
    const [qualifications, setQualifications] = React.useState([]);
    const [resource, setResource] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search'); // 'search' or 'edit'

    // Resource type options
    const resourceTypes = [
        { value: 'STSCrane', label: 'STS Crane' },
        { value: 'YardCrane', label: 'Yard Crane' },
        { value: 'Truck', label: 'Truck' },
        { value: 'Tractor', label: 'Tractor' }
    ];

    // Load qualifications on mount
    React.useEffect(() => {
        loadQualifications();
    }, []);

    const loadQualifications = async () => {
        try {
            const data = await apiService.getQualifications();
            setQualifications(data || []);
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

    const handleQualificationToggle = (qualificationCode) => {
        setFormData(prev => {
            const isCurrentlySelected = prev.qualificationRequirements.includes(qualificationCode);
            const newRequirements = isCurrentlySelected
                ? prev.qualificationRequirements.filter(code => code !== qualificationCode)
                : [...prev.qualificationRequirements, qualificationCode];
                
            return {
                ...prev,
                qualificationRequirements: newRequirements
            };
        });
    };

    const handleQualificationChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
        setFormData(prev => ({
            ...prev,
            qualificationRequirements: selectedOptions
        }));
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        
        // Validate resource ID field
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: 'Resource ID is required' });
            return;
        }
        
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setResource(null);
        
        try {
            const data = await apiService.getResourceById(searchData.id.trim());
            if (data) {
                setResource(data);
                
                // Map resource type to index for the select dropdown
                const resourceTypeIndex = resourceTypes.findIndex(type => type.value === data.resourceType);
                
                setFormData({
                    id: data.id || '',
                    description: data.description || '',
                    resourceType: resourceTypeIndex !== -1 ? resourceTypeIndex.toString() : '',
                    operationalCapacity: data.operationalCapacity || '',
                    setupTime: data.setupTime || '',
                    qualificationRequirements: data.qualificationRequirements ? 
                        data.qualificationRequirements.map(q => q.code || q) : []
                });
                setHasSearched(true);
                setStep('edit');
                setMessage({ type: 'success', text: 'Resource found! You can now edit the information below.' });
            } else {
                setResource(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'No resource found with the provided ID' });
            }
        } catch (error) {
            console.error('Error fetching resource:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: 'No resource found with the provided ID' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to retrieve resource' });
            }
            setResource(null);
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
            if (!formData.id?.trim() || !formData.description?.trim() || 
                !formData.operationalCapacity?.toString().trim() || !formData.setupTime?.toString().trim()) {
                throw new Error('All fields are required');
            }

            // Validate numeric fields
            if (isNaN(parseInt(formData.operationalCapacity)) || parseInt(formData.operationalCapacity) <= 0) {
                throw new Error('Operational capacity must be a valid positive number');
            }
            if (isNaN(parseInt(formData.setupTime)) || parseInt(formData.setupTime) < 0) {
                throw new Error('Setup time must be a valid number (0 or greater)');
            }

            // Transform data to match backend DTO expectations
            const resourceData = {
                Id: formData.id,
                Description: formData.description,
                ResourceType: parseInt(formData.resourceType), // Backend expects enum as int
                OperationalCapacity: parseInt(formData.operationalCapacity),
                SetupTime: parseInt(formData.setupTime),
                QualificationRequirements: formData.qualificationRequirements.map(qCode => {
                    const qual = qualifications.find(q => q.code === qCode);
                    return qual ? { Code: qual.code, Name: qual.name } : null;
                }).filter(q => q !== null)
            };

            // Update resource
            await apiService.updateResource(formData.id, resourceData);
            
            setMessage({ type: 'success', text: 'Resource updated successfully!' });
            
            // Notify parent component
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error('Error updating resource:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to update resource' 
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setFormData({
            id: '',
            description: '',
            resourceType: '',
            operationalCapacity: '',
            setupTime: '',
            qualificationRequirements: []
        });
        setResource(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    const handleSearchDifferent = () => {
        setResource(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
        setSearchData({ id: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Edit Resource</h4>
                <p>Update resource information</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            {step === 'search' && (
                <div className="search-section">
                    <h5>Search for a resource to edit</h5>
                    <p className="help-text">Enter the ID of the resource you want to edit</p>
                    
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="form-group">
                            <label htmlFor="searchResourceId">Resource ID</label>
                            <input
                                type="text"
                                id="searchResourceId"
                                name="id"
                                value={searchData.id}
                                onChange={handleSearchInputChange}
                                placeholder="Enter resource ID"
                                className="form-input"
                                required
                            />
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
                                        Searching...
                                    </>
                                ) : (
                                    <>
                                        <span>🔍</span>
                                        Find Resource
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {step === 'edit' && resource && (
                <div className="edit-section">
                    <div className="form-section-header">
                        <h5>Editing: {resource.description} (ID: {resource.id})</h5>
                        <button 
                            type="button"
                            onClick={handleSearchDifferent}
                            className="link-btn"
                        >
                            🔍 Search Different Resource
                        </button>
                    </div>

                    <form onSubmit={handleUpdate} className="resource-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="editResourceId">Resource ID</label>
                                <input
                                    type="text"
                                    id="editResourceId"
                                    name="id"
                                    value={formData.id}
                                    className="form-input"
                                    disabled
                                />
                                <small className="form-help">ID cannot be changed</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="editDescription">Description</label>
                                <input
                                    type="text"
                                    id="editDescription"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormInputChange}
                                    placeholder="Enter resource description"
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="editResourceType">Resource Type</label>
                                <select
                                    id="editResourceType"
                                    name="resourceType"
                                    value={formData.resourceType}
                                    onChange={handleFormInputChange}
                                    className="form-select"
                                    required
                                >
                                    <option value="">Select resource type</option>
                                    {resourceTypes.map((type, index) => (
                                        <option key={type.value} value={index}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="editOperationalCapacity">Operational Capacity</label>
                                <input
                                    type="number"
                                    id="editOperationalCapacity"
                                    name="operationalCapacity"
                                    value={formData.operationalCapacity}
                                    onChange={handleFormInputChange}
                                    placeholder="Enter capacity"
                                    min="1"
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="editSetupTime">Setup Time (minutes)</label>
                                <input
                                    type="number"
                                    id="editSetupTime"
                                    name="setupTime"
                                    value={formData.setupTime}
                                    onChange={handleFormInputChange}
                                    placeholder="Enter setup time"
                                    min="0"
                                    className="form-input"
                                    required
                                />
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="editQualificationRequirements">Required Qualifications</label>
                                <div className="qualification-selector">
                                    {qualifications.map(qualification => (
                                        <div 
                                            key={qualification.code} 
                                            className={`qualification-option ${formData.qualificationRequirements.includes(qualification.code) ? 'selected' : ''}`}
                                            onClick={() => handleQualificationToggle(qualification.code)}
                                        >
                                            <span className="qualification-name">{qualification.name}</span>
                                            <span className="qualification-code">({qualification.code})</span>
                                            {formData.qualificationRequirements.includes(qualification.code) && (
                                                <span className="selected-indicator">✓</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <small className="form-help">Click on qualifications to select/deselect them</small>
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
                                        Update Resource
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

console.log('EditResourceForm component loaded! ✏️');
// Edit Vessel Type Form Component
console.log('✏️ EditVesselTypeForm component loading...');

const EditVesselTypeForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({
        name: ''
    });
    const [formData, setFormData] = React.useState({
        name: '',
        description: '',
        maxBays: '',
        maxRows: '',
        maxTiers: ''
    });
    const [vesselType, setVesselType] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search'); // 'search' or 'edit'

    // Calculate TEU Capacity dynamically
    const calculateTEUCapacity = () => {
        const bays = parseInt(formData.maxBays) || 0;
        const rows = parseInt(formData.maxRows) || 0;
        const tiers = parseInt(formData.maxTiers) || 0;
        return bays * rows * tiers;
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

    const handleSearch = async (e) => {
        e.preventDefault();
        
        // Validate name field
        if (!searchData.name.trim()) {
            setMessage({ type: 'error', text: 'Vessel type name is required' });
            return;
        }
        
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setVesselType(null);
        
        try {
            const data = await apiService.getVesselTypeByName(searchData.name.trim());
            if (data) {
                setVesselType(data);
                setFormData({
                    name: data.name || '',
                    description: data.description || '',
                    maxBays: data.maxBays || '',
                    maxRows: data.maxRows || '',
                    maxTiers: data.maxTiers || ''
                });
                setHasSearched(true);
                setStep('edit');
                setMessage({ type: 'success', text: `Found vessel type: ${data.name}` });
            } else {
                setVesselType(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: `Vessel type '${searchData.name}' not found` });
            }
        } catch (error) {
            console.error('Error fetching vessel type:', error);
            if (error.message.includes('404')) {
                setMessage({ type: 'info', text: `Vessel type '${searchData.name}' not found` });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch vessel type. Please try again.' });
            }
            setVesselType(null);
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
            if (!formData.name?.trim()) {
                throw new Error('Vessel type name is required');
            }
            if (!formData.maxBays?.toString().trim() || !formData.maxRows?.toString().trim() || !formData.maxTiers?.toString().trim()) {
                throw new Error('All capacity fields (Max Bays, Max Rows, Max Tiers) are required');
            }

            // Validate numeric fields
            if (isNaN(parseInt(formData.maxBays)) || parseInt(formData.maxBays) <= 0) {
                throw new Error('Max bays must be a valid positive number');
            }
            if (isNaN(parseInt(formData.maxRows)) || parseInt(formData.maxRows) <= 0) {
                throw new Error('Max rows must be a valid positive number');
            }
            if (isNaN(parseInt(formData.maxTiers)) || parseInt(formData.maxTiers) <= 0) {
                throw new Error('Max tiers must be a valid positive number');
            }

            // Transform data to match backend DTO expectations (PascalCase)
            const vesselTypeData = {
                Name: formData.name.trim(),
                Description: formData.description.trim() || null,
                MaxBays: parseInt(formData.maxBays),
                MaxRows: parseInt(formData.maxRows),
                MaxTiers: parseInt(formData.maxTiers),
                MaxTEUCapacity: calculateTEUCapacity()
            };

            // Update vessel type (using original name from search as currentName)
            await apiService.updateVesselType(searchData.name.trim(), vesselTypeData);
            
            setMessage({ type: 'success', text: 'Vessel type updated successfully!' });
            
            // Notify parent component
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error('Error updating vessel type:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to update vessel type. Please try again.' 
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClear = () => {
        setSearchData({ name: '' });
        setFormData({
            name: '',
            description: '',
            maxBays: '',
            maxRows: '',
            maxTiers: ''
        });
        setVesselType(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    const handleNewSearch = () => {
        setSearchData({ name: '' });
        setVesselType(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Edit Vessel Type</h4>
                <p>Update vessel type specifications and container capacity limits</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-section-header">
                        <h5>🔍 Find Vessel Type to Edit</h5>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchName">Vessel Type Name</label>
                            <input
                                type="text"
                                id="searchName"
                                name="name"
                                value={searchData.name}
                                onChange={handleSearchInputChange}
                                placeholder="e.g., Container Ship, Bulk Carrier"
                                className="form-input"
                                required
                            />
                            <small className="form-help">Enter the exact name of the vessel type you want to edit</small>
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
                                    Searching...
                                </>
                            ) : (
                                <>
                                    <span>🔍</span>
                                    Find Vessel Type
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
                            Clear
                        </button>
                    </div>
                </form>
            )}

            {step === 'edit' && vesselType && (
                <form onSubmit={handleUpdate} className="vessel-form">
                    <div className="form-section-header">
                        <h5>✏️ Edit Vessel Type: {vesselType.name}</h5>
                        <button type="button" className="link-btn" onClick={handleNewSearch}>
                            🔍 Search for different vessel type
                        </button>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="name">
                                Vessel Type Name <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleFormInputChange}
                                placeholder="e.g., Container Ship Large"
                                className="form-input"
                                disabled
                                required
                            />
                            <small className="form-help">Name cannot be changed (unique identifier)</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">
                                Description
                            </label>
                            <input
                                type="text"
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleFormInputChange}
                                placeholder="e.g., Large container vessel for international shipping"
                                className="form-input"
                            />
                            <small className="form-help">Optional description of this vessel type</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="maxBays">
                                Max Bays <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                id="maxBays"
                                name="maxBays"
                                value={formData.maxBays}
                                onChange={handleFormInputChange}
                                placeholder="e.g., 20"
                                min="1"
                                className="form-input"
                                required
                            />
                            <small className="form-help">Maximum number of container bays (length)</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="maxRows">
                                Max Rows <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                id="maxRows"
                                name="maxRows"
                                value={formData.maxRows}
                                onChange={handleFormInputChange}
                                placeholder="e.g., 18"
                                min="1"
                                className="form-input"
                                required
                            />
                            <small className="form-help">Maximum number of container rows (width)</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="maxTiers">
                                Max Tiers <span className="required">*</span>
                            </label>
                            <input
                                type="number"
                                id="maxTiers"
                                name="maxTiers"
                                value={formData.maxTiers}
                                onChange={handleFormInputChange}
                                placeholder="e.g., 8"
                                min="1"
                                className="form-input"
                                required
                            />
                            <small className="form-help">Maximum number of container tiers (height)</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="maxTEUCapacity">
                                Max TEU Capacity (Calculated)
                            </label>
                            <input
                                type="number"
                                id="maxTEUCapacity"
                                name="maxTEUCapacity"
                                value={calculateTEUCapacity()}
                                className="form-input"
                                disabled
                                style={{ 
                                    backgroundColor: 'var(--bg-secondary)', 
                                    color: 'var(--text-secondary)',
                                    fontWeight: 'bold'
                                }}
                            />
                            <small className="form-help">
                                Automatically calculated: {formData.maxBays || 0} × {formData.maxRows || 0} × {formData.maxTiers || 0} = {calculateTEUCapacity()} TEU
                            </small>
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
                                    <span>💾</span>
                                    Update Vessel Type
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
                            Cancel & Clear
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

console.log('EditVesselTypeForm component loaded! ✏️');
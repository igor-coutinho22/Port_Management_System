// Register Vessel Type Form Component
console.log('📝 RegisterVesselTypeForm component loading...');

const RegisterVesselTypeForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = React.useState({
        name: '',
        description: '',
        maxBays: '',
        maxRows: '',
        maxTiers: ''
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // Helper to get color for message type
    const getMessageColor = (type) => {
        if (type === 'error') return 'red';
        if (type === 'success') return 'green';
        if (type === 'info') return '#0074D9'; // blue
        return 'inherit';
    };

    // Calculate TEU Capacity dynamically
    const calculateTEUCapacity = () => {
        const bays = parseInt(formData.maxBays) || 0;
        const rows = parseInt(formData.maxRows) || 0;
        const tiers = parseInt(formData.maxTiers) || 0;
        return bays * rows * tiers;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear messages when user starts typing
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
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

            // Debug: Log the data being sent
            console.log('🔍 Sending vessel type data:', formData);

            // Transform data to match backend DTO expectations (PascalCase)
            const vesselTypeData = {
                Name: formData.name.trim(),
                Description: formData.description.trim() || null,
                MaxBays: parseInt(formData.maxBays),
                MaxRows: parseInt(formData.maxRows),
                MaxTiers: parseInt(formData.maxTiers),
                MaxTEUCapacity: calculateTEUCapacity() // This will be calculated on backend too
            };

            console.log('🔍 Transformed vessel type data:', vesselTypeData);

            // Create vessel type
            await apiService.createVesselType(vesselTypeData);
            
            setMessage({ type: 'success', text: 'Vessel type registered successfully!' });
            
            // Reset form
            setFormData({
                name: '',
                description: '',
                maxBays: '',
                maxRows: '',
                maxTiers: ''
            });

            // Notify parent component
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error('Error registering vessel type:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to register vessel type. Please try again.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const clearForm = () => {
        setFormData({
            name: '',
            description: '',
            maxBays: '',
            maxRows: '',
            maxTiers: ''
        });
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Register Vessel Type</h4>
                <p>Create a new vessel type with specifications and container capacity limits</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`} style={{ color: getMessageColor(message.type) }}>{message.text}</div>
            )}

            <form onSubmit={handleSubmit} className="vessel-form">
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
                            onChange={handleInputChange}
                            placeholder="e.g., Container Ship Large"
                            className="form-input"
                            required
                        />
                        <small className="form-help">Unique name to identify this vessel type</small>
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
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
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
                            onChange={handleInputChange}
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
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Registering...
                            </>
                        ) : (
                            <>
                                <span>🚢</span>
                                Register Vessel Type
                            </>
                        )}
                    </button>
                    
                    <button 
                        type="button" 
                        className="clear-btn"
                        onClick={clearForm}
                        disabled={isLoading}
                    >
                        <span>🧹</span>
                        Clear Form
                    </button>
                </div>
            </form>
        </div>
    );
};

console.log('RegisterVesselTypeForm component loaded! 📝');

/* -- FLOW --- */
/* User Input → React State → Form Validation → Data Transform → 
API Service → HTTP Request → Backend Controller → Business Logic → 
Repository → Database → SQL INSERT → Response Back → 
HTTP Response → API Service → React State Update → UI Update */
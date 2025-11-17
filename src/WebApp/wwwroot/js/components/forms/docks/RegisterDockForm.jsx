// Register Dock Form Component
console.log('📝 RegisterDockForm component loading...');

const RegisterDockForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = React.useState({
        name: '',
        location: '',
        lengthMeters: '',
        depthMeters: '',
        maxDraftMeters: '',
        allowedVesselTypes: []
    });
    const [vesselTypes, setVesselTypes] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

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

    const handleInputChange = (e) => {
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
        // Clear messages when user makes changes
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });

        try {
            // Validate required fields
            if (!formData.name?.trim()) {
                throw new Error('Dock name is required');
            }
            if (!formData.location?.trim()) {
                throw new Error('Location is required');
            }
            if (!formData.lengthMeters?.toString().trim()) {
                throw new Error('Length is required');
            }
            if (!formData.depthMeters?.toString().trim()) {
                throw new Error('Depth is required');
            }
            if (!formData.maxDraftMeters?.toString().trim()) {
                throw new Error('Max draft is required');
            }
            if (!formData.allowedVesselTypes || formData.allowedVesselTypes.length === 0) {
                throw new Error('At least one allowed vessel type must be specified');
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

            // Debug: Log the data being sent
            console.log('🔍 Sending dock data:', formData);

            // Transform data to match backend DTO expectations
            const dockData = {
                Name: formData.name.trim(),
                Location: formData.location.trim(),
                LengthMeters: parseFloat(formData.lengthMeters),
                DepthMeters: parseFloat(formData.depthMeters),
                MaxDraftMeters: parseFloat(formData.maxDraftMeters),
                AllowedVesselTypes: formData.allowedVesselTypes
            };

            console.log('🔍 Transformed dock data:', dockData);

            // Create dock
            await apiService.createDock(dockData);
            
            setMessage({ type: 'success', text: 'Dock registered successfully!' });
            
            // Reset form
            setFormData({
                name: '',
                location: '',
                lengthMeters: '',
                depthMeters: '',
                maxDraftMeters: '',
                allowedVesselTypes: []
            });

            // Notify parent component
            if (onSuccess) onSuccess();

        } catch (error) {
            console.error('Error registering dock:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Failed to register dock' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container dock-form">
            <div className="form-header">
                <h4>Register Dock</h4>
                <p>Create a new dock with specifications and allowed vessel types</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}

            <form onSubmit={handleSubmit} className="dock-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="name">
                            Dock Name <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., Main Dock, Container Terminal A"
                            className="form-input"
                            required
                        />
                        <small className="form-help">Unique name to identify this dock</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">
                            Location <span className="required">*</span>
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="e.g., Pier 1, North Terminal, Berth 15"
                            className="form-input"
                            required
                        />
                        <small className="form-help">Physical location or berth designation</small>
                    </div>
                </div>

                {/* Dock Dimensions */}
                <div className="dock-dimensions-grid">
                    <div className="form-group">
                        <label htmlFor="lengthMeters">
                            Length (meters) <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="lengthMeters"
                            name="lengthMeters"
                            value={formData.lengthMeters}
                            onChange={handleInputChange}
                            placeholder="e.g., 300"
                            className="form-input"
                            step="0.01"
                            min="0"
                            required
                        />
                        <small className="form-help">Dock length in meters</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="depthMeters">
                            Depth (meters) <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="depthMeters"
                            name="depthMeters"
                            value={formData.depthMeters}
                            onChange={handleInputChange}
                            placeholder="e.g., 18"
                            className="form-input"
                            step="0.01"
                            min="0"
                            required
                        />
                        <small className="form-help">Water depth at dock</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="maxDraftMeters">
                            Max Draft (meters) <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="maxDraftMeters"
                            name="maxDraftMeters"
                            value={formData.maxDraftMeters}
                            onChange={handleInputChange}
                            placeholder="e.g., 15"
                            className="form-input"
                            step="0.01"
                            min="0"
                            required
                        />
                        <small className="form-help">Maximum vessel draft allowed</small>
                    </div>
                </div>

                {/* Vessel Types Selection */}
                <div className="vessel-types-selection">
                    <div className="selection-header">
                        <h5>Allowed Vessel Types <span className="required">*</span></h5>
                        <p>Select which vessel types can use this dock</p>
                    </div>
                    
                    {vesselTypes.length === 0 ? (
                        <div className="loading">Loading vessel types...</div>
                    ) : (
                        <div className="vessel-types-checkboxes">
                            {vesselTypes.map((vesselType) => (
                                <div key={vesselType.name} className="vessel-type-checkbox">
                                    <input
                                        type="checkbox"
                                        id={`vesselType-${vesselType.name}`}
                                        value={vesselType.name}
                                        checked={formData.allowedVesselTypes.includes(vesselType.name)}
                                        onChange={handleVesselTypeChange}
                                    />
                                    <label htmlFor={`vesselType-${vesselType.name}`}>
                                        <strong>{vesselType.name}</strong>
                                        {vesselType.description && (
                                            <span> - {vesselType.description}</span>
                                        )}
                                    </label>
                                </div>
                            ))}
                        </div>
                    )}
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
                                Registering Dock...
                            </>
                        ) : (
                            <>
                                <span>⚓</span>
                                Register Dock
                            </>
                        )}
                    </button>

                    <button 
                        type="button" 
                        className="clear-btn"
                        onClick={() => {
                            setFormData({
                                name: '',
                                location: '',
                                lengthMeters: '',
                                depthMeters: '',
                                maxDraftMeters: '',
                                allowedVesselTypes: []
                            });
                            setMessage({ type: '', text: '' });
                        }}
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

console.log('RegisterDockForm component loaded! 📝');
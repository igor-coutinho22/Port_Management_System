// Add Connection Form Component
console.log('AddConnectionForm component loading...');

const AddConnectionForm = ({ onSuccess }) => {
    const [formData, setFormData] = React.useState({
        dockId: '',
        storageAreaId: '',
        distanceMeters: '',
        travelSeconds: ''
    });
    const [docks, setDocks] = React.useState([]);
    const [storageAreas, setStorageAreas] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    React.useEffect(() => {
        loadDocks();
        loadStorageAreas();
    }, []);

    const loadDocks = async () => {
        try {
            const data = await apiService.getDocks();
            setDocks(data || []);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load docks.' });
        }
    };

    const loadStorageAreas = async () => {
        try {
            const data = await apiService.getStorageAreas();
            const mapped = (data || []).map(item => ({
                id: item.storageArea?.id,
                name: item.storageArea?.name
            }));
            setStorageAreas(mapped);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load storage areas.' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            if (!formData.dockId) throw new Error('Dock is required.');
            if (!formData.storageAreaId) throw new Error('Storage area is required.');
            if (isNaN(parseFloat(formData.distanceMeters)) || parseFloat(formData.distanceMeters) < 0) throw new Error('Distance must be >= 0.');
            if (isNaN(parseInt(formData.travelSeconds)) || parseInt(formData.travelSeconds) < 0) throw new Error('Travel time must be >= 0.');

            // Backend expects DockId, DistanceMeters, TravelSeconds in body, storageAreaId in URL
            const connectionData = {
                DockId: formData.dockId,
                DistanceMeters: parseFloat(formData.distanceMeters), // parseFloat is correct for double
                TravelSeconds: parseInt(formData.travelSeconds)
            };
            await apiService.addConnection(formData.storageAreaId, connectionData); // storageAreaId in URL
            setMessage({ type: 'success', text: 'Connection added successfully.' });
            setFormData({ dockId: '', storageAreaId: '', distanceMeters: '', travelSeconds: '' });
            if (onSuccess) onSuccess();
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Add Dock-StorageArea Connection</h4>
                <p>Register a new connection between a dock and a storage area.</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSubmit} className="connection-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="storageAreaId">Storage Area</label>
                        <select
                            id="storageAreaId"
                            name="storageAreaId"
                            value={formData.storageAreaId}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        >
                            <option value="">Select a storage area</option>
                            {storageAreas.map(area => (
                                <option key={area.id} value={area.id}>{area.name} (ID: {area.id})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="dockId">Dock</label>
                        <select
                            id="dockId"
                            name="dockId"
                            value={formData.dockId}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        >
                            <option value="">Select a dock</option>
                            {docks.map(dock => (
                                <option key={dock.id} value={dock.id}>{dock.name} (ID: {dock.id})</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="distanceMeters">Distance (meters)</label>
                        <input
                            type="number"
                            id="distanceMeters"
                            name="distanceMeters"
                            value={formData.distanceMeters}
                            onChange={handleInputChange}
                            min="0"
                            step="0.1"
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="travelSeconds">Travel Time (seconds)</label>
                        <input
                            type="number"
                            id="travelSeconds"
                            name="travelSeconds"
                            value={formData.travelSeconds}
                            onChange={handleInputChange}
                            min="0"
                            className="form-input"
                            required
                        />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (<><span className="loading-spinner"></span>Adding...</>) : (<><span>➕</span>Add Connection</>)}
                    </button>
                </div>
            </form>
        </div>
    );
};

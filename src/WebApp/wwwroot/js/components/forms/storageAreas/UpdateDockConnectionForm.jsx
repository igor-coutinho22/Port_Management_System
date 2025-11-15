// Update Dock-StorageArea Connection Form Component
console.log('UpdateDockConnectionForm component loading...');

const UpdateDockConnectionForm = ({ onSuccess }) => {
    const [formData, setFormData] = React.useState({
        storageAreaId: '',
        dockId: '',
        distanceMeters: '',
        travelSeconds: ''
    });
    const [storageAreas, setStorageAreas] = React.useState([]);
    const [docks, setDocks] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    React.useEffect(() => {
        loadStorageAreas();
        loadDocks();
    }, []);

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

    const loadDocks = async () => {
        try {
            const data = await apiService.getDocks();
            setDocks(data || []);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load docks.' });
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
            if (!formData.storageAreaId) throw new Error('Please select a storage area.');
            if (!formData.dockId) throw new Error('Please select a dock.');
            if (isNaN(parseFloat(formData.distanceMeters)) || parseFloat(formData.distanceMeters) < 0) throw new Error('Distance must be greater than or equal to 0.');
            if (isNaN(parseInt(formData.travelSeconds)) || parseInt(formData.travelSeconds) < 0) throw new Error('Travel time must be greater than or equal to 0.');

            const connectionData = {
                DockId: formData.dockId,
                DistanceMeters: parseFloat(formData.distanceMeters),
                TravelSeconds: parseInt(formData.travelSeconds)
            };
            await apiService.updateConnection(formData.storageAreaId, formData.dockId, connectionData);
            setMessage({ type: 'success', text: 'Connection updated successfully.' });
            setFormData({ storageAreaId: '', dockId: '', distanceMeters: '', travelSeconds: '' });
            if (onSuccess) onSuccess();
        } catch (error) {
            // Extract personalized backend error message, fallback to HTTP status
            let errorMsg = '';
            if (error?.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.message && error.message.includes('404')) {
                errorMsg = 'Resource not found. Please check the storage area and dock IDs.';
            } else if (error.message && error.message.includes('400')) {
                errorMsg = error?.response?.data?.error || 'Bad request. Please check your input.';
            } else {
                errorMsg = error?.message || 'Failed to update connection.';
            }
            setMessage({ type: 'error', text: errorMsg });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Update Dock-StorageArea Connection</h4>
                <p>Update the distance and travel time for an existing dock-storage area connection.</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`} style={{ color: getMessageColor(message.type) }}>{message.text}</div>
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
                        {isLoading ? (<><span className="loading-spinner"></span>Updating...</>) : (<><span>✏️</span>Update Connection</>)}
                    </button>
                </div>
            </form>
        </div>
    );
};
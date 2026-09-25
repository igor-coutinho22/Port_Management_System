// Register Yard (ContainerYard) Form Component

const RegisterYardForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = React.useState({
        name: '',
        maxCapacityTeu: '',
        currentOccupancyTeu: '',
        dockIds: []
    });
    const [docks, setDocks] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    React.useEffect(() => {
        loadDocks();
    }, []);

    const loadDocks = async () => {
        try {
            const data = await apiService.getDocks();
            setDocks(data || []);
        } catch (error) {
            console.error('Error loading docks:', error);
            setMessage({ type: 'error', text: 'Failed to load docks' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleDockToggle = (dockId) => {
        setFormData(prev => {
            const isSelected = prev.dockIds.includes(dockId);
            const newDockIds = isSelected
                ? prev.dockIds.filter(id => id !== dockId)
                : [...prev.dockIds, dockId];
            return {
                ...prev,
                dockIds: newDockIds
            };
        });
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            if (!formData.name?.trim()) throw new Error('Name is required.');
            if (!formData.dockIds || formData.dockIds.length === 0) throw new Error('At least one dock ID is required.');
            if (isNaN(parseInt(formData.maxCapacityTeu)) || parseInt(formData.maxCapacityTeu) < 0) throw new Error('Max capacity must be >= 0.');
            if (isNaN(parseInt(formData.currentOccupancyTeu)) || parseInt(formData.currentOccupancyTeu) < 0) throw new Error('Current occupancy must be >= 0.');
            if (parseInt(formData.currentOccupancyTeu) > parseInt(formData.maxCapacityTeu)) throw new Error('Current occupancy cannot exceed max capacity.');

            // Build nested DTO for backend
            const yardData = {
                StorageArea: {
                    Name: formData.name,
                    MaxCapacityTeu: parseInt(formData.maxCapacityTeu),
                    CurrentOccupancyTeu: parseInt(formData.currentOccupancyTeu),
                    DockConnections: []
                },
                DockIds: formData.dockIds
            };
            await apiService.createContainerYard(yardData);
            setMessage({ type: 'success', text: 'Container yard registered successfully.' });
            setFormData({ name: '', maxCapacityTeu: '', currentOccupancyTeu: '', dockIds: [] });
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
                <h4>Register Container Yard</h4>
                <p>Fill in the details to register a new container yard.</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSubmit} className="yard-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="name">Name <span className="required">*</span></label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="maxCapacityTeu">Max Capacity (TEU) <span className="required">*</span></label>
                        <input type="number" id="maxCapacityTeu" name="maxCapacityTeu" value={formData.maxCapacityTeu} onChange={handleInputChange} min="0" className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="currentOccupancyTeu">Current Occupancy (TEU) <span className="required">*</span></label>
                        <input type="number" id="currentOccupancyTeu" name="currentOccupancyTeu" value={formData.currentOccupancyTeu} onChange={handleInputChange} min="0" className="form-input" required />
                    </div>
                    <div className="dock-selection-box" style={{
                        background: 'linear-gradient(135deg, #1a2332 80%, #22304a 100%)',
                        border: '2px solid #2de1fc',
                        borderRadius: '14px',
                        padding: '18px 22px',
                        margin: '18px 0',
                        boxShadow: '0 2px 12px 0 rgba(45,225,252,0.08)',
                        color: '#fff',
                        maxWidth: '540px'
                    }}>
                        <div className="selection-header" style={{ marginBottom: '12px', borderBottom: '1px solid #2de1fc', paddingBottom: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <h5 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#2de1fc', margin: 0 }}>
                                <span style={{ marginRight: '6px' }}>🛳️</span>Dock Connections <span className="required">*</span>
                            </h5>
                            <p style={{ fontSize: '0.98rem', color: '#b8eaff', margin: 0 }}>Select which docks are connected to this container yard</p>
                        </div>
                        {docks.length === 0 ? (
                            <div className="loading" style={{ color: '#b8eaff' }}>Loading docks...</div>
                        ) : (
                            <div className="dock-checkboxes" style={{ maxHeight: '220px', overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {docks.map(dock => (
                                    <div key={dock.id} className="dock-checkbox" style={{ background: '#232b3e', borderRadius: '8px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input
                                            type="checkbox"
                                            id={`register-dock-${dock.id}`}
                                            value={dock.id}
                                            checked={formData.dockIds.includes(dock.id)}
                                            onChange={() => handleDockToggle(dock.id)}
                                            style={{ width: '22px', height: '22px', accentColor: '#2de1fc', marginRight: '10px' }}
                                        />
                                        <label htmlFor={`register-dock-${dock.id}`} style={{ color: '#fff', fontWeight: 600, fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span>
                                                {dock.name}
                                                {dock.location && (
                                                    <span style={{ color: '#b8eaff', fontWeight: 400 }}> - {dock.location}</span>
                                                )}
                                                <span style={{ color: '#b8eaff', fontWeight: 400, fontSize: '0.95em' }}> ({dock.id})</span>
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (<><span className="loading-spinner"></span>Loading...</>) : (<>Register Container Yard</>)}
                    </button>
                </div>
            </form>
        </div>
    );
};

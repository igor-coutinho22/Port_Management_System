// Register Yard (ContainerYard) Form Component
console.log('📝 RegisterYardForm component loading...');

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

            const yardData = {
                Name: formData.name,
                MaxCapacityTeu: parseInt(formData.maxCapacityTeu),
                CurrentOccupancyTeu: parseInt(formData.currentOccupancyTeu),
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
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
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
                    <div className="form-group full-width">
                        <label htmlFor="dockIds">Docks Served <span className="required">*</span></label>
                        <div className="dock-selector" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            {docks && docks.map(dock => (
                                <div
                                    key={dock.id}
                                    className={`dock-option${formData.dockIds.includes(dock.id) ? ' selected' : ''}`}
                                    onClick={() => handleDockToggle(dock.id)}
                                    style={{
                                        cursor: 'pointer',
                                        background: formData.dockIds.includes(dock.id) ? '#27ae60' : '#222c36',
                                        color: '#fff',
                                        borderRadius: '6px',
                                        padding: '0.3rem 0.6rem',
                                        boxShadow: formData.dockIds.includes(dock.id) ? '0 0 4px #27ae60' : '0 0 2px #222c36',
                                        border: formData.dockIds.includes(dock.id) ? '2px solid #27ae60' : '1px solid #222c36',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.3rem',
                                        fontWeight: 'bold',
                                        fontSize: '0.95rem',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    <span role="img" aria-label="dock" style={{ fontSize: '1.1rem' }}>🏭</span>
                                    <span className="dock-name">{dock.name}</span>
                                    <span className="dock-id" style={{ fontSize: '0.8rem', background: '#16a085', borderRadius: '4px', padding: '0.1rem 0.3rem', marginLeft: '0.3rem' }}>{dock.id}</span>
                                    {formData.dockIds.includes(dock.id) && (
                                        <span className="selected-indicator" style={{ marginLeft: '0.3rem', color: '#fff', fontWeight: 'bold', fontSize: '1rem' }}>✓</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <small className="form-help">Click on docks to select/deselect them (at least one required)</small>
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

console.log('RegisterYardForm component loaded! 📝');

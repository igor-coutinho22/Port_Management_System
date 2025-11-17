// Edit Storage Area Form Component
console.log('✏️ EditStorageAreaForm component loading...');

const EditStorageAreaForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [formData, setFormData] = React.useState({
        id: '',
        name: '',
        type: '',
        maxCapacityTeu: '',
        currentOccupancyTeu: '',
        specializedCargoType: '', // For warehouse
        dockIds: [], // For container yard
    });
    const [storageArea, setStorageArea] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search'); // 'search' or 'edit'
    const [docks, setDocks] = React.useState([]);

    // Load docks for selection (for container yard)
    React.useEffect(() => {
        if (step === 'edit' && (formData.type === 'ContainerYard' || formData.type === 'containerYard')) {
            loadDocks();
        }
    }, [step, formData.type]);

    const loadDocks = async () => {
        try {
            const data = await apiService.getDocks();
            setDocks(data || []);
        } catch (error) {
            console.error('Error loading docks:', error);
            setMessage({ type: 'error', text: 'Failed to load docks' });
        }
    };

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

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: 'Storage Area ID is required' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setStorageArea(null);
        try {
            const data = await apiService.getStorageAreaById(searchData.id.trim());
            if (data) {
                setStorageArea(data);
                setFormData({
                    id: data.id,
                    name: data.name || '',
                    type: data.type || '',
                    maxCapacityTeu: data.maxCapacityTeu || '',
                    currentOccupancyTeu: data.currentOccupancyTeu || '',
                    specializedCargoType: data.specializedCargoType || '',
                    dockIds: data.dockIds || [],
                });
                setHasSearched(true);
                setStep('edit');
                setMessage({ type: 'success', text: 'Storage area found successfully' });
            } else {
                setStorageArea(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'Storage area not found' });
            }
        } catch (error) {
            if (error.message && error.message.includes('404')) {
                setMessage({ type: 'info', text: 'Storage area not found with the provided ID' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch storage area. Please try again.' });
            }
            setStorageArea(null);
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
            if (!formData.name?.trim() || !formData.maxCapacityTeu?.toString().trim()) {
                throw new Error('Name and max capacity are required');
            }
            // Prepare DTO based on type
            let updateData;
            if (formData.type === 'Warehouse' || formData.type === 'warehouse') {
                if (!formData.specializedCargoType?.trim()) {
                    throw new Error('Specialized cargo type is required for warehouses');
                }
                updateData = {
                    StorageArea: {
                        Id: formData.id,
                        Name: formData.name.trim(),
                        Type: formData.type,
                        MaxCapacityTeu: parseInt(formData.maxCapacityTeu),
                        CurrentOccupancyTeu: parseInt(formData.currentOccupancyTeu),
                        DockConnections: []
                    },
                    SpecializedCargoType: formData.specializedCargoType.trim()
                };
                await apiService.updateWarehouse(formData.id, updateData);
            } else if (formData.type === 'ContainerYard' || formData.type === 'containerYard') {
                if (!formData.dockIds || formData.dockIds.length === 0) {
                    throw new Error('At least one dock ID is required for container yards');
                }
                updateData = {
                    StorageArea: {
                        Id: formData.id,
                        Name: formData.name.trim(),
                        Type: formData.type,
                        MaxCapacityTeu: parseInt(formData.maxCapacityTeu),
                        CurrentOccupancyTeu: parseInt(formData.currentOccupancyTeu),
                        DockConnections: []
                    },
                    DockIds: formData.dockIds
                };
                await apiService.updateContainerYard(formData.id, updateData);
            } else {
                throw new Error('Unsupported storage area type');
            }
            setMessage({ type: 'success', text: 'Storage area updated successfully' });
            if (onSuccess) onSuccess();
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to update storage area. Please try again.' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setFormData({
            id: '',
            name: '',
            type: '',
            maxCapacityTeu: '',
            currentOccupancyTeu: '',
            specializedCargoType: '',
            dockIds: [],
        });
        setStorageArea(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    const handleNewSearch = () => {
        setSearchData({ id: '' });
        setStorageArea(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Edit Storage Area</h4>
                <p>Search for a storage area by ID and modify its information</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {/* Step 1: Search for Storage Area */}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchId">Storage Area ID</label>
                            <input
                                type="text"
                                id="searchId"
                                name="id"
                                value={searchData.id}
                                onChange={handleSearchInputChange}
                                placeholder="Enter storage area ID"
                                className="form-input"
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>Loading...</>) : (<><span>🔍</span>Search Storage Area</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>Cancel
                        </button>
                    </div>
                </form>
            )}
            {/* Step 2: Edit Storage Area Form */}
            {step === 'edit' && storageArea && (
                <>
                    <div className="form-section-header">
                        <h5>Editing storage area: {formData.name} (ID: {formData.id})</h5>
                        <button type="button" className="link-btn" onClick={handleNewSearch}>🔍 Search different storage area</button>
                    </div>
                    <form onSubmit={handleUpdate} className="storage-area-form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="editId">ID</label>
                                <input type="text" id="editId" name="id" value={formData.id} className="form-input" disabled />
                                <small className="form-help">ID cannot be changed</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="editName">Name <span className="required">*</span></label>
                                <input type="text" id="editName" name="name" value={formData.name} onChange={handleFormInputChange} placeholder="Enter name" className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editType">Type</label>
                                <input type="text" id="editType" name="type" value={formData.type} className="form-input" disabled />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editMaxCapacityTeu">Max Capacity (TEU) <span className="required">*</span></label>
                                <input type="number" id="editMaxCapacityTeu" name="maxCapacityTeu" value={formData.maxCapacityTeu} onChange={handleFormInputChange} placeholder="Enter max capacity" min="1" className="form-input" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="editCurrentOccupancyTeu">Current Occupancy (TEU)</label>
                                <input type="number" id="editCurrentOccupancyTeu" name="currentOccupancyTeu" value={formData.currentOccupancyTeu} onChange={handleFormInputChange} placeholder="Enter current occupancy" min="0" className="form-input" />
                            </div>
                            {/* Specialized fields for warehouse and container yard */}
                            {formData.type === 'Warehouse' || formData.type === 'warehouse' ? (
                                <div className="form-group">
                                    <label htmlFor="editSpecializedCargoType">Specialized Cargo Type <span className="required">*</span></label>
                                    <input type="text" id="editSpecializedCargoType" name="specializedCargoType" value={formData.specializedCargoType} onChange={handleFormInputChange} placeholder="Enter specialized cargo type" className="form-input" required />
                                </div>
                            ) : null}
                            {formData.type === 'ContainerYard' || formData.type === 'containerYard' ? (
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
                                            <span style={{ marginRight: '6px' }}></span>Dock Connections <span className="required">*</span>
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
                                                        id={`edit-dock-${dock.id}`}
                                                        value={dock.id}
                                                        checked={formData.dockIds.includes(dock.id)}
                                                        onChange={e => {
                                                            const checked = e.target.checked;
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                dockIds: checked
                                                                    ? [...prev.dockIds, dock.id]
                                                                    : prev.dockIds.filter(id => id !== dock.id)
                                                            }));
                                                        }}
                                                        style={{ width: '22px', height: '22px', accentColor: '#2de1fc', marginRight: '10px' }}
                                                    />
                                                    <label htmlFor={`edit-dock-${dock.id}`} style={{ color: '#fff', fontWeight: 600, fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
                            ) : null}
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="submit-btn" disabled={isUpdating}>
                                {isUpdating ? (<><span className="loading-spinner"></span>Updating...</>) : (<><span>✏️</span>Update Storage Area</>)}
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

console.log('EditStorageAreaForm component loaded! ✏️');

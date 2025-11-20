// Edit Vessel Visit Notification Form Component
console.log('EditVesselVisitNotificationForm component loading...');

const EditVesselVisitNotificationForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [formData, setFormData] = React.useState({
        id: '',
        vesselIMO: '',
        dockId: '',
        visitDate: '',
        status: '',
        purpose: '',
        crew: [{ name: '', citizenId: '', nationality: '' }],
        loadingManifest: [],
        unloadingManifest: []
    });
    const [notification, setNotification] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isUpdating, setIsUpdating] = React.useState(false);
    const [hasSearched, setHasSearched] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search'); // 'search' or 'edit'

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

    // Crew dynamic handlers (copied from Register form)
    const handleCrewChange = (idx, field, value) => {
        setFormData(prev => {
            const crew = [...prev.crew];
            crew[idx][field] = value;
            return { ...prev, crew };
        });
        if (message.text) setMessage({ type: '', text: '' });
    };
    const addCrewMember = () => {
        setFormData(prev => ({ ...prev, crew: [...prev.crew, { name: '', citizenId: '', nationality: '' }] }));
    };
    const removeCrewMember = (idx) => {
        setFormData(prev => ({ ...prev, crew: prev.crew.filter((_, i) => i !== idx) }));
    };

    // Manifest handlers (copied from Register form)
    const handleManifestChange = (type, idx, value) => {
        setFormData(prev => {
            const manifest = [...(prev[type] || [])];
            manifest[idx] = value;
            return { ...prev, [type]: manifest };
        });
    };
    const addManifestContainer = (type) => {
        setFormData(prev => ({ ...prev, [type]: [...(prev[type] || []), ''] }));
    };
    const removeManifestContainer = (type, idx) => {
        setFormData(prev => ({ ...prev, [type]: (prev[type] || []).filter((_, i) => i !== idx) }));
    };

    // Validate GUID format
    const isValidGuid = (guid) => {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return guidRegex.test(guid);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchData.id.trim()) {
            setMessage({ type: 'error', text: 'Notification ID is required' });
            return;
        }
        if (!isValidGuid(searchData.id.trim())) {
            setMessage({ type: 'error', text: 'Invalid GUID format. Please enter a valid notification ID' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setHasSearched(false);
        setNotification(null);
        try {
            const data = await apiService.getVesselVisitNotificationById(searchData.id.trim());
            if (data) {
                setNotification(data);
                setFormData({
                    id: searchData.id.trim(),
                    vesselIMO: data.vesselIMO || '',
                    dockId: data.dockId || '',
                    visitDate: data.visitDate ? data.visitDate.substring(0, 10) : '',
                    status: data.status || '',
                    purpose: data.purpose || '',
                    crew: Array.isArray(data.crew) && data.crew.length > 0 ? data.crew : [{ name: '', citizenId: '', nationality: '' }],
                    loadingManifest: data.loadingManifest && data.loadingManifest.containers ? data.loadingManifest.containers.map(c => c.identifier) : [],
                    unloadingManifest: data.unloadingManifest && data.unloadingManifest.containers ? data.unloadingManifest.containers.map(c => c.identifier) : []
                });

                if (data.status !== 'InProgress') {
                    setMessage({ type: 'error', text: 'Only notifications with status "InProgress" can be edited.' });
                    setIsLoading(false);
                    return;
                }
                setHasSearched(true);   
                setStep('edit');
                setMessage({ type: 'success', text: 'Notification found successfully' });
            } else {
                setNotification(null);
                setHasSearched(true);
                setMessage({ type: 'info', text: 'Notification not found' });
            }
        } catch (error) {
            console.error('Error fetching notification:', error);
            if (error.message && error.message.includes('404')) {
                setMessage({ type: 'info', text: 'Notification not found with the provided ID' });
            } else {
                setMessage({ type: 'error', text: error.message || 'Failed to fetch notification. Please try again.' });
            }
            setNotification(null);
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
            if (!formData.vesselIMO?.trim() || !formData.dockId?.trim() || !formData.visitDate?.trim() || !formData.status?.trim() || !formData.purpose?.trim()) {
                throw new Error('All fields are required');
            }
            // Transform manifests to match backend DTO
            const loadingManifest = formData.loadingManifest && formData.loadingManifest.length > 0
                ? {
                    containers: formData.loadingManifest.filter(c => c.trim()).map(c => ({ identifier: c.trim() }))
                }
                : null;
            const unloadingManifest = formData.unloadingManifest && formData.unloadingManifest.length > 0
                ? {
                    containers: formData.unloadingManifest.filter(c => c.trim()).map(c => ({ identifier: c.trim() }))
                }
                : null;

            // Prepare DTO for backend (only updatable fields)
            const updateData = {
                dockId: formData.dockId,
                visitDate: formData.visitDate,
                purpose: formData.purpose,
                crew: formData.crew,
                loadingManifest: loadingManifest,
                unloadingManifest: unloadingManifest
            };
            await apiService.editVesselVisitNotificationWhileInProgress(formData.id, updateData);
            setMessage({ type: 'success', text: 'Notification updated successfully' });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error updating notification:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to update notification. Please try again.' });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleClear = () => {
        setSearchData({ id: '' });
        setFormData({
            id: '', vesselIMO: '', dockId: '', visitDate: '', status: '', purpose: '', crew: [], loadingManifest: null, unloadingManifest: null
        });
        setNotification(null);
        setHasSearched(false);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    // Dropdown state for vessels and docks
    const [docks, setDocks] = React.useState([]);
    const [vessels, setVessels] = React.useState([]);

    // Load docks and vessels on mount
    React.useEffect(() => {
        const loadDocks = async () => {
            try {
                const dockList = await apiService.getDocks();
                setDocks(dockList);
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to load docks' });
            }
        };
        const loadVessels = async () => {
            try {
                const vesselList = await apiService.getVessels();
                setVessels(vesselList);
            } catch (error) {
                setMessage({ type: 'error', text: 'Failed to load vessels' });
            }
        };
        loadDocks();
        loadVessels();
    }, []);
    
    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Edit Vessel Visit Notification</h4>
                <p>Edit details of a vessel visit notification by its unique identifier</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="searchId">Notification ID</label>
                            <input
                                type="text"
                                id="searchId"
                                name="id"
                                value={searchData.id}
                                onChange={handleSearchInputChange}
                                placeholder="Enter notification ID (e.g., 12345678-1234-1234-1234-123456789abc)"
                                className="form-input"
                            />
                            <small className="form-help">Must be a valid GUID format</small>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>Loading...</>) : (<><span>✏️</span>Find Notification</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🔄</span>Clear
                        </button>
                    </div>
                </form>
            )}
            {step === 'edit' && notification && (
                <form onSubmit={handleUpdate} className="edit-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="editVesselIMO">Vessel <span className="required">*</span></label>
                            <select
                                id="editVesselIMO"
                                name="vesselIMO"
                                value={formData.vesselIMO}
                                onChange={handleFormInputChange}
                                className="form-input"
                                required
                            >
                                <option value="">Select vessel...</option>
                                {vessels.map(vessel => (
                                    <option key={vessel.imo} value={vessel.imo}>{vessel.imo} - {vessel.vesselName}</option>
                                ))}
                            </select>
                            <small className="form-help">Select vessel by name/IMO</small>
                        </div>
                        <div className="form-group">
                            <label htmlFor="editDockId">Dock <span className="required">*</span></label>
                            <select
                                id="editDockId"
                                name="dockId"
                                value={formData.dockId}
                                onChange={handleFormInputChange}
                                className="form-input"
                                required
                            >
                                <option value="">Select dock...</option>
                                {docks.map(dock => (
                                    <option key={dock.id} value={dock.id}>{dock.name}</option>
                                ))}
                            </select>
                            <small className="form-help">Dock for vessel visit</small>
                        </div>
                        <div className="form-group">
                            <label htmlFor="editVisitDate">Visit Date</label>
                            <input
                                type="date"
                                id="editVisitDate"
                                name="visitDate"
                                value={formData.visitDate}
                                onChange={handleFormInputChange}
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="editStatus">Status</label>
                            <input
                                type="text"
                                id="editStatus"
                                name="status"
                                value={formData.status}
                                className="form-input"
                                disabled
                                readOnly
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="editPurpose">Purpose <span className="required">*</span></label>
                            <select
                                id="editPurpose"
                                name="purpose"
                                value={formData.purpose}
                                onChange={handleFormInputChange}
                                className="form-input"
                                required
                            >
                                <option value="">Select purpose...</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Maintenance">Maintenance</option>
                            </select>
                            <small className="form-help">Purpose of visit</small>
                        </div>
                        {/* Crew Members (RegisterForm logic) */}
                        <div className="form-group">
                            <label>Crew <span className="required">*</span></label>
                            <div className="card-list">
                            {formData.crew.map((member, idx) => (
                                <div key={idx} className="card crew-card">
                                    <div className="card-fields">
                                        <input
                                            type="text"
                                            placeholder="Name"
                                            value={member.name}
                                            onChange={e => handleCrewChange(idx, 'name', e.target.value)}
                                            className="form-input crew-input"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Citizen ID"
                                            value={member.citizenId}
                                            onChange={e => handleCrewChange(idx, 'citizenId', e.target.value)}
                                            className="form-input crew-input"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Nationality"
                                            value={member.nationality}
                                            onChange={e => handleCrewChange(idx, 'nationality', e.target.value)}
                                            className="form-input crew-input"
                                            required
                                        />
                                    </div>
                                    {formData.crew.length > 1 && (
                                        <button type="button" className="remove-btn" onClick={() => removeCrewMember(idx)}>✖</button>
                                    )}
                                </div>
                            ))}
                            </div>
                            <button type="button" className="add-btn" onClick={addCrewMember}>Add Crew Member</button>
                            <small className="form-help">Add all crew members (name, citizen ID, nationality)</small>
                        </div>
                        {/* Manifests (RegisterForm logic) */}
                        <div className="form-group">
                            <label>Loading Manifest (Container IDs)</label>
                            <div className="card-list">
                            {(formData.loadingManifest || []).map((container, idx) => (
                                <div key={idx} className="card manifest-card">
                                    <div className="card-fields">
                                        <input
                                            type="text"
                                            placeholder="Container ID (ISO 6346)"
                                            value={container}
                                            onChange={e => handleManifestChange('loadingManifest', idx, e.target.value)}
                                            className="form-input manifest-input"
                                        />
                                    </div>
                                    <button type="button" className="remove-btn" onClick={() => removeManifestContainer('loadingManifest', idx)}>✖</button>
                                </div>
                            ))}
                            </div>
                            <button type="button" className="add-btn" onClick={() => addManifestContainer('loadingManifest')}>Add Container</button>
                            <small className="form-help">Add container IDs for loading manifest</small>
                        </div>
                        <div className="form-group">
                            <label>Unloading Manifest (Container IDs)</label>
                            <div className="card-list">
                            {(formData.unloadingManifest || []).map((container, idx) => (
                                <div key={idx} className="card manifest-card">
                                    <div className="card-fields">
                                        <input
                                            type="text"
                                            placeholder="Container ID (ISO 6346)"
                                            value={container}
                                            onChange={e => handleManifestChange('unloadingManifest', idx, e.target.value)}
                                            className="form-input manifest-input"
                                        />
                                    </div>
                                    <button type="button" className="remove-btn" onClick={() => removeManifestContainer('unloadingManifest', idx)}>✖</button>
                                </div>
                            ))}
                            </div>
                            <button type="button" className="add-btn" onClick={() => addManifestContainer('unloadingManifest')}>Add Container</button>
                            <small className="form-help">Add container IDs for unloading manifest</small>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isUpdating}>
                            {isUpdating ? (<><span className="loading-spinner"></span>Updating...</>) : (<><span>✏️</span>Update Notification</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isUpdating}>
                            <span>🔄</span>Clear
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

console.log('EditVesselVisitNotificationForm component loaded!');

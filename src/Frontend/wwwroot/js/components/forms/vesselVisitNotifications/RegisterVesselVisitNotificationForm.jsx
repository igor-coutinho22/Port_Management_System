
// Register Vessel Visit Notification Form Component
console.log('📝 RegisterVesselVisitNotificationForm component loading...');

// ISO 6346 container ID validation (format only)
function isValidContainerId(id) {
    const pattern = /^[A-Z]{3}[UJZ][0-9]{7}$/i;
    return pattern.test(id);
}

const RegisterVesselVisitNotificationForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = React.useState({
        vesselIMO: '',
        shippingAgentOrganizationId: '',
        dockId: '',
        visitDate: '',
        arrivalTime: '',
        desiredDepartureTime: '',
        estimatedLoadingDurationMinutes: 0,
        estimatedUnloadingDurationMinutes: 0,
        purpose: '',
        crew: [{ name: '', citizenId: '', nationality: '' }],
        loadingManifest: [],
        unloadingManifest: [],
    });
    const [docks, setDocks] = React.useState([]);
    const [organizations, setOrganizations] = React.useState([]);
    const [vessels, setVessels] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // Load docks and vessels on mount
    React.useEffect(() => {
        loadDocks();
        loadVessels();
        loadOrganizations();
    }, []);

    const loadDocks = async () => {
        try {
            const dockList = await apiService.getDocks();
            setDocks(dockList);
        } catch (error) {
            console.error('Error loading docks:', error);
            setMessage({ type: 'error', text: 'Failed to load docks' });
        }
    };
    const loadVessels = async () => {
        try {
            const vesselList = await apiService.getVessels();
            setVessels(vesselList);
        } catch (error) {
            console.error('Error loading vessels:', error);
            setMessage({ type: 'error', text: 'Failed to load vessels' });
        }
    };
    const loadOrganizations = async () => {
        try {
            const orgList = await apiService.getOrganizations();
            // Filter for active organizations only
            setOrganizations(orgList.filter(org => org.isActive));
        } catch (error) {
            console.error('Error loading organizations:', error);
            setMessage({ type: 'error', text: 'Failed to load organizations' });
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

    // Crew dynamic handlers
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

    // Manifest handlers
    const handleManifestChange = (type, idx, value) => {
        setFormData(prev => {
            const manifest = [...prev[type]];
            manifest[idx] = value;
            return { ...prev, [type]: manifest };
        });
    };
    const addManifestContainer = (type) => {
        setFormData(prev => ({ ...prev, [type]: [...prev[type], ''] }));
    };
    const removeManifestContainer = (type, idx) => {
        setFormData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== idx) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // Validate required fields
            if (!formData.vesselIMO?.trim()) throw new Error('Vessel is required');
            if (!formData.dockId?.trim()) throw new Error('Dock is required');
            if (!formData.visitDate?.trim()) throw new Error('Visit date is required');
            if (!formData.shippingAgentOrganizationId?.trim()) throw new Error('Organization is required');
            if (!formData.arrivalTime) throw new Error('Arrival time is required');
            if (!formData.desiredDepartureTime) throw new Error('Desired departure time is required');
            if (formData.estimatedLoadingDurationMinutes < 0) throw new Error('Loading duration cannot be negative');
            if (formData.estimatedUnloadingDurationMinutes < 0) throw new Error('Unloading duration cannot be negative');

            if (!formData.purpose?.trim()) throw new Error('Purpose is required');
            if (!formData.crew || formData.crew.length === 0 || formData.crew.some(c => !c.name.trim() || !c.citizenId.trim() || !c.nationality.trim())) {
                throw new Error('All crew members must have name, citizen ID, and nationality');
            }
            // Validate container IDs client-side (format only)
            const allContainerIds = [...formData.loadingManifest, ...formData.unloadingManifest].filter(c => c.trim());
            const invalidContainer = allContainerIds.find(c => !isValidContainerId(c.trim()));
            if (invalidContainer) {
                throw new Error(`Invalid container ID: ${invalidContainer}. Must follow format: 3 uppercase letters, 1 of U/J/Z, 7 digits.`);
            }
            // If Commercial, require at least one manifest
            if (
                formData.purpose === 'Commercial' &&
                !(
                    formData.loadingManifest.some(c => c.trim()) ||
                    formData.unloadingManifest.some(c => c.trim())
                )
            ) {
                throw new Error('Commercial visits require at least one cargo manifest (loading or unloading)');
            }

            // Transform manifests to match backend DTO
            const loadingManifest = formData.loadingManifest.length > 0
                ? {
                    Containers: formData.loadingManifest.filter(c => c.trim()).map(c => ({ Identifier: c.trim() }))
                }
                : null;
            const unloadingManifest = formData.unloadingManifest.length > 0
                ? {
                    Containers: formData.unloadingManifest.filter(c => c.trim()).map(c => ({ Identifier: c.trim() }))
                }
                : null;

            // Transform data to match backend DTO
            const notificationData = {
                VesselIMO: formData.vesselIMO,
                ShippingAgentOrganizationId: formData.shippingAgentOrganizationId,
                DockId: formData.dockId,
                VisitDate: formData.visitDate,
                ArrivalTime: formData.arrivalTime,
                DesiredDepartureTime: formData.desiredDepartureTime,
                EstimatedLoadingDurationMinutes: parseInt(formData.estimatedLoadingDurationMinutes, 10),
                EstimatedUnloadingDurationMinutes: parseInt(formData.estimatedUnloadingDurationMinutes, 10),
                Purpose: formData.purpose,
                Crew: formData.crew,
                LoadingManifest: loadingManifest,
                UnloadingManifest: unloadingManifest
            };

            await apiService.createVesselVisitNotification(notificationData);
            setMessage({ type: 'success', text: 'Vessel visit notification registered successfully!' });
            setFormData({
                vesselIMO: '',
                shippingAgentOrganizationId: '',
                dockId: '',
                visitDate: '',
                arrivalTime: '',
                desiredDepartureTime: '',
                estimatedLoadingDurationMinutes: 0,
                estimatedUnloadingDurationMinutes: 0,
                purpose: '',
                crew: [{ name: '', citizenId: '', nationality: '' }],
                loadingManifest: [],
                unloadingManifest: [],
            });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error registering notification:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to register notification' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container vessel-visit-notification-form">
            <div className="form-header">
                <h4>Register Vessel Visit Notification</h4>
                <p>Create a new vessel visit notification for a dock</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSubmit} className="vessel-visit-notification-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="vesselIMO">Vessel <span className="required">*</span></label>
                        <select
                            id="vesselIMO"
                            name="vesselIMO"
                            value={formData.vesselIMO}
                            onChange={handleInputChange}
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
                        <label htmlFor="shippingAgentOrganizationId">Organization <span className="required">*</span></label>
                        <select
                            id="shippingAgentOrganizationId"
                            name="shippingAgentOrganizationId"
                            value={formData.shippingAgentOrganizationId}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        >
                            <option value="">Select organization...</option>
                            {organizations.map(org => (
                                <option key={org.id} value={org.id}>{org.legalName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="dockId">Dock <span className="required">*</span></label>
                        <select
                            id="dockId"
                            name="dockId"
                            value={formData.dockId}
                            onChange={handleInputChange}
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
                        <label htmlFor="visitDate">Visit Date <span className="required">*</span></label>
                        <input
                            type="date"
                            id="visitDate"
                            name="visitDate"
                            value={formData.visitDate}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        />
                        <small className="form-help">Date of vessel visit</small>
                    </div>
                    <div className="form-group">
                        <label htmlFor="arrivalTime">Arrival Time <span className="required">*</span></label>
                        <input
                            type="datetime-local"
                            id="arrivalTime"
                            name="arrivalTime"
                            value={formData.arrivalTime}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="desiredDepartureTime">Desired Departure Time <span className="required">*</span></label>
                        <input
                            type="datetime-local"
                            id="desiredDepartureTime"
                            name="desiredDepartureTime"
                            value={formData.desiredDepartureTime}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="estimatedLoadingDurationMinutes">Est. Loading Time (min)</label>
                        <input
                            type="number"
                            id="estimatedLoadingDurationMinutes"
                            name="estimatedLoadingDurationMinutes"
                            value={formData.estimatedLoadingDurationMinutes}
                            onChange={handleInputChange}
                            className="form-input"
                            min="0"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="estimatedUnloadingDurationMinutes">Est. Unloading Time (min)</label>
                        <input
                            type="number"
                            id="estimatedUnloadingDurationMinutes"
                            name="estimatedUnloadingDurationMinutes"
                            value={formData.estimatedUnloadingDurationMinutes}
                            onChange={handleInputChange}
                            className="form-input"
                            min="0"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="purpose">Purpose <span className="required">*</span></label>
                        <select
                            id="purpose"
                            name="purpose"
                            value={formData.purpose}
                            onChange={handleInputChange}
                            className="form-input"
                            required
                        >
                            <option value="">Select purpose...</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Maintenance">Maintenance</option>
                        </select>
                        <small className="form-help">Purpose of visit</small>
                    </div>
                    {/* Crew Members */}
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
                    {/* Manifests */}
                    <div className="form-group">
                        <label>Loading Manifest (Container IDs)</label>
                        <div className="card-list">
                        {formData.loadingManifest.map((container, idx) => (
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
                        {formData.unloadingManifest.map((container, idx) => (
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
                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Registering Notification...
                            </>
                        ) : (
                            <>
                                <span>🚢</span>
                                Register Notification
                            </>
                        )}
                    </button>
                    <button 
                        type="button" 
                        className="clear-btn"
                        onClick={() => {
                            setFormData({
                                vesselIMO: '',
                                shippingAgentOrganizationId: '',
                                dockId: '',
                                visitDate: '',
                                arrivalTime: '',
                                desiredDepartureTime: '',
                                estimatedLoadingDurationMinutes: 0,
                                estimatedUnloadingDurationMinutes: 0,
                                purpose: '',
                                crew: [{ name: '', citizenId: '', nationality: '' }],
                                loadingManifest: [],
                                unloadingManifest: [],
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

console.log('RegisterVesselVisitNotificationForm component loaded!');

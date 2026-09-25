// Edit Vessel Visit Notification Form Component

const EditVesselVisitNotificationForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [searchData, setSearchData] = React.useState({ id: '' });
    const [formData, setFormData] = React.useState({
        id: '',
        dockId: '',
        visitDate: '',
        status: '',
        purpose: '',
        arrivalTime: '',
        desiredDepartureTime: '',
        estimatedLoadingDurationMinutes: 0,
        estimatedUnloadingDurationMinutes: 0,
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
                    dockId: data.dockId || '',
                    visitDate: data.visitDate ? data.visitDate.substring(0, 10) : '',
                    status: data.status || '',
                    purpose: data.purpose || '',
                    arrivalTime: data.arrivalTime ? data.arrivalTime.substring(0, 16) : '',
                    desiredDepartureTime: data.desiredDepartureTime ? data.desiredDepartureTime.substring(0, 16) : '',
                    estimatedLoadingDurationMinutes: data.estimatedLoadingDurationMinutes || 0,
                    estimatedUnloadingDurationMinutes: data.estimatedUnloadingDurationMinutes || 0,
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
            if (!formData.dockId?.trim() || !formData.visitDate?.trim() || !formData.purpose?.trim() || !formData.arrivalTime || !formData.desiredDepartureTime) {
                throw new Error('All fields are required');
            }
            if (new Date(formData.desiredDepartureTime) <= new Date(formData.arrivalTime)) {
                throw new Error('Desired departure time must be after arrival time.');
            }

            // Purpose change validation: if changing from Maintenance to Commercial, must have at least one manifest
            if (
                notification &&
                notification.purpose === 'Maintenance' &&
                formData.purpose === 'Commercial' &&
                (!notification.loadingManifest || !notification.loadingManifest.containers || notification.loadingManifest.containers.length === 0) &&
                (!notification.unloadingManifest || !notification.unloadingManifest.containers || notification.unloadingManifest.containers.length === 0)
            ) {
                setMessage({ type: 'error', text: 'Cannot change purpose to Commercial: at least one manifest is required. Please add a manifest first.' });
                setIsUpdating(false);
                return;
            }

            // Prepare DTO for backend (only updatable fields)
            const updateData = {
                DockId: formData.dockId,
                VisitDate: formData.visitDate,
                Purpose: formData.purpose,
                ArrivalTime: new Date(formData.arrivalTime).toISOString(),
                DesiredDepartureTime: new Date(formData.desiredDepartureTime).toISOString(),
                EstimatedLoadingDurationMinutes: parseInt(formData.estimatedLoadingDurationMinutes, 10),
                EstimatedUnloadingDurationMinutes: parseInt(formData.estimatedUnloadingDurationMinutes, 10),
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
            id: '',
            dockId: '',
            visitDate: '',
            status: '',
            purpose: '',
            arrivalTime: '',
            desiredDepartureTime: '',
            estimatedLoadingDurationMinutes: 0,
            estimatedUnloadingDurationMinutes: 0,
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
                        <div className="form-group">
                            <label htmlFor="editArrivalTime">Arrival Time <span className="required">*</span></label>
                            <input
                                type="datetime-local"
                                id="editArrivalTime"
                                name="arrivalTime"
                                value={formData.arrivalTime}
                                onChange={handleFormInputChange}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="editDesiredDepartureTime">Desired Departure Time <span className="required">*</span></label>
                            <input
                                type="datetime-local"
                                id="editDesiredDepartureTime"
                                name="desiredDepartureTime"
                                value={formData.desiredDepartureTime}
                                onChange={handleFormInputChange}
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="editEstimatedLoadingDurationMinutes">Est. Loading Time (min)</label>
                            <input
                                type="number"
                                id="editEstimatedLoadingDurationMinutes"
                                name="estimatedLoadingDurationMinutes"
                                value={formData.estimatedLoadingDurationMinutes}
                                onChange={handleFormInputChange}
                                className="form-input"
                                min="0"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="editEstimatedUnloadingDurationMinutes">Est. Unloading Time (min)</label>
                            <input
                                type="number"
                                id="editEstimatedUnloadingDurationMinutes"
                                name="estimatedUnloadingDurationMinutes"
                                value={formData.estimatedUnloadingDurationMinutes}
                                onChange={handleFormInputChange}
                                className="form-input"
                                min="0"
                            />
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

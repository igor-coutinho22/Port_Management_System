// Manage Loading Manifests Form Component
console.log('ManageLoadingManifestsForm component loading...');


const ManageLoadingManifestsForm = ({ onSuccess }) => {
    const [step, setStep] = React.useState(1); // 1: enter ID, 2: choose action, 3: add/remove
    const [notificationId, setNotificationId] = React.useState('');
    const [notificationValid, setNotificationValid] = React.useState(false);
    const [manifestExists, setManifestExists] = React.useState(false);
    const [manifestInfo, setManifestInfo] = React.useState(null);
    const [containerIds, setContainerIds] = React.useState(['']);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [action, setAction] = React.useState(''); // '' until chosen
    const [confirmRemove, setConfirmRemove] = React.useState(false);

    // Step 1: Validate notification ID and check manifest using getVesselVisitNotificationById
    const handleNotificationIdSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            if (!notificationId.trim()) throw new Error('Notification ID is required');
            // Check notification exists (API call)
            const notification = await apiService.getVesselVisitNotificationById(notificationId.trim());
            if (!notification) throw new Error('Vessel visit notification not found.');
            setNotificationValid(true);
            // Check if loading manifest exists in notification object
            const manifest = notification.LoadingManifest || notification.loadingManifest;
            if (manifest) {
                setManifestExists(true);
                setManifestInfo(manifest);
            } else {
                setManifestExists(false);
                setManifestInfo(null);
            }
            setStep(2);
            
            if (notification.status !== 'InProgress') {
                setMessage({ type: 'error', text: 'Only notifications with status "InProgress" can be edited.' });
                setNotificationValid(false);
                setStep(1);
                setNotificationId('');
                return;
            }
            
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Notification not found.' });
            setNotificationValid(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Choose action
    const handleActionChange = (e) => {
        setAction(e.target.value);
        setMessage({ type: '', text: '' });
        if (e.target.value === 'remove' && manifestExists) {
            setStep(3);
        } else if (e.target.value === 'add' && !manifestExists) {
            setStep(3);
        } else if (e.target.value === 'add' && manifestExists) {
            setMessage({ type: 'error', text: 'A loading manifest already exists. Please remove it first.' });
        } else if (e.target.value === 'remove' && !manifestExists) {
            setMessage({ type: 'error', text: 'No loading manifest exists to remove.' });
        }
    };

    // Step 3: Add or Remove
    const handleAddManifest = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // Only request container IDs, manifest ID is automatic
            const containers = containerIds.filter(c => c.trim()).map(c => ({ Identifier: c.trim() }));
            if (containers.length === 0) throw new Error('At least one container ID is required.');
            // Always set Type: 'Loading' in DTO
            await apiService.addLoadingManifestToVesselVisitNotification(notificationId.trim(), { Type: 'Loading', Containers: containers });
            setMessage({ type: 'success', text: 'Loading manifest added successfully.' });
            if (onSuccess) onSuccess();
            setStep(1);
            setNotificationId('');
            setContainerIds(['']);
            setAction('');
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to add manifest.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveManifest = async () => {
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // Prepare the manifest DTO from manifestInfo
            const manifestDto = {
                Id: manifestInfo.Id,
                Type: manifestInfo.Type,
                Containers: manifestInfo.Containers
            };
            await apiService.removeLoadingManifestFromVesselVisitNotification(notificationId.trim(), manifestDto);
            setMessage({ type: 'success', text: 'Loading manifest removed successfully.' });
            if (onSuccess) onSuccess();
            setStep(1);
            setNotificationId('');
            setContainerIds(['']);
            setAction('');
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to remove manifest.' });
        } finally {
            setIsLoading(false);
            setConfirmRemove(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'notificationId') setNotificationId(value);
        if (name.startsWith('containerId')) {
            const idx = parseInt(name.split('-')[1], 10);
            setContainerIds(ids => ids.map((id, i) => i === idx ? value : id));
        }
        if (message.text) setMessage({ type: '', text: '' });
    };
    const handleAddContainerField = () => {
        setContainerIds(ids => [...ids, '']);
    };
    const handleRemoveContainerField = (idx) => {
        setContainerIds(ids => ids.filter((_, i) => i !== idx));
    };
    const handleClear = () => {
        setStep(1);
        setNotificationId('');
        setNotificationValid(false);
        setManifestExists(false);
        setManifestInfo(null);
        setContainerIds(['']);
        setMessage({ type: '', text: '' });
        setAction('');
        setConfirmRemove(false);
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Manage Loading Manifests</h4>
                <p>Add or remove loading manifests for a vessel visit notification.</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {step === 1 && (
                <form onSubmit={handleNotificationIdSubmit} className="manage-form">
                    <div className="form-group">
                        <label htmlFor="notificationId">Notification ID</label>
                        <input
                            type="text"
                            id="notificationId"
                            name="notificationId"
                            value={notificationId}
                            onChange={handleInputChange}
                            placeholder="Enter notification ID"
                            className="form-input"
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>Check</button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}><span role="img" aria-label="clear">🧹</span>Clear</button>
                    </div>
                </form>
            )}
            {step === 2 && notificationValid && (
                <div className="form-group">
                    <label>Action</label>
                    <select value={action} onChange={handleActionChange} className="form-input">
                        <option value="">Select action</option>
                        <option value="add">Add Loading Manifest</option>
                        <option value="remove">Remove Loading Manifest</option>
                    </select>
                    <div className="form-actions">
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}><span role="img" aria-label="clear">🧹</span>Clear</button>
                    </div>
                </div>
            )}
            {step === 3 && action === 'add' && !manifestExists && (
                <form onSubmit={handleAddManifest} className="manage-form">
                    <div className="form-group">
                        <label>Container IDs</label>
                        {containerIds.map((id, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                <input
                                    type="text"
                                    name={`containerId-${idx}`}
                                    value={id}
                                    onChange={handleInputChange}
                                    placeholder="Container ID"
                                    className="form-input"
                                />
                                <button type="button" className="remove-btn" onClick={() => handleRemoveContainerField(idx)} disabled={containerIds.length === 1}>✖</button>
                            </div>
                        ))}
                        <button type="button" className="add-btn" onClick={handleAddContainerField}>Add Container</button>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>Add Manifest</button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}><span role="img" aria-label="clear">🧹</span>Clear</button>
                    </div>
                </form>
            )}
            {step === 3 && action === 'remove' && manifestExists && manifestInfo && (
                <>
                    <div className="delete-details-card">
                        <span className="delete-details-card-title">⚠️ Manifest to be deleted:</span>
                        <div className="delete-details-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <div className="delete-details-field"><span className="delete-details-label">ID:</span><br />{manifestInfo.id}</div>
                            <div className="delete-details-field"><span className="delete-details-label">Type:</span><br />{manifestInfo.type}</div>
                            <div className="delete-details-field"><span className="delete-details-label">Containers:</span><br />{manifestInfo.containers && manifestInfo.containers.map(c => c.identifier).join(', ')}</div>
                        </div>
                    </div>
                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ Warning: This action cannot be undone</span>
                        <span className="delete-warning-desc">Deleting this manifest will permanently remove it from the system. All associated container data will be lost.</span>
                        <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
                            {!confirmRemove ? (
                                <button type="button" className="delete-btn" onClick={() => setConfirmRemove(true)} disabled={isLoading}>Confirm Remove</button>
                            ) : (
                                <button type="button" className="delete-btn" onClick={handleRemoveManifest} disabled={isLoading}>Remove Manifest</button>
                            )}
                            <button type="button" className="delete-cancel-btn" onClick={handleClear} disabled={isLoading}>
                                <span role="img" aria-label="cancel">🧹</span>Cancel
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

console.log('ManageLoadingManifestsForm component loaded!');

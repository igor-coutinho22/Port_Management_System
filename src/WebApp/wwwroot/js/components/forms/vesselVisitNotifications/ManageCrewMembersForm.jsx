// Manage Crew Members Form Component
console.log('ManageCrewMembersForm component loading...');

const ManageCrewMembersForm = ({ onSuccess }) => {
    const [step, setStep] = React.useState(1); // 1: enter ID, 2: choose action, 3: add/remove
    const [notificationId, setNotificationId] = React.useState('');
    const [notificationValid, setNotificationValid] = React.useState(false);
    const [crewExists, setCrewExists] = React.useState(false);
    const [crewInfo, setCrewInfo] = React.useState(null);
    const [crewMembers, setCrewMembers] = React.useState([{ Name: '', CitizenId: '', Nationality: '' }]);
    const [selectedRemoveIdx, setSelectedRemoveIdx] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [action, setAction] = React.useState(''); // '' until chosen
    const [confirmRemove, setConfirmRemove] = React.useState(false);

    // Step 1: Validate notification ID and check crew using getVesselVisitNotificationById
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
            // Check if crew members exist in notification object
            const crew = notification.Crew || notification.crew || notification.CrewMembers || notification.crewMembers;
            if (crew && crew.length > 0) {
                setCrewExists(true);
                setCrewInfo(crew);
            } else {
                setCrewExists(false);
                setCrewInfo(null);
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
        if (e.target.value === 'remove' && crewExists) {
            setStep(3);
        } else if (e.target.value === 'add') {
            setStep(3);
        } else if (e.target.value === 'remove' && !crewExists) {
            setMessage({ type: 'error', text: 'No crew members exist to remove.' });
        }
    };

    // Step 3: Add or Remove
    const handleAddCrew = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const members = crewMembers.filter(m => m.Name.trim() && m.CitizenId.trim() && m.Nationality.trim());
            if (members.length === 0) throw new Error('At least one crew member is required.');
            for (const member of members) {
                await apiService.addCrewMemberToVesselVisitNotification(notificationId.trim(), member);
            }
            setMessage({ type: 'success', text: 'Crew members added successfully.' });
            if (onSuccess) onSuccess();
            setStep(1);
            setNotificationId('');
            setCrewMembers([{ Name: '', CitizenId: '', Nationality: '' }]);
            setAction('');
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to add crew members.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveCrew = async () => {
        if (selectedRemoveIdx === null || !crewInfo || !crewInfo[selectedRemoveIdx]) return;
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const member = crewInfo[selectedRemoveIdx];
            await apiService.removeCrewMemberFromVesselVisitNotification(notificationId.trim(), member.CitizenId || member.citizenId);
            setMessage({ type: 'success', text: 'Crew member removed successfully.' });
            if (onSuccess) onSuccess();
            setStep(1);
            setNotificationId('');
            setCrewMembers([{ Name: '', CitizenId: '', Nationality: '' }]);
            setAction('');
            setSelectedRemoveIdx(null);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to remove crew member.' });
        } finally {
            setIsLoading(false);
            setConfirmRemove(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'notificationId') setNotificationId(value);
        if (name.startsWith('crewName')) {
            const idx = parseInt(name.split('-')[1], 10);
            setCrewMembers(members => members.map((m, i) => i === idx ? { ...m, Name: value } : m));
        }
        if (name.startsWith('citizenId')) {
            const idx = parseInt(name.split('-')[1], 10);
            setCrewMembers(members => members.map((m, i) => i === idx ? { ...m, CitizenId: value } : m));
        }
        if (name.startsWith('nationality')) {
            const idx = parseInt(name.split('-')[1], 10);
            setCrewMembers(members => members.map((m, i) => i === idx ? { ...m, Nationality: value } : m));
        }
        if (message.text) setMessage({ type: '', text: '' });
    };
    const handleAddCrewField = () => {
        setCrewMembers(members => [...members, { Name: '', CitizenId: '', Nationality: '' }]);
    };
    const handleRemoveCrewField = (idx) => {
        setCrewMembers(members => members.filter((_, i) => i !== idx));
    };
    const handleClear = () => {
        setStep(1);
        setNotificationId('');
        setNotificationValid(false);
        setCrewExists(false);
        setCrewInfo(null);
        setCrewMembers([{ Name: '', CitizenId: '', Nationality: '' }]);
        setMessage({ type: '', text: '' });
        setAction('');
        setConfirmRemove(false);
        setSelectedRemoveIdx(null);
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Manage Crew Members</h4>
                <p>Add or remove crew members for a vessel visit notification.</p>
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
                        <option value="add">Add Crew Members</option>
                        <option value="remove">Remove Crew Members</option>
                    </select>
                    <div className="form-actions">
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}><span role="img" aria-label="clear">🧹</span>Clear</button>
                    </div>
                </div>
            )}
            {step === 3 && action === 'add' && (
                <form onSubmit={handleAddCrew} className="manage-form">
                    <div className="form-group">
                        <label>Crew Members</label>
                        {crewMembers.map((member, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                <input
                                    type="text"
                                    name={`crewName-${idx}`}
                                    value={member.Name}
                                    onChange={handleInputChange}
                                    placeholder="Name"
                                    className="form-input"
                                />
                                <input
                                    type="text"
                                    name={`citizenId-${idx}`}
                                    value={member.CitizenId}
                                    onChange={handleInputChange}
                                    placeholder="Citizen ID"
                                    className="form-input"
                                />
                                <input
                                    type="text"
                                    name={`nationality-${idx}`}
                                    value={member.Nationality}
                                    onChange={handleInputChange}
                                    placeholder="Nationality"
                                    className="form-input"
                                />
                                <button type="button" className="remove-btn" onClick={() => handleRemoveCrewField(idx)} disabled={crewMembers.length === 1}>✖</button>
                            </div>
                        ))}
                        <button type="button" className="add-btn" onClick={handleAddCrewField}>Add Crew Member</button>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>Add Crew</button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}><span role="img" aria-label="clear">🧹</span>Clear</button>
                    </div>
                </form>
            )}
            {step === 3 && action === 'remove' && crewExists && crewInfo && (
                <>
                    <div className="delete-details-card">
                        <span className="delete-details-card-title">⚠️ Select crew member to delete:</span>
                        <table className="crew-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Name</th>
                                    <th>Citizen ID</th>
                                    <th>Nationality</th>
                                </tr>
                            </thead>
                            <tbody>
                                {crewInfo.map((member, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            <input type="radio" name="selectedRemove" checked={selectedRemoveIdx === idx} onChange={() => setSelectedRemoveIdx(idx)} />
                                        </td>
                                        <td>{member.Name || member.name}</td>
                                        <td>{member.CitizenId || member.citizenId}</td>
                                        <td>{member.Nationality || member.nationality}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="delete-warning-card">
                        <span className="delete-warning-title">⚠️ Warning: This action cannot be undone</span>
                        <span className="delete-warning-desc">Deleting this crew member will permanently remove them from the system.</span>
                        <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
                            {!confirmRemove ? (
                                <button type="button" className="delete-btn" onClick={() => setConfirmRemove(true)} disabled={isLoading || selectedRemoveIdx === null}>Confirm Remove</button>
                            ) : (
                                <button type="button" className="delete-btn" onClick={handleRemoveCrew} disabled={isLoading || selectedRemoveIdx === null}>Remove Crew</button>
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

console.log('ManageCrewMembersForm component loaded!');

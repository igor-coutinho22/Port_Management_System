// Remove Representative From Organization Form Component
console.log('RemoveRepresentativeFromOrganizationForm.jsx is loading...');

const RemoveRepresentativeFromOrganizationForm = ({ onSuccess }) => {
    const [orgId, setOrgId] = React.useState('');
    const [org, setOrg] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search');
    const [selectedRepId, setSelectedRepId] = React.useState('');
    const [selectedRep, setSelectedRep] = React.useState(null);

    const handleOrgIdChange = (e) => {
        setOrgId(e.target.value);
        setMessage({ type: '', text: '' });
    };

    const isValidGuid = (guid) => {
        const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return guidRegex.test(guid);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!orgId.trim()) {
            setMessage({ type: 'error', text: 'Organization ID is required' });
            return;
        }
        if (!isValidGuid(orgId.trim())) {
            setMessage({ type: 'error', text: 'Invalid GUID format. Please enter a valid organization ID' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        setOrg(null);
        try {
            const data = await apiService.getOrganizationById(orgId.trim());
            if (data) {
                setOrg(data);
                setStep('remove');
            } else {
                setMessage({ type: 'info', text: 'Organization not found with the provided ID' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to fetch organization. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Only allow selection of representatives already assigned to the org
    const getAssignedReps = () => {
        if (!org || !org.representatives) return [];
        return org.representatives;
    };

    const handleSelectRep = (e) => {
        const repId = e.target.value;
        setSelectedRepId(repId);
        setMessage({ type: '', text: '' });
        if (!repId) {
            setSelectedRep(null);
            return;
        }
        const rep = getAssignedReps().find(r => (r.id || r.Id) === repId);
        setSelectedRep(rep || null);
    };

    const handleRemoveRepresentative = async (e) => {
        e.preventDefault();
        if (!selectedRepId || !selectedRep) {
            setMessage({ type: 'error', text: 'Please select a representative to remove.' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // Backend expects DELETE /organizations/{id}/remove with repId in body
            await apiService.removeRepresentativeFromOrganization(orgId.trim(), selectedRep.id || selectedRep.Id || '');
            setMessage({ type: 'success', text: `Representative removed from organization successfully.` });
            // Reload org, reset selection
            const data = await apiService.getOrganizationById(orgId.trim());
            setOrg(data);
            setSelectedRepId('');
            setSelectedRep(null);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to remove representative. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setOrgId('');
        setOrg(null);
        setSelectedRepId('');
        setSelectedRep(null);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Remove Representative from Organization</h4>
                <p>Search for an organization by ID and remove an assigned representative</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-group">
                        <label htmlFor="orgId">Organization ID</label>
                        <input
                            type="text"
                            id="orgId"
                            name="orgId"
                            value={orgId}
                            onChange={handleOrgIdChange}
                            placeholder="Enter organization ID (e.g., 12345678-1234-1234-1234-123456789abc)"
                            className="form-input"
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>Loading...</>) : (<><span>🔍</span>Search Organization</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>Cancel
                        </button>
                    </div>
                </form>
            )}
            {step === 'remove' && org && (
                <form onSubmit={handleRemoveRepresentative} className="remove-rep-form">
                    <div className="form-section-header">
                        <h5>Organization: {org.legalName} (ID: {org.id})</h5>
                        <p>Select a representative to remove from this organization.</p>
                    </div>
                    <div className="form-group" style={{ marginBottom: '18px' }}>
                        <label htmlFor="selectRep">Select Representative</label>
                        <select id="selectRep" value={selectedRepId} onChange={handleSelectRep} className="form-input">
                            <option value="">-- Select --</option>
                            {getAssignedReps().map(rep => (
                                <option key={rep.id || rep.Id} value={rep.id || rep.Id}>
                                    {rep.name || rep.Name} ({rep.citizenId || rep.CitizenId})
                                </option>
                            ))}
                        </select>
                    </div>
                    {selectedRep && (
                        <div style={{ marginBottom: '18px' }}>
                            <div className="rep-fields" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                                <input type="text" name="name" value={selectedRep.name || selectedRep.Name || ''} className="form-input" readOnly style={{ flex: '1 1 180px', minWidth: '120px', maxWidth: '200px' }} />
                                <input type="text" name="citizenId" value={selectedRep.citizenId || selectedRep.CitizenId || ''} className="form-input" readOnly style={{ flex: '1 1 120px', minWidth: '100px', maxWidth: '140px' }} />
                                <input type="text" name="nationality" value={selectedRep.nationality || selectedRep.Nationality || ''} className="form-input" readOnly style={{ flex: '1 1 80px', minWidth: '80px', maxWidth: '100px' }} />
                                <input type="email" name="email" value={selectedRep.email || selectedRep.Email || ''} className="form-input" readOnly style={{ flex: '2 1 220px', minWidth: '160px', maxWidth: '260px' }} />
                                <input type="text" name="phone" value={selectedRep.phone || selectedRep.Phone || ''} className="form-input" readOnly style={{ flex: '1 1 120px', minWidth: '100px', maxWidth: '140px' }} />
                            </div>
                        </div>
                    )}
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>Removing...</>) : (<>Remove Representative</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

console.log('RemoveRepresentativeFromOrganizationForm component loaded!');

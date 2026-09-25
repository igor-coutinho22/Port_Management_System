// Add Representative To Organization Form Component


const AddRepresentativeToOrganizationForm = ({ onSuccess }) => {
    const [orgId, setOrgId] = React.useState('');
    const [org, setOrg] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [step, setStep] = React.useState('search');
    const [existingReps, setExistingReps] = React.useState([]);
    const [selectedRepId, setSelectedRepId] = React.useState('');

    // Load all representatives after org is found
    React.useEffect(() => {
        if (step === 'add') {
            apiService.getRepresentatives().then(setExistingReps).catch(() => setExistingReps([]));
        }
    }, [step]);

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
                setStep('add');
            } else {
                setMessage({ type: 'info', text: 'Organization not found with the provided ID' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to fetch organization. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Only allow selection of representatives not already assigned to the org
    const getAvailableReps = () => {
        if (!org || !org.representatives) return existingReps;
        const assignedIds = new Set(org.representatives.map(r => r.id || r.Id));
        return existingReps.filter(rep => !assignedIds.has(rep.id || rep.Id));
    };

    const [selectedRep, setSelectedRep] = React.useState(null);
    const handleSelectRep = (e) => {
        const repId = e.target.value;
        setSelectedRepId(repId);
        setMessage({ type: '', text: '' });
        if (!repId) {
            setSelectedRep(null);
            return;
        }
        const rep = getAvailableReps().find(r => (r.id || r.Id) === repId);
        setSelectedRep(rep || null);
    };

    const handleAddRepresentative = async (e) => {
        e.preventDefault();
        if (!selectedRepId || !selectedRep) {
            setMessage({ type: 'error', text: 'Please select a representative to add.' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await apiService.addRepresentativeToOrganization(orgId.trim(), {
                id: selectedRep.id || selectedRep.Id || '',
                name: selectedRep.name || selectedRep.Name || '',
                citizenId: selectedRep.citizenId || selectedRep.CitizenId || '',
                nationality: selectedRep.nationality || selectedRep.Nationality || '',
                email: selectedRep.email || selectedRep.Email || '',
                phone: selectedRep.phone || selectedRep.Phone || ''
            });
            setMessage({ type: 'success', text: `Representative added to organization successfully.` });
            // Reload org and representatives, reset selection
            const data = await apiService.getOrganizationById(orgId.trim());
            setOrg(data);
            const reps = await apiService.getRepresentatives();
            setExistingReps(reps);
            setSelectedRepId('');
            setSelectedRep(null);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Failed to add representative. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setOrgId('');
        setOrg(null);
        setSelectedRepId('');
        setExistingReps([]);
        setMessage({ type: '', text: '' });
        setStep('search');
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Add Representative to Organization</h4>
                <p>Search for an organization by ID and add an existing representative</p>
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
            {step === 'add' && org && (
                <form onSubmit={handleAddRepresentative} className="add-rep-form">
                    <div className="form-section-header">
                        <h5>Organization: {org.legalName} (ID: {org.id})</h5>
                        <p>Select a representative to add to this organization.</p>
                    </div>
                    <div className="form-group" style={{ marginBottom: '18px' }}>
                        <label htmlFor="selectRep">Select Representative</label>
                        <select id="selectRep" value={selectedRepId} onChange={handleSelectRep} className="form-input">
                            <option value="">-- Select --</option>
                            {getAvailableReps().map(rep => (
                                <option key={rep.id || rep.Id} value={rep.id || rep.Id}>
                                    {rep.name || rep.Name} ({rep.citizenId || rep.CitizenId})
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Show selected representative details like RegisterOrganizationForm, with better layout */}
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
                            {isLoading ? (<><span className="loading-spinner"></span>Adding...</>) : (<>Add Representative</>)}
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

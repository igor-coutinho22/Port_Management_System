// Activate/Deactivate Organization Form Component
console.log('ActivateDeactivateOrganizationForm component loading...');

const ActivateDeactivateOrganizationForm = ({ onSuccess }) => {
    const [step, setStep] = React.useState(1); // 1: enter ID, 2: confirm
    const [orgId, setOrgId] = React.useState('');
    const [org, setOrg] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [confirm, setConfirm] = React.useState(false);

    // Step 1: Validate org ID and fetch org
    const handleOrgIdSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            if (!orgId.trim()) throw new Error('Organization ID is required');
            const organization = await apiService.getOrganizationById(orgId.trim());
            if (!organization) throw new Error('Organization not found.');
            setOrg(organization);
            setStep(2);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Organization not found.' });
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Confirm activate/deactivate
    const handleConfirm = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            if (!org) throw new Error('No organization loaded.');
            if (org.isActive || org.IsActive) {
                await apiService.deactivateOrganization(org.id || org.Id);
                setMessage({ type: 'success', text: 'Organization deactivated successfully.' });
            } else {
                await apiService.activateOrganization(org.id || org.Id);
                setMessage({ type: 'success', text: 'Organization activated successfully.' });
            }
            if (onSuccess) onSuccess();
            setTimeout(() => {
                setStep(1);
                setOrgId('');
                setOrg(null);
                setConfirm(false);
                setMessage({ type: '', text: '' });
            }, 2000);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Operation failed.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setStep(1);
        setOrgId('');
        setOrg(null);
        setConfirm(false);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Activate/Deactivate Organization</h4>
                <p>Enter an organization ID to activate or deactivate it.</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {step === 1 && (
                <form onSubmit={handleOrgIdSubmit} className="search-form">
                    <div className="form-group">
                        <label htmlFor="orgId">Organization ID</label>
                        <input
                            type="text"
                            id="orgId"
                            name="orgId"
                            value={orgId}
                            onChange={e => setOrgId(e.target.value)}
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
            {step === 2 && org && (
                <form onSubmit={handleConfirm} className="confirm-form">
                    <div className="form-section-header" style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'flex-start', background: 'var(--plane-bg, #0a1a2f)', borderRadius: '10px', padding: '18px 24px', marginBottom: '18px', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: '1.1em', fontWeight: 600, color: '#fff' }}>
                            Organization: {org.legalName || org.LegalName} (ID: {org.id || org.Id})
                        </div>
                        <div style={{ fontSize: '1em', fontWeight: 500, color: org.isActive || org.IsActive ? '#2ecc40' : '#e74c3c', background: 'rgba(0,0,0,0.08)', borderRadius: '6px', padding: '6px 14px', marginTop: '0' }}>
                            Status: <span style={{ fontWeight: 700 }}>{org.isActive || org.IsActive ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div style={{ fontSize: '1.05em', color: '#fff', marginTop: '0', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '10px 14px', width: '100%' }}>
                            Are you sure you want to <b>{org.isActive || org.IsActive ? 'deactivate' : 'activate'}</b> this organization?
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>Processing...</>) : (<>{org.isActive || org.IsActive ? 'Deactivate' : 'Activate'} Organization</>)}
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

console.log('ActivateDeactivateOrganizationForm component loaded!');

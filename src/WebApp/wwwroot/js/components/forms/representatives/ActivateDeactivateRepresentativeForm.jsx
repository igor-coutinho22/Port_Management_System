// Activate/Deactivate Representative Form Component
console.log('ActivateDeactivateRepresentativeForm is loading...');

const ActivateDeactivateRepresentativeForm = ({ onSuccess }) => {
    const [step, setStep] = React.useState(1); // 1: enter ID, 2: confirm
    const [repId, setRepId] = React.useState('');
    const [rep, setRep] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // Step 1: Validate rep ID and fetch rep
    const handleRepIdSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            if (!repId.trim()) throw new Error('Representative ID is required');
            const representative = await apiService.getRepresentativeById(repId.trim());
            if (!representative) throw new Error('Representative not found.');
            setRep({ ...representative, id: repId.trim() });
            setStep(2);
        } catch (error) {
            setMessage({ type: 'error', text: error.message || 'Representative not found.' });
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
            if (!rep) throw new Error('No representative loaded.');
            if (rep.isActive || rep.IsActive) {
                await apiService.deactivateRepresentative(rep.id || rep.Id);
                setMessage({ type: 'success', text: 'Representative deactivated successfully.' });
            } else {
                await apiService.activateRepresentative(rep.id || rep.Id);
                setMessage({ type: 'success', text: 'Representative activated successfully.' });
            }
            if (onSuccess) onSuccess();
            setTimeout(() => {
                setStep(1);
                setRepId('');
                setRep(null);
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
        setRepId('');
        setRep(null);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Activate/Deactivate Representative</h4>
                <p>Enter a representative ID to activate or deactivate them.</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            {step === 1 && (
                <form onSubmit={handleRepIdSubmit} className="search-form">
                    <div className="form-group">
                        <label htmlFor="repId">Representative ID</label>
                        <input
                            type="text"
                            id="repId"
                            name="repId"
                            value={repId}
                            onChange={e => setRepId(e.target.value)}
                            placeholder="Enter representative ID (e.g., 12345678-1234-1234-1234-123456789abc)"
                            className="form-input"
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>Loading...</>) : (<><span>🔍</span>Search Representative</>)}
                        </button>
                        <button type="button" className="clear-btn" onClick={handleClear} disabled={isLoading}>
                            <span>🧹</span>Cancel
                        </button>
                    </div>
                </form>
            )}
            {step === 2 && rep && (
                <form onSubmit={handleConfirm} className="confirm-form">
                    <div className="form-section-header" style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'flex-start', background: 'var(--plane-bg, #0a1a2f)', borderRadius: '10px', padding: '18px 24px', marginBottom: '18px', boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)' }}>
                        <div style={{ fontSize: '1.1em', fontWeight: 600, color: '#fff' }}>
                            Representative: {rep.name} (ID: {rep.id})
                        </div>
                        <div style={{ fontSize: '1em', fontWeight: 500, color: rep.isActive ? '#2ecc40' : '#e74c3c', background: 'rgba(0,0,0,0.08)', borderRadius: '6px', padding: '6px 14px', marginTop: '0' }}>
                            Status: <span style={{ fontWeight: 700 }}>{rep.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div style={{ fontSize: '1.05em', color: '#fff', marginTop: '0', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '10px 14px', width: '100%' }}>
                            Are you sure you want to <b>{rep.isActive ? 'deactivate' : 'activate'}</b> this representative?
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={isLoading}>
                            {isLoading ? (<><span className="loading-spinner"></span>Processing...</>) : (<>{rep.isActive ? 'Deactivate' : 'Activate'} Representative</>)}
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

console.log('ActivateDeactivateRepresentativeForm component loaded!');

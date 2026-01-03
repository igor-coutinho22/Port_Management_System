const DeleteTaskForm = ({ onSuccess }) => {
    const [searchId, setSearchId] = React.useState('');
    const [data, setData] = React.useState(null);
    const [step, setStep] = React.useState('search'); // 'search' | 'confirm'
    const [message, setMessage] = React.useState({ type: '', text: '' });
    const [loading, setLoading] = React.useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({type:'', text:''});
        try {
            const res = await apiService.getTaskById(searchId.trim());
            setData(res);
            setStep('confirm');
        } catch (err) {
            setMessage({ type: 'error', text: 'Task not found.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await apiService.deleteTask(data.id);
            setMessage({ type: 'success', text: 'Record deleted.' });
            if (onSuccess) onSuccess();
            
            setTimeout(() => {
                setStep('search');
                setSearchId('');
                setData(null);
                setMessage({type:'', text:''});
            }, 1500);
        } catch (err) {
            setMessage({ type: 'error', text: 'Delete failed.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container" style={{ borderColor: '#dc3545' }}>
            <div className="form-header">
                <h4 style={{ color: '#dc3545' }}>Delete Record</h4>
                <p>Remove an erroneous entry from the log.</p>
            </div>
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            {step === 'search' && (
                <form onSubmit={handleSearch} className="search-form">
                    <input value={searchId} onChange={(e) => setSearchId(e.target.value)} className="form-input" placeholder="Task ID..." />
                    <button type="submit" className="submit-btn">Find</button>
                </form>
            )}

            {step === 'confirm' && data && (
                <div className="fade-in">
                    <div className="delete-details-card">
                        <strong>{data.category?.name || 'Unknown Task'}</strong> on 
                        <br/>
                        <span style={{color: '#17a2b8'}}>
                            {data.vesselName || (data.vesselVisitExecutionId?.vesselIMO ? `IMO: ${data.vesselVisitExecutionId.vesselIMO}` : 'Unknown Vessel')}
                        </span>
                        <div style={{fontSize:'0.8em', marginTop:'5px'}}>Status: {data.status}</div>
                    </div>

                    <div className="delete-warning-card">
                        <p style={{color:'white', margin:'0 0 10px 0'}}>Are you sure you want to delete this record?</p>
                        <div style={{display:'flex', gap:'10px'}}>
                            <button onClick={handleDelete} className="btn-danger-primary" style={{flex:1}} disabled={loading}>
                                {loading ? 'Deleting...' : '🗑️ Yes, Delete'}
                            </button>
                            <button onClick={() => setStep('search')} className="delete-cancel-btn" disabled={loading}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
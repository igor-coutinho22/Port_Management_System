const GetTaskByIdForm = () => {
    const [searchId, setSearchId] = React.useState('');
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchId.trim()) return;
        
        setLoading(true);
        setMessage({ type: '', text: '' });
        setData(null);

        try {
            const result = await apiService.getTaskById(searchId.trim());
            if (result) {
                setData(result);
                setMessage({ type: 'success', text: 'Task found.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Task ID not found.' });
        } finally {
            setLoading(false);
        }
    };

    // --- HELPER: Safe Vessel Display ---
    const getVesselDisplay = (task) => {
        if (task.vesselName) return task.vesselName;
        if (task.vesselVisitExecutionId && task.vesselVisitExecutionId.vesselIMO) {
            return `IMO: ${task.vesselVisitExecutionId.vesselIMO}`;
        }
        return '-';
    };

    // --- HELPER: Smart Duration Calculation ---
    const getDurationDisplay = (task) => {
        // 1. If backend provided it, use it
        if (task.durationMinutes !== undefined && task.durationMinutes !== null) {
            return `${task.durationMinutes} min`;
        }
        // 2. If Completed, calculate difference
        if (task.startTime && task.endTime) {
            const start = new Date(task.startTime);
            const end = new Date(task.endTime);
            const diff = Math.floor((end - start) / 60000);
            return `${diff} min`;
        }
        return '-';
    };

    return (
        <div className="form-container" style={{ borderTop: '4px solid #17a2b8' }}>
            <div className="form-header">
                <h4 style={{ color: '#17a2b8' }}>Get Task Details</h4>
                <p>Inspect full system record by ID.</p>
            </div>
            
            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}
            
            <form onSubmit={handleSearch} className="search-form">
                <div className="form-group">
                    <label>Task ID</label>
                    <input 
                        value={searchId} 
                        onChange={(e) => setSearchId(e.target.value)} 
                        className="form-input" 
                        placeholder="Paste ID here..." 
                    />
                </div>
                <button type="submit" className="submit-btn" disabled={loading} style={{backgroundColor: '#17a2b8'}}>
                    Search
                </button>
            </form>

            {data && (
                <div className="result-container fade-in">
                    <table className="detailed-table">
                        <tbody>
                            <tr><th>ID</th><td className="monospace-cell">{data.id}</td></tr>
                            <tr><th>Status</th><td>{data.status}</td></tr>
                            <tr><th>Category</th><td>{data.category ? `${data.category.name} (${data.category.code})` : '-'}</td></tr>
                            
                            {/* FIX 1: Vessel Display */}
                            <tr>
                                <th>Vessel</th>
                                <td style={{ color: '#17a2b8', fontWeight: 'bold' }}>
                                    {getVesselDisplay(data)}
                                </td>
                            </tr>

                            <tr><th>Responsible</th><td>{data.responsibleTeam}</td></tr>
                            <tr><th>Start Time</th><td>{new Date(data.startTime).toLocaleString()}</td></tr>
                            <tr><th>End Time</th><td>{data.endTime ? new Date(data.endTime).toLocaleString() : '-'}</td></tr>
                            
                            {/* FIX 2: Duration Display */}
                            <tr>
                                <th>Duration</th>
                                <td>{getDurationDisplay(data)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
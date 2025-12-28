const GetVesselVisitExecutionByIdForm = () => {
    const [searchId, setSearchId] = React.useState('');
    const [execution, setExecution] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const isValidGuid = (id) => 
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

    const handleSearch = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });
        setExecution(null);

        if (!searchId.trim()) {
            setMessage({ type: 'error', text: 'Please enter an ID.' });
            return;
        }

        setLoading(true);

        try {
            const data = await apiService.getVesselVisitExecutionById(searchId.trim());
            
            if (data) {
                setExecution(data);
                setMessage({ type: 'success', text: 'Execution found.' });
            } else {
                setMessage({ type: 'error', text: 'No execution found with this ID.' });
            }
        } catch (error) {
            console.error('Search error:', error);
            setMessage({ type: 'error', text: error.message || 'Failed to retrieve execution.' });
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSearchId('');
        setExecution(null);
        setMessage({ type: '', text: '' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Get Execution By ID</h4>
                <p>Retrieve full details of a specific Vessel Visit Execution.</p>
            </div>

            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSearch} className="search-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="searchId">Execution ID <span className="required">*</span></label>
                        <input
                            type="text"
                            id="searchId"
                            value={searchId}
                            onChange={(e) => setSearchId(e.target.value)}
                            placeholder="e.g., a1b2c3d4-..."
                            className="form-input"
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="submit-btn" 
                        disabled={loading}
                    >
                        {loading ? 'Searching...' : '🔍 Search'}
                    </button>
                    {(execution || searchId) && (
                        <button 
                            type="button" 
                            className="clear-btn" 
                            onClick={handleClear}
                        >
                            Clear
                        </button>
                    )}
                </div>
            </form>

            {/* RESULT DISPLAY */}
            {execution && (
                <div className="result-container fade-in">
                    <h5 className="result-header">
                        Execution Details
                    </h5>
                    
                    <table className="detailed-table">
                        <tbody>
                            <tr>
                                <th>ID</th>
                                <td className="monospace-cell">{execution.id}</td>
                            </tr>
                            <tr>
                                <th>Vessel Visit ID</th>
                                <td className="monospace-cell">{execution.vesselVisitId}</td>
                            </tr>
                            <tr>
                                <th>Vessel IMO</th>
                                <td>{execution.vesselIMO}</td>
                            </tr>
                            <tr>
                                <th>Status</th>
                                <td>
                                    <span className={`status-badge status-${(execution.status || 'unknown').toLowerCase().replace(/\s+/g, '-')}`}>
                                        {execution.status}
                                    </span>
                                </td>
                            </tr>
                            
                            {/* --- NEW FIELDS START --- */}
                            <tr>
                                <th>Actual Arrival</th>
                                <td className="success-text">
                                    {formatDate(execution.actualArrivalTime)}
                                </td>
                            </tr>
                            <tr>
                                <th>Actual Berth Time</th>
                                <td>
                                    {formatDate(execution.berthTime)}
                                </td>
                            </tr>
                            <tr>
                                <th>Assigned Dock ID</th>
                                <td className="monospace-cell">
                                    {execution.dockId || <span style={{color: '#999'}}>Not Assigned</span>}
                                </td>
                            </tr>
                            {/* Warnings / Discrepancies Row */}
                            {execution.discrepancy && (
                                <tr style={{ backgroundColor: '#fff3cd' }}>
                                    <th style={{ color: '#856404' }}>⚠️ Discrepancy</th>
                                    <td style={{ color: '#856404', fontWeight: 'bold' }}>
                                        {execution.discrepancy}
                                    </td>
                                </tr>
                            )}
                            {/* --- NEW FIELDS END --- */}

                            <tr>
                                <th>Completed Time</th>
                                <td>
                                    {execution.completedTime ? formatDate(execution.completedTime) : '-'}
                                </td>
                            </tr>
                            <tr>
                                <th>Created By</th>
                                <td>{execution.createdBy}</td>
                            </tr>
                            <tr>
                                <th>Record Created</th>
                                <td>{formatDate(execution.createdAt)}</td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Optional: Show Audit Log count or detail if needed */}
                    {execution.auditLog && execution.auditLog.length > 0 && (
                        <div style={{ marginTop: '15px', fontSize: '0.85em', color: '#666' }}>
                            <em>* This record has {execution.auditLog.length} audit log entries.</em>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
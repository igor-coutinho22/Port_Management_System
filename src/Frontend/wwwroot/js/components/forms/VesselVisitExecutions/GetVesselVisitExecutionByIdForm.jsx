const GetVesselVisitExecutionByIdForm = () => {
    const [searchId, setSearchId] = React.useState('');
    const [execution, setExecution] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

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

    const getStatusClass = (status) => {
        if (!status) return 'status-pending';
        return `status-${status.toLowerCase()}`;
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Get Execution By ID</h4>
                <p>Retrieve details including header status, departure times, and operation progress.</p>
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
                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Searching...' : '🔍 Search'}
                    </button>
                    {(execution || searchId) && (
                        <button type="button" className="clear-btn" onClick={handleClear}>Clear</button>
                    )}
                </div>
            </form>

            {/* RESULT DISPLAY */}
            {execution && (
                <div className="result-container fade-in">
                    
                    {/* SECTION 1: HEADER DETAILS */}
                    <h5 className="result-header">1. Execution Details (Header)</h5>
                    <table className="detailed-table">
                        <tbody>
                            <tr><th>ID</th><td className="monospace-cell">{execution.id}</td></tr>
                            <tr><th>Vessel Visit ID</th><td className="monospace-cell">{execution.vesselVisitId}</td></tr>
                            <tr><th>Vessel IMO</th><td>{execution.vesselIMO}</td></tr>
                            <tr>
                                <th>Status</th>
                                <td><span className={`status-badge status-${(execution.status || 'unknown').toLowerCase()}`}>{execution.status}</span></td>
                            </tr>
                            
                            {/* Arrival Details */}
                            <tr><th>Actual Arrival</th><td className="success-text">{formatDate(execution.actualArrivalTime)}</td></tr>
                            <tr><th>Actual Berth Time</th><td>{formatDate(execution.berthTime)}</td></tr>
                            <tr>
                                <th>Assigned Dock ID</th>
                                <td className="monospace-cell">{execution.dockId || <span style={{color: '#999'}}>Not Assigned</span>}</td>
                            </tr>

                            {/* Discrepancies */}
                            {execution.discrepancy && (
                                <tr style={{ backgroundColor: '#fff3cd' }}>
                                    <th style={{ color: '#856404' }}>⚠️ Discrepancy</th>
                                    <td style={{ color: '#856404', fontWeight: 'bold' }}>{execution.discrepancy}</td>
                                </tr>
                            )}

                            <tr><th>Completed Time</th><td>{execution.completedTime ? formatDate(execution.completedTime) : '-'}</td></tr>

                            {/* --- NEW SECTION: DEPARTURE DETAILS (Only if Completed) --- */}
                            {execution.status === 'Completed' && (
                                <>
                                    <tr style={{borderTop: '2px solid #e9ecef'}}>
                                        <th style={{color: '#28a745'}}>Actual Unberth</th>
                                        <td style={{fontWeight: 'bold', color: '#28a745'}}>{formatDate(execution.actualUnberthTime)}</td>
                                    </tr>
                                    <tr>
                                        <th style={{color: '#28a745'}}>Actual Port Departure</th>
                                        <td style={{fontWeight: 'bold', color: '#28a745'}}>{formatDate(execution.actualPortDepartureTime)}</td>
                                    </tr>
                                </>
                            )}
                            {/* ---------------------------------------------------------- */}

                            <tr><th>Created By</th><td>{execution.createdBy}</td></tr>
                        </tbody>
                    </table>

                    {/* SECTION 2: EXECUTED OPERATIONS */}
                    <h5 className="result-header" style={{marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
                        2. Executed Operations (Details)
                    </h5>

                    {!execution.executedOperations || execution.executedOperations.length === 0 ? (
                        <div className="no-data" style={{textAlign: 'left', padding: '10px 0'}}>
                            No operations have been recorded yet.
                        </div>
                    ) : (
                        <div className="ops-read-list">
                            {execution.executedOperations.map((op, idx) => (
                                <div key={idx} className="op-read-card">
                                    <div className="op-read-header">
                                        <strong>{op.type || 'Operation'}</strong>
                                        <span className={`status-badge ${getStatusClass(op.status)}`}>{op.status}</span>
                                    </div>
                                    <div className="op-read-grid">
                                        <div className="op-read-item">
                                            <span>Actual Start:</span>
                                            <strong>{formatDate(op.actualStartTime)}</strong>
                                        </div>
                                        <div className="op-read-item">
                                            <span>Actual End:</span>
                                            <strong>{formatDate(op.actualEndTime)}</strong>
                                        </div>
                                        <div className="op-read-item">
                                            <span>Staff Used:</span>
                                            <strong>{op.resourcesUsed?.staff || 0}</strong>
                                        </div>
                                        <div className="op-read-item">
                                            <span>Cranes Used:</span>
                                            <strong>{op.resourcesUsed?.cranes || 0}</strong>
                                        </div>
                                    </div>
                                    <div className="op-read-footer">
                                        <small>Last Updated: {formatDate(op.updatedAt)}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {execution.auditLog && (
                        <div style={{ marginTop: '15px', fontSize: '0.8em', color: '#888', textAlign: 'right' }}>
                            {execution.auditLog.length} Audit Entries
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
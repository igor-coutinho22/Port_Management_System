/* global React, apiService */

const ResourceUtilizationSection = () => {
    const [startDate, setStartDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [resourceType, setResourceType] = React.useState("crane");
    const [stats, setStats] = React.useState([]);
    const [loading, setLoading] = React.useState(false);

    const fetchStats = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const data = await apiService.getResourceUtilization(startDate, endDate, resourceType);
            setStats(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <form onSubmit={fetchStats} className="form-grid" style={{ gap: 10 }}>
                <div className="form-group">
                    <label>Start Date</label>
                    <input type="date" className="form-input" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>End Date</label>
                    <input type="date" className="form-input" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label>Resource Type</label>
                    <select className="form-input" value={resourceType} onChange={e => setResourceType(e.target.value)}>
                        <option value="crane">Cranes</option>
                        <option value="staff">Staff</option>
                        <option value="dock">Docks</option>
                        <option value="all">All</option>
                    </select>
                </div>
                <button type="submit" className="submit-btn" style={{ height: 'fit-content', alignSelf: 'end' }}>Calculate</button>
            </form>

            {loading && <div>Calculating...</div>}

            {!loading && stats.length > 0 && (
                <div className="table-wrapper" style={{ marginTop: 20 }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Resource</th>
                                <th>Total Minutes Allocated</th>
                                <th>Operations Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.map((s, i) => (
                                <tr key={i}>
                                    <td>{s.resourceName}</td>
                                    <td>{s.totalAllocatedMinutes.toFixed(2)}</td>
                                    <td>{s.totalOperations}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

window.ResourceUtilizationSection = ResourceUtilizationSection;

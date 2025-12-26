/* global React, apiService */

const MissingPlansSection = () => {
    const [targetDate, setTargetDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [missingVisits, setMissingVisits] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [regenerating, setRegenerating] = React.useState(false);

    const fetchMissing = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiService.getMissingOperationPlans(targetDate);
            setMissingVisits(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerate = async () => {
        if (!confirm("Start regeneration? This will overwrite existing plans for the day.")) return;

        setRegenerating(true);
        try {
            await apiService.regenerateOperationPlan(targetDate, "atc"); // Default algorithm
            alert("Plan regenerated successfully!");
            fetchMissing(); // Refresh list (should be empty now)
        } catch (err) {
            alert("Error regenerating plan: " + err.message);
        } finally {
            setRegenerating(false);
        }
    };

    React.useEffect(() => {
        fetchMissing();
    }, [targetDate]);

    return (
        <div className="form-container">
            <div className="form-group">
                <label>Date to Check</label>
                <input
                    type="date"
                    className="form-input"
                    value={targetDate}
                    onChange={e => setTargetDate(e.target.value)}
                />
            </div>

            {loading && <div>Checking for missing plans...</div>}
            {error && <div className="error">{error}</div>}

            {!loading && !error && (
                <div>
                    <h4>Missing Notifications ({missingVisits.length})</h4>
                    {missingVisits.length === 0 ? (
                        <p>No missing plans for this date.</p>
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>VVN ID</th>
                                        <th>Vessel IMO</th>
                                        <th>Arrival</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {missingVisits.map(v => (
                                        <tr key={v.id}>
                                            <td>{v.id}</td>
                                            <td>{v.vesselIMO}</td>
                                            <td>{new Date(v.expectedArrivalTime).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div style={{ marginTop: 10 }}>
                                <button
                                    className="submit-btn warning"
                                    onClick={handleRegenerate}
                                    disabled={regenerating}
                                >
                                    {regenerating ? "Regenerating..." : "⚠️ Regenerate Plan for Day"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

window.MissingPlansSection = MissingPlansSection;

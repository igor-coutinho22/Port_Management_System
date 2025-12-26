/* global React, apiService */

const VesselVisitExecutionPage = () => {
    const [vvns, setVvns] = React.useState([]);
    const [selectedVvnId, setSelectedVvnId] = React.useState("");
    const [actualArrival, setActualArrival] = React.useState(new Date().toISOString().slice(0, 16));
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState("");

    React.useEffect(() => {
        // Load VVNs to populate dropdown
        apiService.getVesselVisitNotifications()
            .then(data => setVvns(data || []))
            .catch(err => console.error("Failed to load VVNs", err));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const vvn = vvns.find(v => v.id === selectedVvnId);
        if (!vvn) {
            setMessage("Please select a VVN.");
            setLoading(false);
            return;
        }

        try {
            await apiService.createVesselVisitExecution({
                vesselVisitId: selectedVvnId,
                vesselIdentifier: vvn.vesselIMO, // Assuming IMO is good identifier
                actualArrivalTime: actualArrival,
                createdBy: "User" // Or apiService.getCurrentUser()
            });
            setMessage("Execution record created successfully! Status: In Progress.");
            setSelectedVvnId("");
        } catch (err) {
            setMessage("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-section">
            <h2 className="page-title">Vessel Visit Execution</h2>
            <div className="form-container">
                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group">
                        <label>Select Vessel Visit</label>
                        <select
                            className="form-input"
                            value={selectedVvnId}
                            onChange={e => setSelectedVvnId(e.target.value)}
                            required
                        >
                            <option value="">-- Select VVN --</option>
                            {vvns.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.vesselIMO} - {new Date(v.expectedArrivalTime).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Actual Arrival Time</label>
                        <input
                            type="datetime-local"
                            className="form-input"
                            value={actualArrival}
                            onChange={e => setActualArrival(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? "Recording..." : "Start Execution"}
                    </button>
                </form>
                {message && <div style={{ marginTop: 20, padding: 10, background: "#f0f9ff" }}>{message}</div>}
            </div>
        </div>
    );
};

window.VesselVisitExecutionPage = VesselVisitExecutionPage;

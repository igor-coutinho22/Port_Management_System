
const HEURISTICS = [
    { value: "minimum_slack_time", label: "Minimum Slack Time" },
    { value: "early_departure_time", label: "Earliest Departure First" },
    { value: "arrived_shortest_departure_time", label: "Arrived – Shortest Departure" },
    { value: "atc", label: "ATC (Apparent Tardiness Cost)" },
    { value: "optimal", label: "Optimal (all permutations – slow)" }
];

function formatDateInputValue(date) {
    // date: JS Date -> "YYYY-MM-DD"
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatDateTime(value) {
    if (!value) return "";
    // Works for both ISO strings and "2025-11-24T08:00:00Z"
    const dt = new Date(value);
    if (isNaN(dt.getTime())) return value; // fallback: show raw
    return dt.toLocaleString();
}

const SchedulingHubPage = () => {
    const [targetDate, setTargetDate] = React.useState(
        formatDateInputValue(new Date())
    );
    const [heuristic, setHeuristic] = React.useState("atc");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [result, setResult] = React.useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setResult(null);
        setLoading(true);

        try {
            console.log("Calling scheduling API with:", { targetDate, heuristic });
            const data = await apiService.generateDailySchedule(targetDate, heuristic);
            console.log("Scheduling result:", data);
            setResult(data);
        } catch (err) {
            console.error("Scheduling error:", err);
            setError(err?.message || "Failed to generate schedule.");
        } finally {
            setLoading(false);
        }
    };

    const resolvedEntries = React.useMemo(() => {
        if (!result) return [];
        // handle PascalCase vs camelCase just in case
        return result.entries || result.Entries || [];
    }, [result]);

    const totalDelay =
        (result && (result.totalDelayMinutes ?? result.totalDelay ?? result.TotalDelayMinutes ?? result.TotalDelay)) || 0;

    const runtimeSeconds =
        (result && (result.runtimeSeconds ?? result.RuntimeSeconds)) || 0;

    const heuristicName =
        (result && (result.heuristicName ?? result.HeuristicName)) || heuristic;

    const warnings =
        (result && (result.warnings ?? result.Warnings)) || [];

    const displayedDate =
        (result && (result.targetDate ?? result.TargetDate)) || targetDate;

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">Planning &amp; Scheduling</h2>
                <p>
                    Generate a daily schedule for vessel loading/unloading operations and
                    see delays relative to desired departure times.
                </p>
            </div>

            {/* Form card */}
            <div className="operations-container">
                <div className="operation-section">
                    <div
                        className="operation-header expanded"
                        style={{ borderLeftColor: "#3498db" }}
                    >
                        <div className="operation-info">
                            <h3 className="operation-title">Run Scheduling Heuristic</h3>
                            <p className="operation-description">
                                Select a day and heuristic, then compute the best sequence of
                                vessels for the single dock.
                            </p>
                        </div>
                        <div className="operation-controls">
                            <span className="http-method" style={{ backgroundColor: "#3498db" }}>
                                POST
                            </span>
                        </div>
                    </div>

                    <div className="operation-content">
                        <div className="operation-body">
                            <form onSubmit={handleSubmit} className="form-container">
                                <div className="form-grid" style={{ gap: 24 }}>
                                    <div className="form-group">
                                        <label>
                                            Target date <span className="required">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={targetDate}
                                            onChange={(e) => setTargetDate(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Heuristic <span className="required">*</span>
                                        </label>
                                        <select
                                            className="form-input"
                                            value={heuristic}
                                            onChange={(e) => setHeuristic(e.target.value)}
                                        >
                                            {HEURISTICS.map((h) => (
                                                <option key={h.value} value={h.value}>
                                                    {h.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div
                                    className="form-actions"
                                    style={{ marginTop: 24, display: "flex", gap: 12 }}
                                >
                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={loading}
                                    >
                                        {loading ? "Computing…" : "Generate schedule"}
                                    </button>
                                </div>
                            </form>

                            {error && (
                                <div
                                    className="error"
                                    style={{ marginTop: 16, color: "crimson" }}
                                >
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results section */}
            {result && !loading && (
                <div className="operations-container" style={{ marginTop: 24 }}>
                    <div className="operation-section">
                        <div
                            className="operation-header expanded"
                            style={{ borderLeftColor: "#2ecc71" }}
                        >
                            <div className="operation-info">
                                <h3 className="operation-title">Schedule Result</h3>
                                <p className="operation-description">
                                    Day: <strong>{displayedDate}</strong> | Heuristic:{" "}
                                    <strong>{heuristicName}</strong>
                                </p>
                            </div>
                        </div>

                        <div className="operation-content">
                            <div className="operation-body">
                                <div
                                    className="summary-cards"
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 16,
                                        marginBottom: 16,
                                    }}
                                >
                                    <div className="summary-card">
                                        <div className="summary-label">Total delay</div>
                                        <div className="summary-value">
                                            {Math.round(totalDelay)} min
                                        </div>
                                    </div>
                                    <div className="summary-card">
                                        <div className="summary-label">Runtime</div>
                                        <div className="summary-value">
                                            {runtimeSeconds.toFixed
                                                ? runtimeSeconds.toFixed(3)
                                                : runtimeSeconds}{" "}
                                            s
                                        </div>
                                    </div>
                                    <div className="summary-card">
                                        <div className="summary-label">Scheduled vessels</div>
                                        <div className="summary-value">{resolvedEntries.length}</div>
                                    </div>
                                </div>

                                {warnings.length > 0 && (
                                    <div
                                        className="warning-box"
                                        style={{
                                            marginBottom: 16,
                                            padding: 12,
                                            borderRadius: 4,
                                            backgroundColor: "#fff8e1",
                                            border: "1px solid #f1c40f",
                                            color: "#8a6d1d",
                                        }}
                                    >
                                        <strong>Warnings:</strong>
                                        <ul style={{ marginTop: 4 }}>
                                            {warnings.map((w, idx) => (
                                                <li key={idx}>{w}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {resolvedEntries.length === 0 ? (
                                    <div>No vessels found for this day.</div>
                                ) : (
                                    <div className="table-wrapper">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Vessel IMO</th>
                                                    <th>Visit ID</th>
                                                    <th>Start Time</th>
                                                    <th>End Time</th>
                                                    <th>Delay (min)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {resolvedEntries.map((e, idx) => (
                                                    <tr key={e.vesselVisitId || e.VesselVisitId || idx}>
                                                        <td>{idx + 1}</td>
                                                        <td>{e.vesselIMO || e.VesselIMO}</td>
                                                        <td>{e.vesselVisitId || e.VesselVisitId}</td>
                                                        <td>{formatDateTime(e.startTime || e.StartTime)}</td>
                                                        <td>{formatDateTime(e.endTime || e.EndTime)}</td>
                                                        <td>
                                                            {e.delayMinutes ??
                                                                e.DelayMinutes ??
                                                                0}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div style={{ marginTop: 16 }} className="loading-indicator">
                    Running Prolog heuristic…
                </div>
            )}
        </div>
    );
};

window.SchedulingHubPage = SchedulingHubPage;

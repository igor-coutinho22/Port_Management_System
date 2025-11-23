/* global React, apiService */

const HEURISTICS = [
    { value: "minimum_slack_time", label: "Minimum Slack Time" },
    { value: "early_departure_time", label: "Earliest Departure First" },
    { value: "arrived_shortest_departure_time", label: "Arrived – Shortest Departure" },
    { value: "atc", label: "ATC (Apparent Tardiness Cost)" },
    { value: "optimal", label: "Optimal (all permutations – slow)" }
];

function formatDateInputValue(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function formatDateTime(value) {
    if (!value) return "";
    const dt = new Date(value);
    if (isNaN(dt.getTime())) return value;
    return dt.toLocaleString();
}

const SchedulingHubPage = () => {
    const [targetDate, setTargetDate] = React.useState(
        formatDateInputValue(new Date())
    );
    const [heuristic, setHeuristic] = React.useState("atc");
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    // Result of classic single-crane endpoint
    const [result, setResult] = React.useState(null);

    // NEW: result of /scheduling/daily-with-multi-crane
    const [compareResult, setCompareResult] = React.useState(null);

    // ----- Single-crane handler (existing behavior) -----
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setResult(null);
        setCompareResult(null); // clear comparison when running single
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

    // ----- NEW: Compare 1 vs 2 cranes -----
    const handleCompare = async () => {
        setError(null);
        setResult(null);       // clear plain result, we’ll show comparison instead
        setCompareResult(null);
        setLoading(true);

        try {
            console.log("Calling multi-crane comparison API with:", { targetDate, heuristic });
            const data = await apiService.generateDailyScheduleWithMultiCrane(targetDate, heuristic);
            console.log("Multi-crane comparison result:", data);
            setCompareResult(data);
        } catch (err) {
            console.error("Multi-crane scheduling error:", err);
            setError(err?.message || "Failed to generate comparative schedule.");
        } finally {
            setLoading(false);
        }
    };

    // ===== Helpers for SINGLE result (existing section) =====
    const resolvedEntries = React.useMemo(() => {
        if (!result) return [];
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

    // ===== Helpers for COMPARISON result =====
    const singleRes = React.useMemo(() => {
        if (!compareResult) return null;
        return compareResult.singleCrane || compareResult.SingleCrane || null;
    }, [compareResult]);

    const multiRes = React.useMemo(() => {
        if (!compareResult) return null;
        return compareResult.multiCrane || compareResult.MultiCrane || null;
    }, [compareResult]);

    const singleEntries = React.useMemo(() => {
        if (!singleRes) return [];
        return singleRes.entries || singleRes.Entries || [];
    }, [singleRes]);

    const multiEntries = React.useMemo(() => {
        if (!multiRes) return [];
        return multiRes.entries || multiRes.Entries || [];
    }, [multiRes]);

    const craneHoursSingle =
        (compareResult &&
            (compareResult.craneHoursSingle ??
                compareResult.CraneHoursSingle)) || null;

    const craneHoursMulti =
        (compareResult &&
            (compareResult.craneHoursMulti ??
                compareResult.CraneHoursMulti)) || null;

    const delayImprovement =
        compareResult &&
        (compareResult.delayImprovementMinutes ??
            compareResult.DelayImprovementMinutes ??
            null);

    const multiUsed =
        !!(compareResult &&
            (compareResult.multiCraneUsed ?? compareResult.MultiCraneUsed));

    const compareHeuristicName =
        (singleRes && (singleRes.heuristicName ?? singleRes.HeuristicName)) || heuristic;

    const compareDisplayedDate =
        (singleRes && (singleRes.targetDate ?? singleRes.TargetDate)) || targetDate;

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
                                vessels for the single dock. You can also compare single-crane
                                and multi-crane strategies.
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
                                    style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}
                                >
                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={loading}
                                    >
                                        {loading ? "Computing…" : "Generate single-crane schedule"}
                                    </button>

                                    {/* NEW: Compare 1 vs 2 cranes */}
                                    <button
                                        type="button"
                                        className="submit-btn secondary"
                                        disabled={loading}
                                        onClick={handleCompare}
                                    >
                                        {loading ? "Computing…" : "Compare 1 vs 2 cranes"}
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

            {/* Single-crane results section (existing) */}
            {result && !loading && (
                <div className="operations-container" style={{ marginTop: 24 }}>
                    <div className="operation-section">
                        <div
                            className="operation-header expanded"
                            style={{ borderLeftColor: "#2ecc71" }}
                        >
                            <div className="operation-info">
                                <h3 className="operation-title">Schedule Result (Single Crane)</h3>
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

            {/* NEW: Comparison section (single vs multi-crane) */}
            {/* NEW: Comparison section (single vs multi-crane) */}
            {compareResult && !loading && (
                <div className="operations-container" style={{ marginTop: 24 }}>
                    <div className="operation-section">
                        <div
                            className="operation-header expanded"
                            style={{ borderLeftColor: "#9b59b6" }}
                        >
                            <div className="operation-info">
                                <h3 className="operation-title">Single vs Multi-Crane Comparison</h3>
                                <p className="operation-description">
                                    Day: <strong>{compareDisplayedDate}</strong> | Heuristic:{" "}
                                    <strong>{compareHeuristicName}</strong>
                                </p>
                            </div>
                        </div>

                        <div className="operation-content">
                            <div className="operation-body">
                                {/* Summary metrics */}
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
                                        <div className="summary-label">Single-crane delay</div>
                                        <div className="summary-value">
                                            {singleRes
                                                ? Math.round(
                                                    singleRes.totalDelayMinutes ??
                                                    singleRes.TotalDelayMinutes ??
                                                    0
                                                )
                                                : "-"}{" "}
                                            min
                                        </div>
                                    </div>

                                    <div className="summary-card">
                                        <div className="summary-label">Multi-crane delay</div>
                                        <div className="summary-value">
                                            {multiRes
                                                ? Math.round(
                                                    multiRes.totalDelayMinutes ??
                                                    multiRes.TotalDelayMinutes ??
                                                    0
                                                )
                                                : "n/a"}{" "}
                                            min
                                        </div>
                                    </div>

                                    <div className="summary-card">
                                        <div className="summary-label">Crane-hours (single)</div>
                                        <div className="summary-value">
                                            {craneHoursSingle != null
                                                ? craneHoursSingle.toFixed(2)
                                                : "-"}{" "}
                                            h
                                        </div>
                                    </div>

                                    <div className="summary-card">
                                        <div className="summary-label">Crane-hours (multi)</div>
                                        <div className="summary-value">
                                            {craneHoursMulti != null
                                                ? craneHoursMulti.toFixed(2)
                                                : "n/a"}{" "}
                                            h
                                        </div>
                                    </div>

                                    {delayImprovement != null && (
                                        <div className="summary-card">
                                            <div className="summary-label">Delay improvement</div>
                                            <div className="summary-value">
                                                {delayImprovement.toFixed(1)} min{" "}
                                                {delayImprovement > 0 ? "↓" : ""}
                                            </div>
                                        </div>
                                    )}

                                    <div className="summary-card">
                                        <div className="summary-label">Multi-crane used?</div>
                                        <div className="summary-value">
                                            {multiUsed ? "Yes" : "No"}
                                        </div>
                                    </div>
                                </div>

                                {/* SINGLE-CRANE TABLE (full width) */}
                                <h4 style={{ marginBottom: 8 }}>Single-crane schedule</h4>
                                {singleEntries.length === 0 ? (
                                    <div>No vessels found for this day.</div>
                                ) : (
                                    <div className="table-wrapper">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Vessel IMO</th>
                                                    <th>Visit ID</th>
                                                    <th>Start</th>
                                                    <th>End</th>
                                                    <th>Delay (min)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {singleEntries.map((e, idx) => (
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

                                {/* MULTI-CRANE TABLE (stacked below) */}
                                <h4 style={{ marginTop: 24, marginBottom: 8 }}>Multi-crane schedule</h4>
                                {multiEntries.length === 0 ? (
                                    <div>
                                        No multi-crane schedule (single-crane may already be optimal
                                        for this day).
                                    </div>
                                ) : (
                                    <div className="table-wrapper">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Vessel IMO</th>
                                                    <th>Visit ID</th>
                                                    <th>Start</th>
                                                    <th>End</th>
                                                    <th>Cranes</th>
                                                    <th>Delay (min)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {multiEntries.map((e, idx) => {
                                                    const cranes =
                                                        e.numberOfCranes ??
                                                        e.NumberOfCranes ??
                                                        1;
                                                    const delay =
                                                        e.delayMinutes ??
                                                        e.DelayMinutes ??
                                                        0;
                                                    return (
                                                        <tr key={e.vesselVisitId || e.VesselVisitId || idx}>
                                                            <td>{idx + 1}</td>
                                                            <td>{e.vesselIMO || e.VesselIMO}</td>
                                                            <td>{e.vesselVisitId || e.VesselVisitId}</td>
                                                            <td>{formatDateTime(e.startTime || e.StartTime)}</td>
                                                            <td>{formatDateTime(e.endTime || e.EndTime)}</td>
                                                            <td
                                                                style={
                                                                    cranes > 1
                                                                        ? {
                                                                            fontWeight: "bold",
                                                                            color: "#c0392b",
                                                                        }
                                                                        : {}
                                                                }
                                                            >
                                                                {cranes}
                                                            </td>
                                                            <td>{delay}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <p
                                    style={{
                                        marginTop: 12,
                                        fontSize: "0.9rem",
                                        color: "#555",
                                    }}
                                >
                                    Rows where <strong>Cranes &gt; 1</strong> show the time windows where
                                    additional cranes were allocated to reduce total delay.
                                </p>
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

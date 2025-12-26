/* global React, apiService */

// We assume the Modal will be loaded globally. 
// If it's not loaded yet, we default to a null component to prevent crashes during dev.
const OperationPlanPreviewModal = window.OperationPlanPreviewModal || (() => null);

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

    // NEW: Control the "Draft Plan" Modal
    const [showPlanModal, setShowPlanModal] = React.useState(false);
    const [expandedSection, setExpandedSection] = React.useState(null);
    const [showQuickView, setShowQuickView] = React.useState(false);
    const [operationsPlansList, setOperationsPlansList] = React.useState([]);
    const [isLoadingPlans, setIsLoadingPlans] = React.useState(false);

    // ----- Single-crane handler (existing behavior) -----
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setResult(null);
        setCompareResult(null);
        setLoading(true);

        try {
            const data = await apiService.generateDailySchedule(targetDate, heuristic);
            setResult(data);
        } catch (err) {
            console.error("Scheduling error:", err);
            setError(err?.message || "Failed to generate schedule.");
        } finally {
            setLoading(false);
        }
    };

    // ----- Compare 1 vs 2 cranes -----
    const handleCompare = async () => {
        setError(null);
        setResult(null);
        setCompareResult(null);
        setLoading(true);

        try {
            const data = await apiService.generateDailyScheduleWithMultiCrane(targetDate, heuristic);
            setCompareResult(data);
        } catch (err) {
            console.error("Multi-crane scheduling error:", err);
            setError(err?.message || "Failed to generate comparative schedule.");
        } finally {
            setLoading(false);
        }
    };

    // ===== Helpers for SINGLE result =====
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

    const craneHoursSingle = (compareResult && (compareResult.craneHoursSingle ?? compareResult.CraneHoursSingle)) || null;
    const craneHoursMulti = (compareResult && (compareResult.craneHoursMulti ?? compareResult.CraneHoursMulti)) || null;
    const delayImprovement = compareResult && (compareResult.delayImprovementMinutes ?? compareResult.DelayImprovementMinutes ?? null);
    const multiUsed = !!(compareResult && (compareResult.multiCraneUsed ?? compareResult.MultiCraneUsed));
    const compareHeuristicName = (singleRes && (singleRes.heuristicName ?? singleRes.HeuristicName)) || heuristic;
    const compareDisplayedDate = (singleRes && (singleRes.targetDate ?? singleRes.TargetDate)) || targetDate;

    // ===== NEW: Determine which data to send to the Draft Modal =====
    const activeScheduleForDraft = React.useMemo(() => {
        // If we have a direct single result, use it
        if (result) return result;

        // If we have a comparison, we prefer the Multi-Crane result (since that's the "upgrade"),
        // unless it's null/empty, then fall back to single.
        if (compareResult) {
            return multiRes || singleRes;
        }
        return null;
    }, [result, compareResult, multiRes, singleRes]);

    const toggleSection = (sectionId) => {
        setExpandedSection(expandedSection === sectionId ? null : sectionId);
    };

    const loadPlans = async () => {
        setIsLoadingPlans(true);
        try {
            const data = await apiService.getOperationPlans();
            // Sort by Date Descending
            const sorted = (data || []).sort((a, b) => new Date(b.scheduleDate) - new Date(a.scheduleDate));
            setOperationsPlansList(sorted);
        } catch (error) {
            console.error("Error loading plans:", error);
        } finally {
            setIsLoadingPlans(false);
        }
    };

    React.useEffect(() => {
        if (showQuickView) {
            loadPlans();
        }
    }, [showQuickView]);

    const sections = [
        {
            id: 'getById',
            title: 'Get Operation Plan By Id',
            description: 'Get details of an existing operation plan by its unique identifier.',
            color: '#2980b9',
            component: 'GetOperationPlanByIdForm'
        },
        {
            id: 'search',
            title: 'Search Operation Plans By Date(s) and/or Vessel IMO',
            description: 'Get details of an existing operation plan for a specific date(s) and/or vessel IMO.',
            color: '#2980b9',
            component: 'SearchOperationPlanForm'
        },
        {
            id: 'update',
            title: 'Update Operation Plan',
            description: 'Update an existing operation plan by its unique identifier.',
            color: '#f39c12',
            component: 'UpdateOperationPlanForm'
        },
        {
            id: 'delete',
            title: 'Delete Operation Plan',
            description: 'Delete an existing operation plan by its unique identifier.',
            color: '#c0392b',
            component: 'DeleteOperationPlanForm'
        },
        {
            id: 'missing',
            title: 'Missing Plans',
            description: 'Identify Vessel Visits without Operation Plans and regenerate them.',
            color: '#e74c3c',
            component: 'MissingPlansSection'
        },
        {
            id: 'resources',
            title: 'Resource Utilization',
            description: 'Analyze resource usage (Cranes, Staff, Docks) over a period.',
            color: '#8e44ad',
            component: 'ResourceUtilizationSection'
        }
    ];


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
                    <div className="operation-header expanded" style={{ borderLeftColor: "#3498db" }}>
                        <div className="operation-info">
                            <h3 className="operation-title">Run Scheduling Heuristic</h3>
                            <p className="operation-description">
                                Select a day and heuristic to compute the best sequence.
                            </p>
                        </div>
                        <div className="operation-controls">
                            <span className="http-method" style={{ backgroundColor: "#3498db" }}>POST</span>
                        </div>
                    </div>

                    <div className="operation-content">
                        <div className="operation-body">
                            <form onSubmit={handleSubmit} className="form-container">
                                <div className="form-grid" style={{ gap: 24 }}>
                                    <div className="form-group">
                                        <label>Target date <span className="required">*</span></label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={targetDate}
                                            onChange={(e) => setTargetDate(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Heuristic <span className="required">*</span></label>
                                        <select
                                            className="form-input"
                                            value={heuristic}
                                            onChange={(e) => setHeuristic(e.target.value)}
                                        >
                                            {HEURISTICS.map((h) => (
                                                <option key={h.value} value={h.value}>{h.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-actions" style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
                                    <button type="submit" className="submit-btn" disabled={loading}>
                                        {loading ? "Computing…" : "Generate single-crane schedule"}
                                    </button>

                                    <button type="button" className="submit-btn secondary" disabled={loading} onClick={handleCompare}>
                                        {loading ? "Computing…" : "Compare 1 vs 2 cranes"}
                                    </button>
                                </div>
                            </form>

                            {error && (
                                <div className="error" style={{ marginTop: 16, color: "crimson" }}>
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Single-crane results section */}
            {result && !loading && (
                <div className="operations-container" style={{ marginTop: 24 }}>
                    <div className="operation-section">
                        <div className="operation-header expanded" style={{ borderLeftColor: "#2ecc71" }}>
                            <div className="operation-info">
                                <h3 className="operation-title">Schedule Result (Single Crane)</h3>
                                <p className="operation-description">
                                    Day: <strong>{displayedDate}</strong> | Heuristic: <strong>{heuristicName}</strong>
                                </p>
                            </div>
                        </div>

                        <div className="operation-content">
                            <div className="operation-body">
                                <div className="summary-cards" style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
                                    <div className="summary-card">
                                        <div className="summary-label">Total delay</div>
                                        <div className="summary-value">{Math.round(totalDelay)} min</div>
                                    </div>
                                    <div className="summary-card">
                                        <div className="summary-label">Runtime</div>
                                        <div className="summary-value">{runtimeSeconds.toFixed ? runtimeSeconds.toFixed(3) : runtimeSeconds} s</div>
                                    </div>
                                    <div className="summary-card">
                                        <div className="summary-label">Scheduled vessels</div>
                                        <div className="summary-value">{resolvedEntries.length}</div>
                                    </div>
                                </div>

                                {warnings.length > 0 && (
                                    <div className="warning-box" style={{ marginBottom: 16, padding: 12, borderRadius: 4, backgroundColor: "#fff8e1", border: "1px solid #f1c40f", color: "#8a6d1d" }}>
                                        <strong>Warnings:</strong>
                                        <ul style={{ marginTop: 4 }}>
                                            {warnings.map((w, idx) => <li key={idx}>{w}</li>)}
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
                                                        <td>{e.delayMinutes ?? e.DelayMinutes ?? 0}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* NEW: Draft Button for Single Result */}
                                {resolvedEntries.length > 0 && (
                                    <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                                        <button
                                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg shadow-lg flex items-center gap-2"
                                            onClick={() => setShowPlanModal(true)}
                                            style={{ backgroundColor: "#27ae60", color: "white", padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px" }}
                                        >
                                            <span>📝</span> Draft Operation Plan
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Comparison section */}
            {compareResult && !loading && (
                <div className="operations-container" style={{ marginTop: 24 }}>
                    <div className="operation-section">
                        <div className="operation-header expanded" style={{ borderLeftColor: "#9b59b6" }}>
                            <div className="operation-info">
                                <h3 className="operation-title">Single vs Multi-Crane Comparison</h3>
                                <p className="operation-description">
                                    Day: <strong>{compareDisplayedDate}</strong> | Heuristic: <strong>{compareHeuristicName}</strong>
                                </p>
                            </div>
                        </div>

                        <div className="operation-content">
                            <div className="operation-body">
                                {/* Summary metrics */}
                                <div className="summary-cards" style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
                                    {/* ... (Existing Comparison Metrics) ... */}
                                    <div className="summary-card">
                                        <div className="summary-label">Single-crane delay</div>
                                        <div className="summary-value">
                                            {singleRes ? Math.round(singleRes.totalDelayMinutes ?? singleRes.TotalDelayMinutes ?? 0) : "-"} min
                                        </div>
                                    </div>
                                    <div className="summary-card">
                                        <div className="summary-label">Multi-crane delay</div>
                                        <div className="summary-value">
                                            {multiRes ? Math.round(multiRes.totalDelayMinutes ?? multiRes.TotalDelayMinutes ?? 0) : "n/a"} min
                                        </div>
                                    </div>
                                    <div className="summary-card">
                                        <div className="summary-label">Delay improvement</div>
                                        <div className="summary-value">
                                            {delayImprovement != null ? delayImprovement.toFixed(1) : "-"} min
                                        </div>
                                    </div>
                                    <div className="summary-card">
                                        <div className="summary-label">Multi-crane used?</div>
                                        <div className="summary-value">{multiUsed ? "Yes" : "No"}</div>
                                    </div>
                                </div>

                                {/* SINGLE-CRANE TABLE */}
                                <h4 style={{ marginBottom: 8 }}>Single-crane schedule</h4>
                                {singleEntries.length === 0 ? (
                                    <div>No vessels found.</div>
                                ) : (
                                    <div className="table-wrapper">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Vessel IMO</th>
                                                    <th>Start</th>
                                                    <th>End</th>
                                                    <th>Delay</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {singleEntries.map((e, idx) => (
                                                    <tr key={idx}>
                                                        <td>{idx + 1}</td>
                                                        <td>{e.vesselIMO || e.VesselIMO}</td>
                                                        <td>{formatDateTime(e.startTime || e.StartTime)}</td>
                                                        <td>{formatDateTime(e.endTime || e.EndTime)}</td>
                                                        <td>{e.delayMinutes ?? e.DelayMinutes ?? 0}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* MULTI-CRANE TABLE */}
                                <h4 style={{ marginTop: 24, marginBottom: 8 }}>Multi-crane schedule</h4>
                                {multiEntries.length === 0 ? (
                                    <div>No multi-crane schedule.</div>
                                ) : (
                                    <div className="table-wrapper">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>#</th>
                                                    <th>Vessel IMO</th>
                                                    <th>Start</th>
                                                    <th>End</th>
                                                    <th>Cranes</th>
                                                    <th>Delay</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {multiEntries.map((e, idx) => (
                                                    <tr key={idx}>
                                                        <td>{idx + 1}</td>
                                                        <td>{e.vesselIMO || e.VesselIMO}</td>
                                                        <td>{formatDateTime(e.startTime || e.StartTime)}</td>
                                                        <td>{formatDateTime(e.endTime || e.EndTime)}</td>
                                                        <td style={(e.numberOfCranes || e.NumberOfCranes) > 1 ? { fontWeight: "bold", color: "#c0392b" } : {}}>
                                                            {e.numberOfCranes || e.NumberOfCranes || 1}
                                                        </td>
                                                        <td>{e.delayMinutes ?? e.DelayMinutes ?? 0}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* NEW: Draft Button for Comparison Result */}
                                {multiEntries.length > 0 && (
                                    <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => setShowPlanModal(true)}
                                            style={{ backgroundColor: "#8e44ad", color: "white", padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px" }}
                                        >
                                            <span>📝</span> Draft Multi-Crane Plan
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {loading && (
                <div style={{ marginTop: 16 }} className="loading-indicator">
                    Running Prolog heuristic...
                </div>
            )}

            {/* --- NEW: OPERATION PLANS MANAGEMENT HUB --- */}

            <div className="hub-divider" style={{ margin: '40px 0', borderBottom: '1px solid #334155' }}></div>

            <div className="hub-header" style={{ marginBottom: '20px' }}>
                <h3 className="page-title" style={{ fontSize: '1.5rem', color: '#38bdf8' }}>Operation Plans Management</h3>
                <p>View history, search, or remove saved plans.</p>
            </div>

            {/* Quick Data View Button */}
            <div className="quick-view-container">
                <button
                    className={`quick-view-btn ${showQuickView ? 'active' : ''}`}
                    onClick={() => setShowQuickView(!showQuickView)}
                >
                    <span className="quick-view-icon">📊</span>
                    Quick Data View
                    <span className={`quick-view-arrow ${showQuickView ? 'up' : 'down'}`}>
                        {showQuickView ? '▲' : '▼'}
                    </span>
                </button>

                {showQuickView && (
                    <div className="quick-view-panel">
                        {isLoadingPlans ? (
                            <div className="loading">Loading Plans...</div>
                        ) : (
                            <OperationPlansQuickTable plans={operationsPlansList} onRefresh={loadPlans} />
                        )}
                    </div>
                )}
            </div>

            {/* Swagger-style Expandable Sections */}
            <div className="operations-container">
                {sections.map((section) => (
                    <div key={section.id} className="operation-section">
                        <div
                            className={`operation-header ${expandedSection === section.id ? 'expanded' : ''}`}
                            onClick={() => toggleSection(section.id)}
                            style={{ borderLeftColor: section.color }}
                        >
                            <div className="operation-info">
                                <h3 className="operation-title">{section.title}</h3>
                                <p className="operation-description">{section.description}</p>
                            </div>
                            <div className="operation-controls">
                                <span
                                    className="http-method"
                                    style={{ backgroundColor: section.color }}
                                >
                                    {section.id.includes('delete') ? 'DELETE' : 'GET'}
                                </span>
                                <span className={`expand-arrow ${expandedSection === section.id ? 'up' : 'down'}`}>
                                    {expandedSection === section.id ? '▲' : '▼'}
                                </span>
                            </div>
                        </div>

                        {expandedSection === section.id && (
                            <div className="operation-content">
                                <div className="operation-body">
                                    {section.component === 'GetOperationPlanByIdForm' && <GetOperationPlanByIdForm />}
                                    {section.component === 'SearchOperationPlanForm' && <SearchOperationPlanForm />}
                                    {section.component === 'UpdateOperationPlanForm' && <UpdateOperationPlanForm onSuccess={loadPlans} />}
                                    {section.component === 'DeleteOperationPlanForm' && <DeleteOperationPlanForm onSuccess={loadPlans} />}
                                    {section.component === 'MissingPlansSection' && <MissingPlansSection />}
                                    {section.component === 'ResourceUtilizationSection' && <ResourceUtilizationSection />}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Render the Modal */}
            {showPlanModal && (
                <OperationPlanPreviewModal
                    isOpen={showPlanModal}
                    onClose={() => setShowPlanModal(false)}
                    scheduleResult={activeScheduleForDraft}
                    date={targetDate}
                    heuristic={heuristic}
                />
            )}
        </div>
    );
};

// Operation Plans Quick Table Component
const OperationPlansQuickTable = ({ plans, onRefresh }) => {
    // Assuming simple translation or fallback
    const t = (key) => key;

    return (
        <div className="quick-table-container">
            <div className="quick-table-header">
                <h4>Operation Plans Overview ({plans.length} Total)</h4>
                <button className="refresh-btn" onClick={onRefresh}>🔄 Refresh</button>
            </div>
            {plans.length === 0 ? (
                <div className="no-data">
                    <h3>No Operation Plans Found</h3>
                    <p>There are currently no saved operation plans in the system.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="data-table quick-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Heuristic</th>
                                <th>Author</th>
                                <th>Runtime (s)</th>
                                <th>Delay (min)</th>
                                <th>Vessels</th>
                                <th>Plan ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map((plan) => (
                                <tr key={plan.id}>
                                    <td style={{ fontWeight: 'bold', color: '#3498db' }}>{plan.scheduleDate}</td>
                                    <td>
                                        <span className={`status-badge ${plan.status?.toLowerCase() || 'draft'}`}>
                                            {plan.status || 'Draft'}
                                        </span>
                                    </td>
                                    <td>{plan.heuristicUsed}</td>
                                    <td>{plan.author || 'System'}</td>
                                    <td>{plan.runtimeSeconds?.toFixed(3) || '0.000'}</td>
                                    <td style={{ color: plan.totalDelayMinutes > 0 ? '#e74c3c' : '#2ecc71' }}>
                                        {Math.round(plan.totalDelayMinutes)}
                                    </td>
                                    <td>{plan.items?.length || 0}</td>
                                    <td className="id-cell" title={plan.id}>{plan.id}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

window.SchedulingHubPage = SchedulingHubPage;
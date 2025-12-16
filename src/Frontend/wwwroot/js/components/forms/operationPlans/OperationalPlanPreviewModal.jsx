/* global React, apiService */

const OperationPlanPreviewModal = ({ isOpen, onClose, scheduleResult, date, heuristic }) => {
    const [status, setStatus] = React.useState('loading'); // 'loading' | 'ready' | 'saving' | 'success'
    const [error, setError] = React.useState(null);
    const [successMsg, setSuccessMsg] = React.useState(null); // New state for green message
    const [enrichedItems, setEnrichedItems] = React.useState([]);

    // --- Helpers ---
    const getVal = (obj, key1, key2) => obj?.[key1] ?? obj?.[key2];

    const formatTime = (dateObj) => {
        if (!dateObj || isNaN(new Date(dateObj))) return "--:--";
        return new Date(dateObj).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // --- SMART USER FINDER ---
    const getCurrentUser = () => {
        try {
            // 1. Helper to safely parse JSON
            const parse = (str) => {
                try { return JSON.parse(str); } catch { return null; }
            };

            // 2. Define standard keys to check first (Optimization)
            const commonKeys = ["user", "currentUser", "account", "activeAccount", "msal.account"];
            
            // 3. Helper to check if an object looks like a user
            const isUserObject = (obj) => {
                return obj && (obj.name || obj.userName || obj.username) && (obj.email || obj.idTokenClaims || obj.authorityType);
            };

            // 4. Check specific keys first
            for (const key of commonKeys) {
                const val = localStorage.getItem(key) || sessionStorage.getItem(key);
                const obj = parse(val);
                if (isUserObject(obj)) return obj.name;
            }

            // 5. FALLBACK: Scan ALL Local Storage to find the user object
            // This finds it even if the key is a random GUID like MSAL uses
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const val = localStorage.getItem(key);
                
                // Quick check: skip if it doesn't contain "name" to save performance
                if (val && val.includes("name")) {
                    const obj = parse(val);
                    if (isUserObject(obj)) {
                        console.log(`Found User in key: "${key}"`); // Debug log to see where it was
                        return obj.name;
                    }
                }
            }
            
            // 6. Final fallback to token decoding if the object wasn't found but a token exists
            const token = localStorage.getItem("jwtToken") || localStorage.getItem("accessToken");
            if (token) {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(c => 
                    '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
                ).join(''));
                return JSON.parse(jsonPayload).name;
            }

        } catch (e) {
            console.warn("Error finding user:", e);
        }
        
        return "System"; // Default if absolutely nothing is found
    };

    const currentUser = getCurrentUser();

    // --- 1. Fetch & Calculate Logic ---
    React.useEffect(() => {
        // Safety Check 1: Ensure scheduleResult exists
        if (!isOpen || !scheduleResult) return;

        // Safety Check 2: Ensure entries exist (handle different casing)
        const rawEntries = getVal(scheduleResult, "entries", "Entries");
        if (!rawEntries || !Array.isArray(rawEntries)) {
            console.warn("No entries found in scheduleResult", scheduleResult);
            setEnrichedItems([]);
            return;
        }

        const calculatePreview = async () => {
            setStatus('loading');
            setError(null);
            
            try {
                const enrichedData = await Promise.all(rawEntries.map(async (entry) => {
                    // Safety Check 3: Ensure entry is not null
                    if (!entry) return null;

                    const visitId = getVal(entry, "vesselVisitId", "VesselVisitId");
                    
                    // Fetch details with fallback
                    let visitData = { estimatedUnloadingDurationMinutes: 0, estimatedLoadingDurationMinutes: 0 }; 
                    try {
                        const fetched = await apiService.getVesselVisitNotificationById(visitId);
                        if (fetched) visitData = fetched; // Only assign if not null
                    } catch (e) {
                        console.warn(`Could not fetch details for visit ${visitId}`, e);
                    }

                    // Safety Check 4: Handle dates carefully
                    const startRaw = getVal(entry, "startTime", "StartTime");
                    const endRaw = getVal(entry, "endTime", "EndTime");

                    const serviceStart = startRaw ? new Date(startRaw) : new Date();
                    const serviceEnd = endRaw ? new Date(endRaw) : new Date();
                    
                    const allocatedMinutes = (serviceEnd - serviceStart) / 60000;
                    
                    // Use Default 0 if property is missing
                    const estUnload = visitData?.estimatedUnloadingDurationMinutes || 0;
                    const estLoad = visitData?.estimatedLoadingDurationMinutes || 0;
                    const totalNeeded = estUnload + estLoad;

                    const ratio = totalNeeded > 0 ? allocatedMinutes / totalNeeded : 1;

                    const unloadDurationScaled = estUnload * ratio;
                    const loadDurationScaled = estLoad * ratio;

                    const unloadStart = new Date(serviceStart);
                    const unloadEnd = new Date(unloadStart.getTime() + unloadDurationScaled * 60000);
                    
                    const loadStart = unloadEnd; 
                    const loadEnd = new Date(loadStart.getTime() + loadDurationScaled * 60000);

                    return {
                        vesselIMO: getVal(entry, "vesselIMO", "VesselIMO") || "N/A",
                        vesselVisitId: visitId || "Unknown",
                        numberOfCranes: getVal(entry, "numberOfCranes", "NumberOfCranes") || 1,
                        
                        serviceStartTime: serviceStart,
                        serviceEndTime: serviceEnd,
                        unloadingStartTime: unloadStart,
                        unloadingEndTime: unloadEnd,
                        loadingStartTime: loadStart,
                        loadingEndTime: loadEnd
                    };
                }));

                // Filter out any nulls from failed mappings
                setEnrichedItems(enrichedData.filter(i => i !== null));
                setStatus('ready');

            } catch (err) {
                console.error("Error calculating preview:", err);
                setError("Failed to calculate operation details. Please try again.");
                setStatus('ready');
            }
        };

        calculatePreview();
    }, [isOpen, scheduleResult]);

    // --- 2. Save Logic ---
    const handleSave = async () => {
        setStatus('saving');
        setError(null);
        
        try {
            const totalDelay = getVal(scheduleResult, "totalDelayMinutes", "TotalDelayMinutes") ?? 0;
            const runtime = getVal(scheduleResult, "runtimeSeconds", "RuntimeSeconds") ?? 0;

            const payload = {
                scheduleDate: date,
                heuristicUsed: heuristic,
                totalDelayMinutes: totalDelay,
                runtimeSeconds: runtime,
                entries: enrichedItems.map(item => ({
                    vesselVisitId: item.vesselVisitId,
                    vesselIMO: item.vesselIMO,
                    startTime: item.serviceStartTime,
                    endTime: item.serviceEndTime,
                    numberOfCranes: item.numberOfCranes
                }))
            };

            await apiService.createOperationPlan(payload);
            
            setStatus('success');
            setSuccessMsg("Operation Plan saved successfully as 'Draft'!");
            
            // Optional: Close automatically after 2 seconds
            // setTimeout(onClose, 2000); 

        } catch (err) {
            setError(err.message || "Failed to save plan.");
            setStatus('ready');
        }
    };

    if (!isOpen) return null;

    // Metrics for Header
    const totalDelay = Math.round(getVal(scheduleResult, "totalDelayMinutes", "TotalDelayMinutes") ?? 0);
    const runtime = (getVal(scheduleResult, "runtimeSeconds", "RuntimeSeconds") ?? 0).toFixed(3);

    return (
        <div className="modal-overlay">
            <div className="modal-content large">
                <div className="modal-header">
                    <h3>{status === 'success' ? 'Plan Saved' : 'Confirm Operation Plan'}</h3>
                    <button className="close-btn" onClick={onClose} disabled={status === 'saving'}>&times;</button>
                </div>

                <div className="modal-body">
                    {status !== 'success' && (
                        <p className="modal-description">
                            Review the complete operation breakdown below.
                        </p>
                    )}

                    {/* NEW: Expanded Metrics Header */}
                    <div className="plan-metrics">
                        <div className="metric">
                            <span className="label">Date</span>
                            <span className="value" style={{color:'white'}}>{date}</span>
                        </div>
                        <div className="metric">
                            <span className="label">Heuristic</span>
                            <span className="value">{heuristic.toUpperCase()}</span>
                        </div>
                        <div className="metric">
                            <span className="label">Author</span>
                            <span className="value">{currentUser}</span>
                        </div>
                        <div className="metric">
                            <span className="label">Runtime</span>
                            <span className="value">{runtime} s</span>
                        </div>
                        <div className="metric">
                            <span className="label">Total Delay</span>
                            <span className="value" style={{color: totalDelay > 0 ? '#fca5a5' : '#86efac'}}>
                                {totalDelay} min
                            </span>
                        </div>
                    </div>

                    {/* MAIN TABLE */}
                    {status === 'loading' ? (
                        <div className="loading-box">
                            <div className="spinner"></div>
                            <span>Fetching vessel details and calculating time windows...</span>
                        </div>
                    ) : (
                        <div className="table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <table className="data-table detailed-table">
                                <thead>
                                    <tr>
                                        <th style={{width: '10%'}}>IMO</th>
                                        <th style={{width: '20%'}}>Visit ID</th> {/* NEW COLUMN */}
                                        <th style={{width: '20%'}}>Service Slot</th>
                                        <th style={{width: '20%', color:'#fbbf24'}}>Unloading</th>
                                        <th style={{width: '20%', color:'#34d399'}}>Loading</th>
                                        <th style={{width: '10%'}}>Cranes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrichedItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td style={{fontWeight:'bold'}}>{item.vesselIMO}</td>
                                            
                                            {/* Visit ID - Truncated with Title for hover */}
                                            <td title={item.vesselVisitId} style={{fontSize: '0.8rem', color: '#94a3b8'}}>
                                                {item.vesselVisitId.substring(0, 8)}...
                                            </td>
                                            
                                            <td>{formatTime(item.serviceStartTime)} - {formatTime(item.serviceEndTime)}</td>
                                            <td style={{color: '#fcd34d'}}>{formatTime(item.unloadingStartTime)} - {formatTime(item.unloadingEndTime)}</td>
                                            <td style={{color: '#6ee7b7'}}>{formatTime(item.loadingStartTime)} - {formatTime(item.loadingEndTime)}</td>

                                            <td style={{textAlign:'center'}}>
                                                <span className={`badge ${item.numberOfCranes > 1 ? 'multi' : 'single'}`}>
                                                    {item.numberOfCranes}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ERROR Message */}
                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* NEW: SUCCESS Message (Green) */}
                    {successMsg && (
                        <div className="success-message">
                            ✅ {successMsg}
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    {status === 'success' ? (
                        // Show only "Close" button on success
                        <button className="cancel-btn" onClick={onClose}>
                            Close
                        </button>
                    ) : (
                        // Show Cancel/Confirm while editing
                        <>
                            <button className="cancel-btn" onClick={onClose} disabled={status === 'saving'}>
                                Refuse / Cancel
                            </button>
                            <button className="confirm-btn" onClick={handleSave} disabled={status !== 'ready'}>
                                {status === 'saving' ? "Saving..." : "Accept & Save Draft"}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

window.OperationPlanPreviewModal = OperationPlanPreviewModal;
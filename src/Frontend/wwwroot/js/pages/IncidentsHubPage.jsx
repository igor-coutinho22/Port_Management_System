console.log("IncidentsHubPage.jsx is loading...");

const IncidentsHubPage = () => {
  // --- STATE ---
  const [expandedSection, setExpandedSection] = React.useState(null);
  const [activeIncidents, setActiveIncidents] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showQuickView, setShowQuickView] = React.useState(false);

  // --- ACTIONS ---
  
  const toggleSection = (sectionName) => {
    setExpandedSection(expandedSection === sectionName ? null : sectionName);
  };

  // Operational Focus: Only load 'Active' incidents for the dashboard view
  const loadActiveIncidents = async () => {
    setIsLoading(true);
    try {
      // Use the search endpoint to filter by Status='Active'
      const data = await apiService.searchIncidents({ status: 'Active' });
      setActiveIncidents(data || []);
    } catch (error) {
      console.error("Error loading active incidents:", error);
      setActiveIncidents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh when opening the Quick View
  React.useEffect(() => {
    if (showQuickView) {
      loadActiveIncidents();
    }
  }, [showQuickView]);

  // --- SECTIONS CONFIGURATION ---
  const sections = [
    {
      id: "create",
      title: "Report New Incident",
      description: "Log a new operational disruption and link it to a vessel.",
      color: "#dc3545", // Red (Urgent/POST)
      component: "CreateIncidentForm",
    },
    {
      id: "resolve",
      title: "Resolve / Update Incident",
      description: "Mark an incident as resolved or update its details.",
      color: "#28a745", // Green (Fixing/PUT)
      component: "UpdateIncidentForm",
    },
    {
      id: "search",
      title: "Search & History",
      description: "Find past incidents by Date, Vessel, or Severity.",
      color: "#6f42c1", // Purple (Analysis)
      component: "SearchIncidentsForm",
    },
  ];

  return (
    <div className="page-section">
      <div className="hub-header">
        <h2 className="page-title">Operational Incidents Control</h2>
        <p>
          Monitor and report real-time disruptions affecting port operations.
        </p>
      </div>

      {/* --- QUICK VIEW: LIVE DASHBOARD --- */}
      <div className="quick-view-container">
        <button
          className={`quick-view-btn ${showQuickView ? "active" : ""}`}
          onClick={() => setShowQuickView(!showQuickView)}
          // Visual cue: Red border if active to signify "Live Mode"
          style={{ borderColor: showQuickView ? '#dc3545' : '' }}
        >
          <span className="quick-view-icon"></span>
          Live Active Incidents
          <span className={`quick-view-arrow ${showQuickView ? "up" : "down"}`}>
            {showQuickView ? "▲" : "▼"}
          </span>
        </button>

        {showQuickView && (
          <div className="quick-view-panel">
            {isLoading ? (
              <div className="loading">Loading live incidents...</div>
            ) : (
              <ActiveIncidentsTable
                incidents={activeIncidents}
                onRefresh={loadActiveIncidents}
              />
            )}
          </div>
        )}
      </div>

      {/* --- OPERATIONS SECTIONS --- */}
      <div className="operations-container">
        {sections.map((section) => (
          <div key={section.id} className="operation-section">
            <div
              className={`operation-header ${
                expandedSection === section.id ? "expanded" : ""
              }`}
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
                  {section.id === "create" ? "POST" : section.id === "resolve" ? "PUT" : "GET"}
                </span>
                <span className={`expand-arrow ${expandedSection === section.id ? "up" : "down"}`}>
                  {expandedSection === section.id ? "▲" : "▼"}
                </span>
              </div>
            </div>

            {expandedSection === section.id && (
              <div className="operation-content">
                <div className="operation-body">
                  {section.component === "CreateIncidentForm" && (
                     <CreateIncidentForm onSuccess={loadActiveIncidents} />
                  )}
                  {section.component === "UpdateIncidentForm" && (
                     <UpdateIncidentForm onSuccess={loadActiveIncidents} />
                  )}
                  {section.component === "SearchIncidentsForm" && (
                     <SearchIncidentsForm />
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: ACTIVE INCIDENTS TABLE ---
const ActiveIncidentsTable = ({ incidents, onRefresh }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString([], { 
      month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' 
    });
  };

  return (
    <div className="quick-table-container">
      <div className="quick-table-header" style={{ borderBottom: '2px solid #dc3545' }}>
        <h4 style={{ color: '#dc3545' }}>⚠️ Current Active Disruptions ({incidents.length})</h4>
        <button className="refresh-btn" onClick={onRefresh}>🔄 Refresh</button>
      </div>
      
      {incidents.length === 0 ? (
        <div className="no-data" style={{ padding: '20px', color: '#28a745' }}>
          <h3>✅ All Clear</h3>
          <p>There are no active incidents reported at this time.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table quick-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Incident Type</th>
                <th>Affected Vessel</th>
                <th>Start Time</th>
                <th>Description</th>
                <th>Author</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                // Highlight Critical rows slightly
                <tr key={inc.id} style={{ backgroundColor: inc.severity === 'Critical' ? '#fff5f5' : 'inherit' }}>
                  <td>
                    <span className={`status-badge status-${(inc.severity || 'minor').toLowerCase()}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td>
                      <strong style={{ display: 'block' }}>{inc.type ? inc.type.name : 'Unknown'}</strong>
                      {/* Using our new no-box class for the code */}
                      <span className="monospace-input" style={{ fontSize: '0.85em', color: '#666' }}>
                        {inc.type ? inc.type.code : ''}
                      </span>
                  </td>
                  <td>
                     {inc.affectedVessels && inc.affectedVessels.length > 0 ? (
                        inc.affectedVessels.map((v, idx) => (
                            <div key={idx} className="vessel-tag">🚢 {v.name}</div>
                        ))
                     ) : (
                        <span style={{ color: '#999', fontStyle: 'italic' }}>Global Port Issue</span>
                     )}
                  </td>
                  <td style={{ color: '#c0392b', fontWeight: 'bold' }}>{formatDate(inc.startTime)}</td>
                  <td className="truncate-cell" title={inc.description}>
                      {inc.description || '-'}
                  </td>
                  <td style={{ fontSize: '0.9em' }}>{inc.createdBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
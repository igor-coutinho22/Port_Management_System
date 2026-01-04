console.log("IncidentsHubPage.jsx is loading...");

const IncidentsHubPage = () => {
  // --- STATE ---
  const [expandedSection, setExpandedSection] = React.useState(null);
  const [incidentsList, setIncidentsList] = React.useState([]); // Renamed from activeIncidents
  const [isLoading, setIsLoading] = React.useState(false);
  const [showQuickView, setShowQuickView] = React.useState(false);

  // --- ACTIONS ---
  
  const toggleSection = (sectionName) => {
    setExpandedSection(expandedSection === sectionName ? null : sectionName);
  };

  // CHANGED: Load ALL incidents (both Active and Resolved)
  const loadAllIncidents = async () => {
    setIsLoading(true);
    try {
      // Empty object {} means no filters -> Get All
      const data = await apiService.searchIncidents({});
      // Optional: Sort by date descending (newest first) if backend doesn't already
      const sorted = (data || []).sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      setIncidentsList(sorted);
    } catch (error) {
      console.error("Error loading incidents:", error);
      setIncidentsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh when opening the Quick View
  React.useEffect(() => {
    if (showQuickView) {
      loadAllIncidents();
    }
  }, [showQuickView]);

  // --- SECTIONS CONFIGURATION ---
  const sections = [
    {
      id: "create",
      title: "Report New Incident",
      description: "Log a new operational disruption and link it to a vessel.",
      color: "#27ae60",
      component: "CreateIncidentForm",
    },
    {
      id: "resolve",
      title: "Resolve / Update Incident",
      description: "Mark an incident as resolved or update its details.",
      color: "#f39c12",
      component: "UpdateIncidentForm",
    },
    {
      id: "search",
      title: "Search & History",
      description: "Find past incidents by Date, Vessel, or Severity.",
      color: "#6f42c1",
      component: "SearchIncidentsForm",
    },
    {
      id: "getById",
      title: "Get Incident by ID",
      description: "Retrieve full details of a specific incident using its ID.",
      color: "#17a2b8",
      component: "GetIncidentByIdForm",
    },
    {
      id: "delete",
      title: "Delete Incident",
      description: "Permanently remove an incident from the system.",
      color: "#c0392b",
      component: "DeleteIncidentForm",
    }
  ];

  return (
    <div className="page-section">
      <div className="hub-header">
        <h2 className="page-title">Operational Incidents Control</h2>
        <p>
          Monitor and report real-time disruptions affecting port operations.
        </p>
      </div>

      {/* --- QUICK VIEW: INCIDENTS LOG --- */}
      <div className="quick-view-container">
        <button
          className={`quick-view-btn ${showQuickView ? "active" : ""}`}
          onClick={() => setShowQuickView(!showQuickView)}
          // Removed red border logic since it's not just "Alarms" anymore
        >
          <span className="quick-view-icon">📋</span>
          View Incidents Log
          <span className={`quick-view-arrow ${showQuickView ? "up" : "down"}`}>
            {showQuickView ? "▲" : "▼"}
          </span>
        </button>

        {showQuickView && (
          <div className="quick-view-panel">
            {isLoading ? (
              <div className="loading">Loading incidents log...</div>
            ) : (
              <IncidentsQuickTable
                incidents={incidentsList}
                onRefresh={loadAllIncidents}
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
                     <CreateIncidentForm onSuccess={loadAllIncidents} />
                  )}
                  {section.component === "UpdateIncidentForm" && (
                     <UpdateIncidentForm onSuccess={loadAllIncidents} />
                  )}
                  {section.component === "SearchIncidentsForm" && (
                     <SearchIncidentsForm />
                  )}
                  {section.component === "GetIncidentByIdForm" && (
                     <GetIncidentByIdForm />
                  )}
                  {section.component === "DeleteIncidentForm" && (
                     <DeleteIncidentForm onSuccess={loadAllIncidents} />
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

// --- SUB-COMPONENT: GENERAL TABLE ---
const IncidentsQuickTable = ({ incidents, onRefresh }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString([], { 
      month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' 
    });
  };

  return (
    <div className="quick-table-container">
      <div className="quick-table-header">
        {/* Changed Header Title and Color to be more neutral */}
        <h4>📋 Recent Incidents Log ({incidents.length})</h4>
        <button className="refresh-btn" onClick={onRefresh}>🔄 Refresh</button>
      </div>
      
      {incidents.length === 0 ? (
        <div className="no-data" style={{ padding: '20px' }}>
          <h3>No Data</h3>
          <p>No incidents have been recorded yet.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table quick-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Severity</th>
                <th>Type</th>
                <th>Affected Vessel</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Description</th>
                <th>Author</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr key={inc.id} style={{ backgroundColor: inc.severity === 'Critical' && inc.status === 'Active' ? '#fff5f5' : 'inherit' }}>
                  
                  {/* ID Cell */}
                  <td className="id-cell" title={inc.id}>
                      {inc.id}
                  </td>

                  {/* Status Cell - Dynamic Color */}
                  <td>
                    <span 
                        className="status-badge" 
                        style={{
                            backgroundColor: inc.status === 'Resolved' ? '#28a745' : '#dc3545' 
                        }}
                    >
                        {inc.status}
                    </span>
                  </td>

                  {/* Severity Cell */}
                  <td>
                    <span className={`status-badge status-${(inc.severity || 'minor').toLowerCase()}`}>
                      {inc.severity}
                    </span>
                  </td>

                  {/* Type Cell */}
                  <td>
                      <strong style={{ display: 'block' }}>{inc.type ? inc.type.name : 'Unknown'}</strong>
                      <span className="monospace-input" style={{ fontSize: '0.85em', color: '#666' }}>
                        {inc.type ? inc.type.code : ''}
                      </span>
                  </td>

                  {/* Vessel Cell */}
                  <td>
                     {inc.affectedVessels && inc.affectedVessels.length > 0 ? (
                        inc.affectedVessels.map((v, idx) => (
                            <div key={idx} className="vessel-tag">🚢 {v.name}</div>
                        ))
                     ) : (
                        <span style={{ color: '#999', fontStyle: 'italic' }}>Global Port Issue</span>
                     )}
                  </td>

                  {/* Start Time */}
                  <td style={{ fontWeight: 'bold' }}>{formatDate(inc.startTime)}</td>
                  
                  {/* End Time */}
                  <td style={{ color: inc.endTime ? '#28a745' : '#999' }}>
                      {formatDate(inc.endTime)}
                  </td>

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
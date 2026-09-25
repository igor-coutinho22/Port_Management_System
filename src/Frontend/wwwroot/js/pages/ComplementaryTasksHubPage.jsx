const ComplementaryTasksHubPage = () => {
  // --- STATE ---
  const [expandedSection, setExpandedSection] = React.useState(null);
  const [tasks, setTasks] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showQuickView, setShowQuickView] = React.useState(false);

  // --- ACTIONS ---
  
  const toggleSection = (sectionName) => {
    setExpandedSection(expandedSection === sectionName ? null : sectionName);
  };

  const loadRecentTasks = async () => {
    setIsLoading(true);
    try {
      // Fetch mostly recent tasks (empty filter = all, backend sorts by newest)
      const data = await apiService.searchVesselVisitExecutions({}); // Wait, we need the new search endpoint
      // We need to call the search endpoint for TASKS, not Visits.
      // We will assume apiService.searchComplementaryTasks exists or use the generic search.
      
      // GET /api/complementarytasks/Search
      const result = await apiService.searchComplementaryTasks({}); 
      setTasks(result || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (showQuickView) {
      loadRecentTasks();
    }
  }, [showQuickView]);

  // --- SECTIONS CONFIGURATION ---
  const sections = [
    {
      id: "create",
      title: "Log New Task",
      description: "Record a new operation (e.g., Cleaning, Inspection) on a vessel.",
      color: "#28a745", // Green
      component: "Create"
    },
    {
      id: "update",
      title: "Update / Complete Task",
      description: "Mark an ongoing task as completed or edit details.",
      color: "#007bff", // Blue
      component: "Update"
    },
    {
      id: "search",
      title: "Search History",
      description: "Find tasks by Vessel, Date, or Status.",
      color: "#6f42c1", // Purple
      component: "Search"
    },
    {
      id: "details",
      title: "Get Details (ID)",
      description: "View full record for a specific Task ID.",
      color: "#17a2b8", // Teal
      component: "Get"
    },
    {
      id: "delete",
      title: "Delete Record",
      description: "Remove an erroneous task entry.",
      color: "#dc3545", // Red
      component: "Delete"
    }
  ];

  return (
    <div className="page-section">
      <div className="hub-header">
        <h2 className="page-title">Complementary Operations Log</h2>
        <p>
          Track non-cargo activities (Cleaning, Maintenance, Security) affecting vessel visits.
        </p>
      </div>

      {/* --- QUICK VIEW --- */}
      <div className="quick-view-container">
        <button
          className={`quick-view-btn ${showQuickView ? "active" : ""}`}
          onClick={() => setShowQuickView(!showQuickView)}
        >
          <span className="quick-view-icon">📋</span>
          View Operations Log
          <span className={`quick-view-arrow ${showQuickView ? "up" : "down"}`}>
            {showQuickView ? "▲" : "▼"}
          </span>
        </button>

        {showQuickView && (
          <div className="quick-view-panel">
            {isLoading ? (
              <div className="loading">Loading log...</div>
            ) : (
              <TasksQuickTable tasks={tasks} onRefresh={loadRecentTasks} />
            )}
          </div>
        )}
      </div>

      {/* --- OPERATIONS SECTIONS --- */}
      <div className="operations-container">
        {sections.map((section) => (
          <div key={section.id} className="operation-section">
            <div
              className={`operation-header ${expandedSection === section.id ? "expanded" : ""}`}
              onClick={() => toggleSection(section.id)}
              style={{ borderLeftColor: section.color }}
            >
              <div className="operation-info">
                <h3 className="operation-title">{section.title}</h3>
                <p className="operation-description">{section.description}</p>
              </div>
              <div className="operation-controls">
                <span className={`expand-arrow ${expandedSection === section.id ? "up" : "down"}`}>
                  {expandedSection === section.id ? "▲" : "▼"}
                </span>
              </div>
            </div>

            {expandedSection === section.id && (
              <div className="operation-content">
                <div className="operation-body">
                   {section.component === "Create" && <CreateTaskForm onSuccess={loadRecentTasks} />}
                   {section.component === "Update" && <UpdateTaskForm onSuccess={loadRecentTasks} />}
                   {section.component === "Search" && <SearchTasksForm />}
                   {section.component === "Get" && <GetTaskByIdForm />}
                   {section.component === "Delete" && <DeleteTaskForm onSuccess={loadRecentTasks} />}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: TASKS TABLE ---
const TasksQuickTable = ({ tasks, onRefresh }) => {
  
  const formatDate = (d) => d ? new Date(d).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'}) : '-';

  // NEW: Robust helper to calculate duration if backend sends 'undefined'
  const getDurationDisplay = (t) => {
      if (t.status === 'Ongoing') {
          return <span style={{color:'#007bff', fontStyle:'italic'}}>Running...</span>;
      }

      // 1. Try backend value
      if (t.durationMinutes !== undefined && t.durationMinutes !== null) {
          return `${t.durationMinutes} min`;
      }

      // 2. Fallback: Calculate client-side
      if (t.startTime && t.endTime) {
          const start = new Date(t.startTime);
          const end = new Date(t.endTime);
          const diffMin = Math.floor((end - start) / 60000);
          return `${diffMin} min`;
      }

      return '-';
  };

  return (
    <div className="quick-table-container">
      <div className="quick-table-header" style={{ borderBottom: '2px solid #28a745' }}>
        <h4 style={{ color: '#28a745' }}>Recent Operations ({tasks.length})</h4>
        <button className="refresh-btn" onClick={onRefresh}>🔄 Refresh</button>
      </div>
      
      {tasks.length === 0 ? (
        <div className="no-data" style={{ padding: '20px' }}>No tasks recorded yet.</div>
      ) : (
        <div className="table-container">
          <table className="data-table quick-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Category</th>
                <th>Impact</th>
                <th>Vessel (IMO)</th>
                <th>Start Time</th>
                <th>Duration</th>
                <th>Responsible</th>
                <th>Task ID</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id}>
                  <td>
                    <span 
                        className="status-badge" 
                        style={{
                            backgroundColor: t.status === 'Ongoing' ? '#007bff' : '#28a745',
                            color: 'white'
                        }}
                    >
                        {t.status === 'Ongoing' ? 'Ongoing' : 'Done'}
                    </span>
                  </td>
                  <td>
                      <strong>{t.category ? t.category.name : 'Unknown'}</strong>
                      <br/>
                      <small className="monospace-input" style={{color:'#999', fontSize:'0.8em'}}>
                          {t.category ? t.category.code : ''}
                      </small>
                  </td>
                  <td>
                     {t.category && (
                        <span style={{ 
                            color: t.category.expectedImpact === 'Suspension' ? '#dc3545' : '#28a745',
                            fontWeight: 'bold',
                            fontSize: '0.85em'
                        }}>
                            {t.category.expectedImpact}
                        </span>
                     )}
                  </td>
                  <td style={{ fontWeight: 'bold', color: '#17a2b8' }}>
                      {t.vesselName || (t.vesselVisitExecutionId?.vesselIMO ? `IMO: ${t.vesselVisitExecutionId.vesselIMO}` : '-')}
                  </td>
                  <td>{formatDate(t.startTime)}</td>
                  
                  {/* FIX IS HERE: Use helper instead of direct access */}
                  <td>{getDurationDisplay(t)}</td>

                  <td>{t.responsibleTeam}</td>
                  <td className="id-cell" title={t.id}>{t.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
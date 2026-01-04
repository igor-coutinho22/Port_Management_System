console.log("VesselVisitExecutionHubPage.jsx is loading...");

const VesselVisitExecutionHubPage = () => {
  // State management
  const [expandedSection, setExpandedSection] = React.useState(null);
  const [executions, setExecutions] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showQuickView, setShowQuickView] = React.useState(false);

  // Toggle section expansion
  const toggleSection = (sectionName) => {
    setExpandedSection(expandedSection === sectionName ? null : sectionName);
  };

  // Load all executions for quick view
  const loadExecutions = async () => {
    setIsLoading(true);
    try {
      // Ensure this method exists in your apiService
      const data = await apiService.getVesselVisitExecutions();
      setExecutions(data || []);
    } catch (error) {
      console.error("Error loading executions:", error);
      setExecutions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh quick view when opened
  React.useEffect(() => {
    if (showQuickView) {
      loadExecutions();
    }
  }, [showQuickView]);

  // Define the hub sections
  const sections = [
    {
      id: "create",
      title: "Start Vessel Visit Execution",
      description:
        "Record the actual arrival of a vessel and start the execution phase.",
      color: "#27ae60", // Green (POST)
      component: "CreateVesselVisitExecutionForm",
    },
    {
      id: "update",
      title: "Update Execution Details",
      description: "Update actual berth time and assigned dock.",
      color: "#f39c12", // Orange (PUT)
      component: "UpdateVesselVisitExecutionForm",
    },
    {
      id: "complete",
      title: "Complete Visit",
      description: "Record departure times and close the visit lifecycle.",
      color: "#28a745", // Green
      component: "CompleteVesselVisitExecutionForm",
    },
    {
      id: "getById",
      title: "Get Execution By ID",
      description: "Retrieve details of a specific execution record.",
      color: "#2980b9", // Blue (GET)
      component: "GetVesselVisitExecutionByIdForm",
    },
    {
      id: "search",
      title: "Search & Analyze History",
      description:
        "Filter history by vessel or date and view performance metrics.",
      color: "#6f42c1", // Purple
      component: "SearchVesselVisitExecutionsForm",
    },
    {
      id: "delete",
      title: "Delete Execution",
      description: "Remove an execution record from the system.",
      color: "#c0392b", // Red (DELETE)
      component: "DeleteVesselVisitExecutionForm",
    },
  ];

  return (
    <div className="page-section">
      <div className="hub-header">
        <h2 className="page-title">Vessel Visit Executions Management</h2>
        <p>
          Manage the execution phase of vessel visits, tracking actual arrival
          times, docking, and operation status.
        </p>
      </div>

      {/* Quick Data View Button */}
      <div className="quick-view-container">
        <button
          className={`quick-view-btn ${showQuickView ? "active" : ""}`}
          onClick={() => setShowQuickView(!showQuickView)}
        >
          <span className="quick-view-icon">📊</span>
          Quick Data View
          <span className={`quick-view-arrow ${showQuickView ? "up" : "down"}`}>
            {showQuickView ? "▲" : "▼"}
          </span>
        </button>

        {showQuickView && (
          <div className="quick-view-panel">
            {isLoading ? (
              <div className="loading">Loading data...</div>
            ) : (
              <VesselVisitExecutionsQuickTable
                executions={executions}
                onRefresh={loadExecutions}
              />
            )}
          </div>
        )}
      </div>

      {/* Swagger-style Expandable Sections */}
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
                  {section.id === "create"
                    ? "POST"
                    : section.id === "update"
                    ? "PUT"
                    : section.id === "delete"
                    ? "DELETE"
                    : "GET"}
                </span>
                <span
                  className={`expand-arrow ${
                    expandedSection === section.id ? "up" : "down"
                  }`}
                >
                  {expandedSection === section.id ? "▲" : "▼"}
                </span>
              </div>
            </div>

            {expandedSection === section.id && (
              <div className="operation-content">
                <div className="operation-body">
                  {/* Render Forms */}
                  {section.component === "CreateVesselVisitExecutionForm" &&
                    (typeof CreateVesselVisitExecutionForm !== "undefined" ? (
                      <CreateVesselVisitExecutionForm
                        onSuccess={loadExecutions}
                      />
                    ) : (
                      <div>
                        Component CreateVesselVisitExecutionForm not found
                      </div>
                    ))}

                  {/* NEW UPDATE FORM */}
                  {section.component === "UpdateVesselVisitExecutionForm" &&
                    (typeof UpdateVesselVisitExecutionForm !== "undefined" ? (
                      <UpdateVesselVisitExecutionForm
                        onSuccess={loadExecutions}
                      />
                    ) : (
                      <div>
                        Component UpdateVesselVisitExecutionForm not found
                      </div>
                    ))}
                  {section.component === "CompleteVesselVisitExecutionForm" &&
                    (typeof CompleteVesselVisitExecutionForm !== "undefined" ? (
                      <CompleteVesselVisitExecutionForm
                        onSuccess={loadExecutions}
                      />
                    ) : (
                      <div>
                        Component CompleteVesselVisitExecutionForm not found
                      </div>
                    ))}
                  {section.component === "GetVesselVisitExecutionByIdForm" &&
                    (typeof GetVesselVisitExecutionByIdForm !== "undefined" ? (
                      <GetVesselVisitExecutionByIdForm />
                    ) : (
                      <div>
                        Component GetVesselVisitExecutionByIdForm not found
                      </div>
                    ))}
                  {section.component === "SearchVesselVisitExecutionsForm" &&
                    (typeof SearchVesselVisitExecutionsForm !== "undefined" ? (
                      <SearchVesselVisitExecutionsForm />
                    ) : (
                      <div>
                        Component SearchVesselVisitExecutionsForm not found
                      </div>
                    ))}
                  {section.component === "DeleteVesselVisitExecutionForm" &&
                    (typeof DeleteVesselVisitExecutionForm !== "undefined" ? (
                      <DeleteVesselVisitExecutionForm
                        onSuccess={loadExecutions}
                      />
                    ) : (
                      <div>
                        Component DeleteVesselVisitExecutionForm not found
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Quick Table Component for Vessel Visit Executions Data
const VesselVisitExecutionsQuickTable = ({ executions, onRefresh }) => {
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="quick-table-container">
      <div className="quick-table-header">
        <h4>Executions Overview ({executions.length} total)</h4>
        <button className="refresh-btn" onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>
      {executions.length === 0 ? (
        <div className="no-data">
          <h3>No Executions Found</h3>
          <p>
            There are currently no recorded vessel visit executions in the
            system.
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table quick-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vessel Visit ID</th>
                <th>Vessel IMO</th>
                <th>Arrival</th>
                <th>Berth Time</th> {/* New Column */}
                <th>Dock ID</th> {/* New Column */}
                <th>Status</th>
                <th>Warnings</th> {/* New Column for Discrepancies */}
              </tr>
            </thead>
            <tbody>
              {executions.map((e) => (
                <tr key={e.id}>
                  <td className="id-cell" title={e.id}>
                    {e.id || "N/A"}
                  </td>
                  <td className="id-cell" title={e.vesselVisitId}>
                    {e.vesselVisitId || "N/A"}
                  </td>
                  <td>{e.vesselIMO || "N/A"}</td>
                  <td>{formatDate(e.actualArrivalTime)}</td>

                  {/* New Data Fields */}
                  <td>{formatDate(e.berthTime)}</td>
                  <td className="id-cell" title={e.dockId}>
                    {e.dockId || "-"}
                  </td>

                  <td>
                    <span
                      className={`status-badge status-${(e.status || "unknown")
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {e.status || "N/A"}
                    </span>
                  </td>

                  {/* Discrepancy / Warnings */}
                  <td>
                    {e.discrepancy ? (
                      <span
                        title={e.discrepancy}
                        style={{ cursor: "help", fontSize: "1.2em" }}
                      >
                        ⚠️
                      </span>
                    ) : (
                      <span style={{ color: "#27ae60" }}>✔</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

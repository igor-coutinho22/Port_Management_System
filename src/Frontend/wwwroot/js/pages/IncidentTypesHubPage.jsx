console.log("IncidentTypesHubPage.jsx is loading...");

const IncidentTypesHubPage = () => {
  // State management
  const [expandedSection, setExpandedSection] = React.useState(null);
  const [types, setTypes] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showQuickView, setShowQuickView] = React.useState(false);

  // Toggle section expansion
  const toggleSection = (sectionName) => {
    setExpandedSection(expandedSection === sectionName ? null : sectionName);
  };

  // Load all incident types for quick view
  const loadTypes = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getAllIncidentTypes();
      setTypes(data || []);
    } catch (error) {
      console.error("Error loading incident types:", error);
      setTypes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh quick view when opened
  React.useEffect(() => {
    if (showQuickView) {
      loadTypes();
    }
  }, [showQuickView]);

  // Define the hub sections
  const sections = [
    {
      id: "create",
      title: "Create Incident Type",
      description: "Define a new standard incident type (e.g., 'FOG-01').",
      color: "#27ae60", // Green (POST)
      component: "CreateIncidentTypeForm",
    },
    {
      id: "update",
      title: "Update Incident Type",
      description: "Modify the name, description, or severity of an existing type.",
      color: "#f39c12", // Orange (PUT)
      component: "UpdateIncidentTypeForm",
    },
    {
      id: "getById",
      title: "Get Incident Type By ID",
      description: "Retrieve details of a specific incident type definition.",
      color: "#2980b9", // Blue (GET)
      component: "GetIncidentTypeByIdForm",
    },
    {
      id: "delete",
      title: "Delete Incident Type",
      description: "Remove an incident type from the catalog.",
      color: "#c0392b", // Red (DELETE)
      component: "DeleteIncidentTypeForm",
    },
  ];

  return (
    <div className="page-section">
      <div className="hub-header">
        <h2 className="page-title">Incident Types Management</h2>
        <p>
          Manage the catalog of operational disruptions. 
          Define standard codes and severities for consistent reporting.
        </p>
      </div>

      {/* Quick Data View Button */}
      <div className="quick-view-container">
        <button
          className={`quick-view-btn ${showQuickView ? "active" : ""}`}
          onClick={() => setShowQuickView(!showQuickView)}
        >
          <span className="quick-view-icon">📋</span>
          Catalog Quick View
          <span className={`quick-view-arrow ${showQuickView ? "up" : "down"}`}>
            {showQuickView ? "▲" : "▼"}
          </span>
        </button>

        {showQuickView && (
          <div className="quick-view-panel">
            {isLoading ? (
              <div className="loading">Loading catalog...</div>
            ) : (
              <IncidentTypesQuickTable
                types={types}
                onRefresh={loadTypes}
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
                  {/* Conditional Rendering of Forms */}
                  {section.component === "CreateIncidentTypeForm" && (
                     <CreateIncidentTypeForm onSuccess={loadTypes} />
                  )}
                  {section.component === "UpdateIncidentTypeForm" && (
                     <UpdateIncidentTypeForm onSuccess={loadTypes} />
                  )}
                  {section.component === "GetIncidentTypeByIdForm" && (
                     <GetIncidentTypeByIdForm />
                  )}
                  {section.component === "DeleteIncidentTypeForm" && (
                     <DeleteIncidentTypeForm onSuccess={loadTypes} />
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

// Quick Table Component for Incident Types Data
const IncidentTypesQuickTable = ({ types, onRefresh }) => {
  return (
    <div className="quick-table-container">
      <div className="quick-table-header">
        <h4>Catalog Overview ({types.length} total)</h4>
        <button className="refresh-btn" onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>
      {types.length === 0 ? (
        <div className="no-data">
          <h3>No Incident Types Found</h3>
          <p>The catalog is empty. Start by creating a new Type.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table quick-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Severity</th>
                <th>ID (System)</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 'bold', color: '#2c3e50' }}>{t.code}</td>
                  <td>{t.name}</td>
                  <td>
                    <span
                      className={`status-badge status-${(t.severity || "minor").toLowerCase()}`}
                    >
                      {t.severity}
                    </span>
                  </td>
                  <td className="id-cell" title={t.id}>
                    {t.id}
                  </td>
                  <td className="truncate-cell" title={t.description}>
                      {t.description || '-'}
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
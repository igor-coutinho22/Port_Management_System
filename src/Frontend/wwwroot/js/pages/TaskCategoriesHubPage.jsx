const TaskCategoriesHubPage = () => {
  // --- STATE ---
  const [expandedSection, setExpandedSection] = React.useState(null);
  const [categories, setCategories] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showQuickView, setShowQuickView] = React.useState(false);

  // --- ACTIONS ---
  
  const toggleSection = (sectionName) => {
    setExpandedSection(expandedSection === sectionName ? null : sectionName);
  };

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getAllCategories();
      // Sort by Name alphabetically
      const sorted = (data || []).sort((a, b) => a.name.localeCompare(b.name));
      setCategories(sorted);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (showQuickView) {
      loadCategories();
    }
  }, [showQuickView]);

  // --- SECTIONS CONFIGURATION ---
  const sections = [
    {
      id: "create",
      title: "Define New Category",
      description: "Create a new type of task (e.g., 'Hull Inspection').",
      color: "#17a2b8", // Teal
      component: "Create"
    },
    {
      id: "update",
      title: "Update Definitions",
      description: "Modify description, duration, or impact of existing tasks.",
      color: "#fd7e14", // Orange
      component: "Update"
    },
    {
      id: "search",
      title: "Search Catalog",
      description: "Find specific categories by Code or Name.",
      color: "#6f42c1", // Purple
      component: "Search"
    },
    {
      id: "details",
      title: "Get Details (ID)",
      description: "View full system record for a specific ID.",
      color: "#0d6efd", // Blue
      component: "Get"
    },
    {
      id: "delete",
      title: "Remove Category",
      description: "Delete a task definition from the catalog.",
      color: "#dc3545", // Red
      component: "Delete"
    }
  ];

  return (
    <div className="page-section">
      <div className="hub-header">
        <h2 className="page-title">Task Categories Management</h2>
        <p>
          Manage the catalog of non-cargo operations. 
          These definitions populate the "Complementary Tasks" menu.
        </p>
      </div>

      {/* --- QUICK VIEW --- */}
      <div className="quick-view-container">
        <button
          className={`quick-view-btn ${showQuickView ? "active" : ""}`}
          onClick={() => setShowQuickView(!showQuickView)}
          style={{ borderColor: showQuickView ? '#17a2b8' : '' }}
        >
          <span className="quick-view-icon">📚</span>
          View Full Catalog
          <span className={`quick-view-arrow ${showQuickView ? "up" : "down"}`}>
            {showQuickView ? "▲" : "▼"}
          </span>
        </button>

        {showQuickView && (
          <div className="quick-view-panel">
            {isLoading ? (
              <div className="loading">Loading catalog...</div>
            ) : (
              <CategoriesQuickTable categories={categories} onRefresh={loadCategories} />
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
                  {section.component === "Create" && <CreateTaskCategoryForm onSuccess={loadCategories} />}
                  {section.component === "Update" && <UpdateTaskCategoryForm onSuccess={loadCategories} />}
                  {section.component === "Search" && <SearchTaskCategoriesForm />}
                  {section.component === "Get" && <GetCategoryByIdForm />}
                  {section.component === "Delete" && <DeleteTaskCategoryForm onSuccess={loadCategories} />}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: CATALOG TABLE ---
const CategoriesQuickTable = ({ categories, onRefresh }) => {
  return (
    <div className="quick-table-container">
      <div className="quick-table-header" style={{ borderBottom: '2px solid #17a2b8' }}>
        <h4 style={{ color: '#17a2b8' }}>Catalog Definitions ({categories.length})</h4>
        <button className="refresh-btn" onClick={onRefresh}>🔄 Refresh</button>
      </div>
      
      {categories.length === 0 ? (
        <div className="no-data" style={{ padding: '20px' }}>
          No categories defined.
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table quick-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Impact</th>
                <th>Avg. Duration</th>
                <th>Description</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  
                  {/* FIX: Removed 'monospace-input' class to restore padding. 
                      Applied font-family directly via style. */}
                  <td style={{ 
                      fontWeight: 'bold', 
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                      color: '#17a2b8' /* Optional: Matches the Hub theme */
                  }}>
                    {cat.code}
                  </td>

                  <td>{cat.name}</td>
                  <td>
                    <span 
                        className="status-badge" 
                        style={{
                            backgroundColor: cat.expectedImpact === 'Suspension' ? '#dc3545' : '#28a745',
                            color: 'white'
                        }}
                    >
                        {cat.expectedImpact}
                    </span>
                  </td>
                  <td>{cat.defaultDuration > 0 ? `${cat.defaultDuration} min` : '-'}</td>
                  <td className="truncate-cell">{cat.description || '-'}</td>
                  <td className="id-cell" title={cat.id}>{cat.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
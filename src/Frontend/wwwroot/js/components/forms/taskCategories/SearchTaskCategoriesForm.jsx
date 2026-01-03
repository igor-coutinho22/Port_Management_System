const SearchTaskCategoriesForm = () => {
    // --- STATE ---
    const [categories, setCategories] = React.useState([]);
    const [filteredResults, setFilteredResults] = React.useState([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // --- LOAD DATA ---
    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await apiService.getAllCategories();
            const sorted = (data || []).sort((a, b) => a.name.localeCompare(b.name));
            setCategories(sorted);
            setFilteredResults(sorted); // Initially show all
        } catch (error) {
            console.error("Failed to load catalog", error);
            setMessage({ type: 'error', text: 'Failed to load category list.' });
        } finally {
            setLoading(false);
        }
    };

    // --- FILTER LOGIC ---
    React.useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredResults(categories);
            return;
        }
        
        const lowerTerm = searchTerm.toLowerCase();
        const results = categories.filter(c => 
            c.name.toLowerCase().includes(lowerTerm) ||
            c.code.toLowerCase().includes(lowerTerm)
        );
        setFilteredResults(results);
    }, [searchTerm, categories]);

    // --- HANDLER ---
    const handleClear = () => {
        setSearchTerm('');
    };

    return (
        <div className="form-container" style={{ borderTop: '4px solid #6f42c1' }}>
            <div className="form-header">
                <h4 style={{ color: '#6f42c1' }}>Search Catalog</h4>
                <p>Filter defined categories by Name or Code.</p>
            </div>

            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            <div className="search-form">
                <div className="form-group full-width" style={{ position: 'relative' }}>
                    <input 
                        type="text" 
                        placeholder="Type Code or Name to filter..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        style={{ paddingRight: '80px' }} // Space for clear button
                    />
                    {searchTerm && (
                        <button 
                            onClick={handleClear}
                            style={{
                                position: 'absolute',
                                right: '10px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'transparent',
                                border: 'none',
                                color: '#666',
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }}
                        >
                            ✕ Clear
                        </button>
                    )}
                </div>
            </div>

            <div className="table-container fade-in" style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '10px' }}>
                {loading ? (
                    <div className="loading">Loading catalog...</div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Impact</th>
                                <th>Duration</th>
                                <th>System ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredResults.length > 0 ? (
                                filteredResults.map(c => (
                                    <tr key={c.id}>
                                        <td className="monospace-input" style={{ fontWeight: 'bold' }}>
                                            {c.code}
                                        </td>
                                        <td>{c.name}</td>
                                        <td>
                                            <span 
                                                className="status-badge" 
                                                style={{
                                                    backgroundColor: c.expectedImpact === 'Suspension' ? '#dc3545' : '#28a745',
                                                    color: 'white'
                                                }}
                                            >
                                                {c.expectedImpact}
                                            </span>
                                        </td>
                                        <td>{c.defaultDuration > 0 ? `${c.defaultDuration}m` : '-'}</td>
                                        <td className="id-cell" title={c.id}>{c.id}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                        No categories match "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
            
            <div style={{ marginTop: '10px', fontSize: '0.85em', color: '#666', textAlign: 'right' }}>
                Showing {filteredResults.length} of {categories.length} records
            </div>
        </div>
    );
};
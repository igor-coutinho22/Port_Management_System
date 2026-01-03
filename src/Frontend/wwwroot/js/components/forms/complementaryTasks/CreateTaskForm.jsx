const CreateTaskForm = ({ onSuccess }) => {
    // --- STATE ---
    const [categories, setCategories] = React.useState([]);
    const [visits, setVisits] = React.useState([]);
    
    const [formData, setFormData] = React.useState({
        vesselVisitExecutionId: '',
        complementaryTaskCategoryId: '',
        responsibleTeam: '',
        startTime: ''
    });

    const [isLoadingData, setIsLoadingData] = React.useState(false);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    // --- INITIAL DATA LOADING ---
    React.useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoadingData(true);
        try {
            // 1. Fetch Categories
            const cats = await apiService.getAllCategories();
            setCategories(cats || []);

            // 2. Fetch Vessel Visits
            const allVisits = await apiService.getVesselVisitExecutions();
            
            // FILTER: Only show Active visits
            const activeVisits = (allVisits || [])
                .filter(v => v.status !== 'Completed' && v.status !== 'Departed') 
                .sort((a, b) => new Date(b.expectedArrival) - new Date(a.expectedArrival));
            
            setVisits(activeVisits);

            // Default Start Time: Now
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            setFormData(prev => ({ ...prev, startTime: now.toISOString().slice(0, 16) }));

        } catch (error) {
            console.error("Failed to load dropdown data", error);
            setMessage({ type: 'error', text: 'Failed to load selection lists.' });
        } finally {
            setIsLoadingData(false);
        }
    };

    // --- HANDLERS ---
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.vesselVisitExecutionId || !formData.complementaryTaskCategoryId) {
            setMessage({ type: 'error', text: 'Please select both a Vessel and a Category.' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        try {
            await apiService.createTask(formData);
            setMessage({ type: 'success', text: 'Task logged successfully!' });
            
            // Reset fields
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            
            setFormData({
                vesselVisitExecutionId: '',
                complementaryTaskCategoryId: '',
                responsibleTeam: '',
                startTime: now.toISOString().slice(0, 16)
            });

            if (onSuccess) onSuccess();

        } catch (error) {
            console.error(error);
            const serverMsg = error.response?.data || error.message || 'Create failed.';
            setMessage({ type: 'error', text: serverMsg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="form-container" style={{ borderTop: '4px solid #28a745' }}>
            <div className="form-header">
                <h4 style={{ color: '#28a745' }}>Log New Task</h4>
                <p>Record a complementary operation for a specific vessel.</p>
            </div>

            {message.text && <div className={`message ${message.type}`}>{message.text}</div>}

            {isLoadingData ? (
                <div className="loading">Loading selection lists...</div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        
                        {/* 1. VESSEL SELECTION (IMO ONLY) */}
                        <div className="form-group full-width">
                            <label>Vessel Visit <span className="required">*</span></label>
                            <select 
                                name="vesselVisitExecutionId" 
                                value={formData.vesselVisitExecutionId} 
                                onChange={handleChange} 
                                className="form-input"
                                required
                            >
                                <option value="">-- Select Active Vessel --</option>
                                {visits.map(v => (
                                    <option key={v.id} value={v.id}>
                                        {/* CLEANER DISPLAY: Just IMO and Status */}
                                        Vessel (IMO: {v.vesselIMO}) {v.status ? ` - [${v.status}]` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 2. CATEGORY SELECTION */}
                        <div className="form-group">
                            <label>Operation Type <span className="required">*</span></label>
                            <select 
                                name="complementaryTaskCategoryId" 
                                value={formData.complementaryTaskCategoryId} 
                                onChange={handleChange} 
                                className="form-input"
                                required
                            >
                                <option value="">-- Select Category --</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.code} - {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 3. RESPONSIBLE TEAM */}
                        <div className="form-group">
                            <label>Responsible Team <span className="required">*</span></label>
                            <input 
                                type="text" 
                                name="responsibleTeam" 
                                value={formData.responsibleTeam} 
                                onChange={handleChange} 
                                className="form-input" 
                                placeholder="e.g. Unit Team 01"
                                required 
                            />
                        </div>

                        {/* 4. START TIME */}
                        <div className="form-group">
                            <label>Start Time <span className="required">*</span></label>
                            <input 
                                type="datetime-local" 
                                name="startTime" 
                                value={formData.startTime} 
                                onChange={handleChange} 
                                className="form-input"
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="submit-btn" 
                            disabled={isSubmitting} 
                            style={{backgroundColor: '#28a745'}}
                        >
                            {isSubmitting ? 'Logging...' : '✅ Start Task'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};
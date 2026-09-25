// Remove Qualification From Staff Form Component

const RemoveQualificationFromStaffForm = ({ onSuccess }) => {
    const [number, setNumber] = React.useState('');
    const [qualifications, setQualifications] = React.useState([]);
    const [selectedQualification, setSelectedQualification] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        setNumber(e.target.value);
        setMessage({ type: '', text: '' });
    };

    const handleNumberBlur = async () => {
        if (!number.trim()) return;
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            // Fetch staff to get their qualifications
            const staff = await apiService.getStaffById(number.trim());
            setQualifications(staff.qualifications || []);
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to load staff qualifications.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectChange = (e) => {
        setSelectedQualification(e.target.value);
    };

    const handleRemoveQualification = async (e) => {
        e.preventDefault();
        if (!number.trim()) {
            setMessage({ type: 'error', text: 'Mecanographic number is required' });
            return;
        }
        if (!selectedQualification) {
            setMessage({ type: 'error', text: 'Please select a qualification to remove.' });
            return;
        }
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            await apiService.removeQualificationFromStaff(number.trim(), selectedQualification);
            setMessage({ type: 'success', text: `Qualification removed from staff ${number.trim()} successfully.` });
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (error) {
            if (error.message && error.message.toLowerCase().includes('not found')) {
                setMessage({ type: 'info', text: `Staff with number ${number.trim()} not found.` });
            } else {
                setMessage({ type: 'error', text: 'Failed to remove qualification. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        setNumber('');
        setQualifications([]);
        setSelectedQualification('');
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Remove Qualification from Staff</h4>
                <p>Enter the staff member's mecanographic number and select a qualification to remove</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleRemoveQualification} className="search-form">
                <div className="form-group">
                    <label htmlFor="removeQualificationMecanographicNumber">Mecanographic Number</label>
                    <input
                        type="text"
                        id="removeQualificationMecanographicNumber"
                        name="removeQualificationMecanographicNumber"
                        value={number}
                        onChange={handleInputChange}
                        onBlur={handleNumberBlur}
                        placeholder="Enter staff number (e.g., S12345)"
                        className="form-input"
                    />
                </div>
                {qualifications.length > 0 && (
                    <div className="form-group">
                        <label htmlFor="qualificationSelect">Select Qualification to Remove</label>
                        <select
                            id="qualificationSelect"
                            name="qualificationSelect"
                            value={selectedQualification}
                            onChange={handleSelectChange}
                            className="form-input"
                        >
                            <option value="">-- Select --</option>
                            {qualifications.map(q => (
                                <option key={q.code} value={q.code}>{q.name}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn delete-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (<><span className="loading-spinner"></span>Removing...</>) : (<>Remove Qualification</>)}
                    </button>
                    <button
                        type="button"
                        className="clear-btn"
                        onClick={handleClear}
                        disabled={isLoading}
                    >
                        <span>🧹</span>
                        Clear
                    </button>
                </div>
            </form>
        </div>
    );
};

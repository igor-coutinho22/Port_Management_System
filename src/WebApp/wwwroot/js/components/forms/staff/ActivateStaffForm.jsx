// Activate Staff Form Component
console.log('ActivateStaffForm component loading...');

const ActivateStaffForm = ({ onSuccess }) => {
    const [number, setNumber] = React.useState('');
    const [isActivating, setIsActivating] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        setNumber(e.target.value);
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleActivate = async (e) => {
        e.preventDefault();
        if (!number.trim()) {
            setMessage({ type: 'error', text: 'Mecanographic number is required' });
            return;
        }
        setIsActivating(true);
        setMessage({ type: '', text: '' });
        try {
            await apiService.activateStaff(number.trim());
            setMessage({ type: 'success', text: `Staff "${number.trim()}" has been successfully activated.` });
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (error) {
            // If staff not found, show info message like other forms
            if (error.message && error.message.toLowerCase().includes('not found')) {
                setMessage({ type: 'info', text: `Staff with number ${number.trim()} not found.` });
            } else {
                setMessage({ type: 'error', text: 'Failed to activate staff. Please try again.' });
            }
        } finally {
            setIsActivating(false);
        }
    };

    const handleClear = () => {
        setNumber('');
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Activate Staff</h4>
                <p>Enter the staff member's mecanographic number to activate their account</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleActivate} className="search-form">
                <div className="form-group">
                    <label htmlFor="activateMecanographicNumber">Mecanographic Number</label>
                    <input
                        type="text"
                        id="activateMecanographicNumber"
                        name="activateMecanographicNumber"
                        value={number}
                        onChange={handleInputChange}
                        placeholder="Enter staff number (e.g., S12345)"
                        className="form-input"
                    />
                </div>
                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isActivating}
                    >
                        {isActivating ? (<><span className="loading-spinner"></span>Activating...</>) : (<>Activate Staff</>)}
                    </button>
                    <button
                        type="button"
                        className="clear-btn"
                        onClick={handleClear}
                        disabled={isActivating}
                    >
                        <span>🧹</span>
                        Clear
                    </button>
                </div>
            </form>
        </div>
    );
};

console.log('ActivateStaffForm component loaded!');
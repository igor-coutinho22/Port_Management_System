// Deactivate Staff Form Component
console.log('DeactivateStaffForm component loading...');

const DeactivateStaffForm = ({ onSuccess }) => {
    const [number, setNumber] = React.useState('');
    const [isDeactivating, setIsDeactivating] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        setNumber(e.target.value);
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleDeactivate = async (e) => {
        e.preventDefault();
        if (!number.trim()) {
            setMessage({ type: 'error', text: 'Mecanographic number is required' });
            return;
        }
        setIsDeactivating(true);
        setMessage({ type: '', text: '' });
        try {
            await apiService.deactivateStaff(number.trim());
            setMessage({ type: 'success', text: `Staff "${number.trim()}" has been successfully deactivated.` });
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (error) {
            if (error.message && error.message.toLowerCase().includes('not found')) {
                setMessage({ type: 'info', text: `Staff with number ${number.trim()} not found.` });
            } else {
                setMessage({ type: 'error', text: 'Failed to deactivate staff. Please try again.' });
            }
        } finally {
            setIsDeactivating(false);
        }
    };

    const handleClear = () => {
        setNumber('');
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Deactivate Staff</h4>
                <p>Enter the staff member's mecanographic number to deactivate their account</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleDeactivate} className="search-form">
                <div className="form-group">
                    <label htmlFor="deactivateMecanographicNumber">Mecanographic Number</label>
                    <input
                        type="text"
                        id="deactivateMecanographicNumber"
                        name="deactivateMecanographicNumber"
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
                        disabled={isDeactivating}
                    >
                        {isDeactivating ? (<><span className="loading-spinner"></span>Deactivating...</>) : (<>Deactivate Staff</>)}
                    </button>
                    <button
                        type="button"
                        className="clear-btn"
                        onClick={handleClear}
                        disabled={isDeactivating}
                    >
                        <span>🧹</span>
                        Clear
                    </button>
                </div>
            </form>
        </div>
    );
};

console.log('DeactivateStaffForm component loaded!');

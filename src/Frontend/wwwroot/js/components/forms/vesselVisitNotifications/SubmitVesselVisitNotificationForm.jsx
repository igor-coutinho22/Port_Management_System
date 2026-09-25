// Submit Vessel Visit Notification Form Component

const SubmitVesselVisitNotificationForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [notificationId, setNotificationId] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        setNotificationId(e.target.value);
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!notificationId.trim()) {
            setMessage({ type: 'error', text: 'Notification ID is required' });
            return;
        }
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });
        try {
            await apiService.submitVesselVisitNotification(notificationId.trim());
            setMessage({ type: 'success', text: `Notification "${notificationId.trim()}" has been successfully submitted.` });
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (error) {
            if (error.message) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'error', text: 'Failed to submit notification. Please try again.' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClear = () => {
        setNotificationId('');
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Submit Vessel Visit Notification</h4>
                <p>Enter the notification ID to submit the vessel visit notification for approval.</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSubmit} className="search-form">
                <div className="form-group">
                    <label htmlFor="submitNotificationId">Notification ID</label>
                    <input
                        type="text"
                        id="submitNotificationId"
                        name="submitNotificationId"
                        value={notificationId}
                        onChange={handleInputChange}
                        placeholder="Enter notification ID (e.g., 12345678-1234-1234-1234-123456789abc)"
                        className="form-input"
                    />
                </div>
                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (<><span className="loading-spinner"></span>Submitting...</>) : (<>Submit Notification</>)}
                    </button>
                    <button
                        type="button"
                        className="clear-btn"
                        onClick={handleClear}
                        disabled={isSubmitting}
                    >
                        <span role="img" aria-label="clear">🧹</span>
                        Clear
                    </button>
                </div>
            </form>
        </div>
    );
};

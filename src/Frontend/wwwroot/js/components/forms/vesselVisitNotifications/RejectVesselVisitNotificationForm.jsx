// Reject Vessel Visit Notification Form Component

const RejectVesselVisitNotificationForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = React.useState({
        notificationId: '',
        reason: ''
    });
    const [isRejecting, setIsRejecting] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.notificationId.trim()) {
            setMessage({ type: 'error', text: 'Notification ID is required' });
            return;
        }
        if (!formData.reason.trim()) {
            setMessage({ type: 'error', text: 'Rejection reason is required' });
            return;
        }
        setIsRejecting(true);
        setMessage({ type: '', text: '' });
        try {
            await apiService.rejectVesselVisitNotification(
                formData.notificationId.trim(),
                { reason: formData.reason.trim() }
            );
            setMessage({ type: 'success', text: `Notification "${formData.notificationId.trim()}" has been successfully rejected.` });
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (error) {
            if (error.message) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'error', text: 'Failed to reject notification. Please try again.' });
            }
        } finally {
            setIsRejecting(false);
        }
    };

    const handleClear = () => {
        setFormData({ notificationId: '', reason: '' });
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Reject Vessel Visit Notification</h4>
                <p>Enter the notification ID and a reason to reject the vessel visit notification.</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSubmit} className="search-form">
                <div className="form-group">
                    <label htmlFor="rejectNotificationId">Notification ID</label>
                    <input
                        type="text"
                        id="rejectNotificationId"
                        name="notificationId"
                        value={formData.notificationId}
                        onChange={handleInputChange}
                        placeholder="Enter notification ID (e.g., 12345678-1234-1234-1234-123456789abc)"
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="rejectReason">Rejection Reason</label>
                    <input
                        type="text"
                        id="rejectReason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleInputChange}
                        placeholder="Enter reason for rejection"
                        className="form-input"
                    />
                </div>
                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isRejecting}
                    >
                        {isRejecting ? (<><span className="loading-spinner"></span>Rejecting...</>) : (<>Reject Notification</>)}
                    </button>
                    <button
                        type="button"
                        className="clear-btn"
                        onClick={handleClear}
                        disabled={isRejecting}
                    >
                        <span role="img" aria-label="clear">🧹</span>
                        Clear
                    </button>
                </div>
            </form>
        </div>
    );
};

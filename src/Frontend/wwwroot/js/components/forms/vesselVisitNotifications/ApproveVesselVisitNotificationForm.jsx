// Approve Vessel Visit Notification Form Component

const ApproveVesselVisitNotificationForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = React.useState({
        notificationId: '',
        dockId: ''
    });
    const [isApproving, setIsApproving] = React.useState(false);
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
        if (!formData.dockId.trim()) {
            setMessage({ type: 'error', text: 'Dock ID is required' });
            return;
        }
        setIsApproving(true);
        setMessage({ type: '', text: '' });
        try {
            await apiService.approveVesselVisitNotification(formData.notificationId.trim(), formData.dockId.trim());
            setMessage({ type: 'success', text: `Notification "${formData.notificationId.trim()}" has been successfully approved.` });
            setTimeout(() => {
                handleClear();
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (error) {
            if (error.message) {
                setMessage({ type: 'error', text: error.message });
            } else {
                setMessage({ type: 'error', text: 'Failed to approve notification. Please try again.' });
            }
        } finally {
            setIsApproving(false);
        }
    };

    const handleClear = () => {
    setFormData({ notificationId: '', dockId: '' });
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Approve Vessel Visit Notification</h4>
                <p>Enter the notification ID and dock ID to approve the vessel visit notification.</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>{message.text}</div>
            )}
            <form onSubmit={handleSubmit} className="search-form">
                <div className="form-group">
                    <label htmlFor="approveNotificationId">Notification ID</label>
                    <input
                        type="text"
                        id="approveNotificationId"
                        name="notificationId"
                        value={formData.notificationId}
                        onChange={handleInputChange}
                        placeholder="Enter notification ID (e.g., 12345678-1234-1234-1234-123456789abc)"
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="approveDockId">Dock ID</label>
                    <input
                        type="text"
                        id="approveDockId"
                        name="dockId"
                        value={formData.dockId}
                        onChange={handleInputChange}
                        placeholder="Enter dock ID (e.g., 12345678-1234-1234-1234-123456789abc)"
                        className="form-input"
                    />
                </div>
                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={isApproving}
                    >
                        {isApproving ? (<><span className="loading-spinner"></span>Approving...</>) : (<>Approve Notification</>)}
                    </button>
                    <button
                        type="button"
                        className="clear-btn"
                        onClick={handleClear}
                        disabled={isApproving}
                    >
                        <span role="img" aria-label="clear">🧹</span>
                        Clear
                    </button>
                </div>
            </form>
        </div>
    );
};

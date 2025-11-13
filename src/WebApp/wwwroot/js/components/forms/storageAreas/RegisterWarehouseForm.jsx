// Register Warehouse Form Component
console.log('📝 RegisterWarehouseForm component loading...');

const RegisterWarehouseForm = ({ onSuccess }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = React.useState({
        name: '',
        maxCapacityTeu: '',
        currentOccupancyTeu: '',
        specializedCargoType: ''
    });
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (message.text) setMessage({ type: '', text: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        try {
            if (!formData.name?.trim()) throw new Error('Name is required.');
            if (!formData.specializedCargoType?.trim()) throw new Error('Specialized cargo type is required.');
            if (isNaN(parseInt(formData.maxCapacityTeu)) || parseInt(formData.maxCapacityTeu) < 0) throw new Error('Max capacity must be >= 0.');
            if (isNaN(parseInt(formData.currentOccupancyTeu)) || parseInt(formData.currentOccupancyTeu) < 0) throw new Error('Current occupancy must be >= 0.');
            if (parseInt(formData.currentOccupancyTeu) > parseInt(formData.maxCapacityTeu)) throw new Error('Current occupancy cannot exceed max capacity.');

            const warehouseData = {
                Name: formData.name,
                MaxCapacityTeu: parseInt(formData.maxCapacityTeu),
                CurrentOccupancyTeu: parseInt(formData.currentOccupancyTeu),
                SpecializedCargoType: formData.specializedCargoType
            };
            await apiService.createWarehouse(warehouseData);
            setMessage({ type: 'success', text: 'Warehouse registered successfully.' });
            setFormData({ name: '', maxCapacityTeu: '', currentOccupancyTeu: '', specializedCargoType: '' });
            if (onSuccess) onSuccess();
        } catch (error) {
            setMessage({ type: 'error', text: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="form-container">
            <div className="form-header">
                <h4>Register Warehouse</h4>
                <p>Fill in the details to register a new warehouse.</p>
            </div>
            {message.text && (
                <div className={`message ${message.type}`}>
                    {message.text}
                </div>
            )}
            <form onSubmit={handleSubmit} className="warehouse-form">
                <div className="form-grid">
                    <div className="form-group">
                        <label htmlFor="name">Name <span className="required">*</span></label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="maxCapacityTeu">Max Capacity (TEU) <span className="required">*</span></label>
                        <input type="number" id="maxCapacityTeu" name="maxCapacityTeu" value={formData.maxCapacityTeu} onChange={handleInputChange} min="0" className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="currentOccupancyTeu">Current Occupancy (TEU) <span className="required">*</span></label>
                        <input type="number" id="currentOccupancyTeu" name="currentOccupancyTeu" value={formData.currentOccupancyTeu} onChange={handleInputChange} min="0" className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="specializedCargoType">Specialized Cargo Type <span className="required">*</span></label>
                        <input type="text" id="specializedCargoType" name="specializedCargoType" value={formData.specializedCargoType} onChange={handleInputChange} className="form-input" required />
                    </div>
                </div>
                <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={isLoading}>
                        {isLoading ? (<><span className="loading-spinner"></span>Loading...</>) : (<>Register Warehouse</>)}
                    </button>
                </div>
            </form>
        </div>
    );
};

console.log('RegisterWarehouseForm component loaded! 📝');

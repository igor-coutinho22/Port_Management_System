/* global React, apiService */

const EditOperationPlanModal = ({ plan, onClose, onSaveSuccess }) => {
    // Deep copy items to edit state
    const [items, setItems] = React.useState(JSON.parse(JSON.stringify(plan.items)));
    const [reason, setReason] = React.useState('');
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError('Reason for change is required.');
            return;
        }

        setSaving(true);
        setError('');

        const dto = {
            author: 'User', // Will be overridden by backend or pulled from auth context
            reason: reason,
            items: items.map(i => ({
                itemId: i.id, // Ensure your DTO in backend matches 'id' or 'itemId'
                serviceStartTime: i.serviceStartTime,
                serviceEndTime: i.serviceEndTime,
                unloadingStartTime: i.unloadingStartTime,
                unloadingEndTime: i.unloadingEndTime,
                loadingStartTime: i.loadingStartTime,
                loadingEndTime: i.loadingEndTime,
                numberOfCranes: parseInt(i.numberOfCranes)
            }))
        };

        try {
            await apiService.updateOperationPlan(plan.id, dto);
            alert('Plan updated successfully!');
            onSaveSuccess();
        } catch (err) {
            console.error(err);
            setError('Failed to update plan: ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white p-6 rounded shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4">Edit Operation Plan</h2>

                {error && <div className="bg-red-100 text-red-700 p-2 mb-4 rounded">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block font-medium mb-1">Reason for Changes (Required)</label>
                        <input
                            type="text"
                            className="w-full border p-2 rounded"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="e.g., Delay due to bad weather"
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        {items.map((item, idx) => (
                            <div key={item.id} className="border p-4 rounded bg-gray-50">
                                <h4 className="font-bold mb-2">{item.vesselIMO} (Item #{idx + 1})</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs">Service Start</label>
                                        <input
                                            type="datetime-local"
                                            value={item.serviceStartTime.slice(0, 16)}
                                            onChange={e => handleItemChange(idx, 'serviceStartTime', e.target.value)}
                                            className="w-full border p-1 rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs">Service End</label>
                                        <input
                                            type="datetime-local"
                                            value={item.serviceEndTime.slice(0, 16)}
                                            onChange={e => handleItemChange(idx, 'serviceEndTime', e.target.value)}
                                            className="w-full border p-1 rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs">Cranes</label>
                                        <input
                                            type="number"
                                            value={item.numberOfCranes}
                                            onChange={e => handleItemChange(idx, 'numberOfCranes', e.target.value)}
                                            className="w-full border p-1 rounded"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

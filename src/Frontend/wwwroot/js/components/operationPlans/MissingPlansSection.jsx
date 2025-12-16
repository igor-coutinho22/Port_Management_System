/* global React, apiService */

const MissingPlansSection = ({ onRegenerate }) => {
    const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [missingVisits, setMissingVisits] = React.useState([]);
    const [regenerating, setRegenerating] = React.useState(false);
    const [msg, setMsg] = React.useState('');

    React.useEffect(() => {
        if (date) fetchMissing();
    }, [date]);

    const fetchMissing = async () => {
        try {
            const data = await apiService.getMissingOperationPlans(date);
            setMissingVisits(data);
            setMsg('');
        } catch (err) {
            console.error(err);
            setMsg('Error checking missing plans.');
        }
    };

    const handleRegenerate = async () => {
        if (!window.confirm("WARNING: Regenerating plans will OVERWRITE any existing plan for this day. Continue?")) {
            return;
        }

        setRegenerating(true);
        try {
            const heuristic = prompt("Enter heuristic name (e.g., 'fcfs', 'priority_v1'):", "fcfs");
            if (!heuristic) {
                setRegenerating(false);
                return;
            }

            await apiService.regenerateOperationPlan(date, heuristic);
            setMsg('Plan regenerated successfully!');
            fetchMissing();
            if (onRegenerate) onRegenerate();
        } catch (err) {
            console.error(err);
            setMsg('Error regenerating plan: ' + (err.response?.data?.message || err.message));
        } finally {
            setRegenerating(false);
        }
    };

    return (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded mb-6">
            <h3 className="font-bold text-orange-800 mb-2">Check for Missing Plans</h3>

            <div className="flex items-center gap-4 mb-4">
                <label className="text-sm">Check Date:</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border p-1 rounded"
                />
                <button
                    onClick={fetchMissing}
                    className="text-sm bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
                >
                    Check
                </button>
            </div>

            {msg && <p className="mb-2 text-sm font-semibold">{msg}</p>}

            {missingVisits.length > 0 ? (
                <div>
                    <p className="text-red-600 font-bold mb-2">
                        Warning: {missingVisits.length} Vessel Visit(s) on {date} do not have an Operation Plan!
                    </p>
                    <ul className="list-disc pl-5 mb-4 text-sm max-h-32 overflow-y-auto">
                        {missingVisits.map(v => (
                            <li key={v.id}>{v.vesselName} (IMO: {v.vesselIMO}) - Arr: {v.arrivalDate}</li>
                        ))}
                    </ul>

                    <button
                        onClick={handleRegenerate}
                        disabled={regenerating}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-bold disabled:opacity-50"
                    >
                        {regenerating ? 'Regenerating...' : 'Regenerate Plans Now'}
                    </button>
                </div>
            ) : (
                <p className="text-green-700 text-sm">All visits for this date have plans (or no visits exist).</p>
            )}
        </div>
    );
};

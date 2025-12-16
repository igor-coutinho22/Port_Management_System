/* global React, EditOperationPlanModal */

const OperationPlanDetails = ({ plan, onBack }) => {
    const [isEditing, setIsEditing] = React.useState(false);

    return (
        <div className="container mx-auto p-4">
            <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">&larr; Back to List</button>

            <div className="bg-white p-6 rounded shadow">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Operation Plan: {plan.scheduleDate}</h1>
                        <p className="text-gray-600">Created by: {plan.author} at {new Date(plan.createdAt).toLocaleString()}</p>
                        <p className="text-gray-600">Heuristic: {plan.heuristicUsed}</p>
                        <p className="mt-2"><span className="font-semibold">Status:</span> {plan.status}</p>
                    </div>
                    <div>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Edit Plan
                        </button>
                    </div>
                </div>

                <h2 className="text-xl font-semibold mb-3">Scheduled Items ({plan.items.length})</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">Vessel</th>
                                <th className="border p-2">Service Window</th>
                                <th className="border p-2">Unloading</th>
                                <th className="border p-2">Loading</th>
                                <th className="border p-2">Cranes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plan.items.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="border p-2">{item.vesselIMO}</td>
                                    <td className="border p-2">
                                        {new Date(item.serviceStartTime).toLocaleTimeString()} - {new Date(item.serviceEndTime).toLocaleTimeString()}
                                    </td>
                                    <td className="border p-2">
                                        {new Date(item.unloadingStartTime).toLocaleTimeString()} - {new Date(item.unloadingEndTime).toLocaleTimeString()}
                                    </td>
                                    <td className="border p-2">
                                        {new Date(item.loadingStartTime).toLocaleTimeString()} - {new Date(item.loadingEndTime).toLocaleTimeString()}
                                    </td>
                                    <td className="border p-2">{item.numberOfCranes}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isEditing && (
                <EditOperationPlanModal
                    plan={plan}
                    onClose={() => setIsEditing(false)}
                    onSaveSuccess={onBack} // Refresh list on save
                />
            )}
        </div>
    );
};

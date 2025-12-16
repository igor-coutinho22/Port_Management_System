/* global React, apiService, MissingPlansSection, OperationPlanDetails */

const OperationPlansPage = () => {
  const [plans, setPlans] = React.useState([]);
  const [filters, setFilters] = React.useState({ date: '', vesselIMO: '' });
  const [selectedPlan, setSelectedPlan] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Initial load
  React.useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiService.searchOperationPlans(filters.date, filters.vesselIMO);
      setPlans(data);
    } catch (err) {
      setError('Failed to load plans.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPlans();
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleBackToList = () => {
    setSelectedPlan(null);
    fetchPlans(); // Refresh data in case of updates
  };

  if (selectedPlan) {
    return <OperationPlanDetails plan={selectedPlan} onBack={handleBackToList} />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Operation Plans Management</h1>

      {/* Missing Plans Notification Section */}
      <MissingPlansSection onRegenerate={fetchPlans} />

      {/* Search Filter */}
      <div className="bg-white p-4 rounded shadow mb-6 mt-6">
        <h2 className="text-lg font-semibold mb-2">Search Plans</h2>
        <form onSubmit={handleSearch} className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium">Date</label>
            <input
              type="date"
              className="border rounded p-2"
              value={filters.date}
              onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Vessel IMO</label>
            <input
              type="text"
              placeholder="IMO..."
              className="border rounded p-2"
              value={filters.vesselIMO}
              onChange={(e) => setFilters({ ...filters, vesselIMO: e.target.value })}
            />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Search
          </button>
        </form>
      </div>

      {/* Plans List */}
      {loading ? <p>Loading...</p> : (
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Heuristic</th>
                <th className="text-left py-3 px-4">User Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-4 text-gray-500">No plans found.</td></tr>
              ) : (
                plans.map(plan => (
                  <tr key={plan.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{plan.scheduleDate}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${plan.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{plan.heuristicUsed}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

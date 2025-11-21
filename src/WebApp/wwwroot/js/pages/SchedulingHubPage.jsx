// Scheduling Hub Page - Algorithm execution and results display
console.log('⚙️ SchedulingHubPage.jsx is loading...');

const SchedulingHubPage = () => {
    const [selectedAlgorithm, setSelectedAlgorithm] = React.useState('heuristic');
    const [isLoading, setIsLoading] = React.useState(false);
    const [result, setResult] = React.useState(null);
    const [error, setError] = React.useState(null);

    const algorithms = [
        {
            id: 'heuristic',
            name: '⚡ Heuristic Algorithm (SPT)',
            description: 'Fast heuristic using Shortest Processing Time strategy. Optimized for computational efficiency.',
            color: '#27ae60',
            available: true
        },
        {
            id: 'optimal',
            name: '🎯 Optimal Algorithm',
            description: 'Finds the optimal solution minimizing delays (Coming in US 3.4.2)',
            color: '#3498db',
            available: false
        }
    ];

    const runScheduling = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('/api/scheduling/heuristic');

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            console.error('Scheduling error:', err);
            setError(err.message || 'Failed to compute schedule. Make sure SWI-Prolog is installed.');
        } finally {
            setIsLoading(false);
        }
    };

    const selectedAlgo = algorithms.find(a => a.id === selectedAlgorithm);

    return (
        <div className="page-section">
            <div className="hub-header">
                <h2 className="page-title">
                    ⚙️ Vessel Scheduling Algorithms
                </h2>
                <p>Generate optimized schedules for vessel loading and unloading operations</p>
            </div>

            {/* Algorithm Selection */}
            <div className="scheduling-controls">
                <div className="algorithm-selector">
                    <label htmlFor="algorithm-select">
                        <strong>Select Algorithm:</strong>
                    </label>
                    <select
                        id="algorithm-select"
                        value={selectedAlgorithm}
                        onChange={(e) => setSelectedAlgorithm(e.target.value)}
                        className="algorithm-dropdown"
                    >
                        {algorithms.map(algo => (
                            <option
                                key={algo.id}
                                value={algo.id}
                                disabled={!algo.available}
                            >
                                {algo.name} {!algo.available ? '(Coming Soon)' : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="algorithm-description" style={{ borderLeftColor: selectedAlgo?.color }}>
                    <h3>{selectedAlgo?.name}</h3>
                    <p>{selectedAlgo?.description}</p>
                </div>

                <button
                    className="run-scheduling-btn"
                    onClick={runScheduling}
                    disabled={isLoading || !selectedAlgo?.available}
                    style={{ backgroundColor: selectedAlgo?.color }}
                >
                    {isLoading ? '⏳ Computing...' : '▶️ Generate Schedule'}
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="error-message">
                    <h3>❌ Error</h3>
                    <p>{error}</p>
                    <small>
                        <strong>Troubleshooting:</strong> Make sure the backend is running and
                        SWI-Prolog is installed (<code>swipl</code> command available).
                    </small>
                </div>
            )}

            {/* Results Display */}
            {result && (
                <div className="scheduling-results">
                    <h3>✅ Scheduling Results</h3>

                    <div className="results-grid">
                        <div className="result-card">
                            <div className="card-icon">🚢</div>
                            <div className="card-content">
                                <h4>Vessel Sequence</h4>
                                <p className="result-value sequence-value">
                                    {result.sequence || 'N/A'}
                                </p>
                                <small>Order of vessel processing</small>
                            </div>
                        </div>

                        <div className="result-card">
                            <div className="card-icon">⏱️</div>
                            <div className="card-content">
                                <h4>Total Delay</h4>
                                <p className="result-value">
                                    {result.totalDelay !== undefined ? result.totalDelay : 'N/A'}
                                    <span className="unit">time units</span>
                                </p>
                                <small>Cumulative delay from desired departure times</small>
                            </div>
                        </div>

                        <div className="result-card">
                            <div className="card-icon">⚡</div>
                            <div className="card-content">
                                <h4>Computation Time</h4>
                                <p className="result-value">
                                    {result.runtimeSeconds !== undefined
                                        ? result.runtimeSeconds.toFixed(4)
                                        : 'N/A'}
                                    <span className="unit">seconds</span>
                                </p>
                                <small>Algorithm execution time</small>
                            </div>
                        </div>
                    </div>

                    <div className="results-note">
                        <strong>ℹ️ Note:</strong> Results are computed on-demand and not persisted.
                        The current implementation uses demo vessel data from the Prolog knowledge base.
                    </div>
                </div>
            )}

            {/* Info Section */}
            {!result && !error && !isLoading && (
                <div className="info-section">
                    <h3>📊 About Scheduling Algorithms</h3>
                    <p>
                        This module provides different algorithms for optimizing vessel loading and
                        unloading schedules. Each algorithm has different trade-offs between
                        computation time and solution quality.
                    </p>
                    <ul>
                        <li><strong>Heuristic (SPT):</strong> O(n log n) complexity, fast computation, good solutions</li>
                        <li><strong>Optimal:</strong> Finds best solution, higher computation time (US 3.4.2)</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

console.log('SchedulingHubPage component loaded! ⚙️');

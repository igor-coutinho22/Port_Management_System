// Scheduling Hub Page - Algorithm execution and results display
console.log('⚙️ SchedulingHubPage.jsx is loading...');

const SchedulingHubPage = () => {
    const { t } = useTranslation();
    const [selectedAlgorithm, setSelectedAlgorithm] = React.useState('heuristic');
    const [isLoading, setIsLoading] = React.useState(false);
    const [result, setResult] = React.useState(null);
    const [error, setError] = React.useState(null);

    const algorithms = [
        {
            id: 'heuristic',
            name: t('schedulingHubPage.controls.heuristic.name'),
            description: t('schedulingHubPage.controls.heuristic.description'),
            color: '#27ae60',
            available: true
        },
        {
            id: 'optimal',
            name: t('schedulingHubPage.controls.optimal.name'),
            description: t('schedulingHubPage.controls.optimal.description'),
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
                    {t('schedulingHubPage.title')}
                </h2>
                <p>{t('schedulingHubPage.description')}</p>
            </div>

            {/* Algorithm Selection */}
            <div className="scheduling-controls">
                <div className="algorithm-selector">
                    <label htmlFor="algorithm-select">
                        <strong>{t('schedulingHubPage.controls.selectAlgorithm')}</strong>
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
                                {algo.name} {!algo.available ? t('schedulingHubPage.controls.comingSoon') : ''}
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
                    {isLoading ? t('schedulingHubPage.runButton.inProgress') : t('schedulingHubPage.runButton.default')}
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="error-message">
                    <h3>{t('schedulingHubPage.error.title')}</h3>
                    <p>{error}</p>
                    <small>
                        <strong>{t('schedulingHubPage.error.troubleshooting')}</strong> {t('schedulingHubPage.error.message')}
                    </small>
                </div>
            )}

            {/* Results Display */}
            {result && (
                <div className="scheduling-results">
                    <h3>{t('schedulingHubPage.results.title')}</h3>

                    <div className="results-grid">
                        <div className="result-card">
                            <div className="card-icon">🚢</div>
                            <div className="card-content">
                                <h4>{t('schedulingHubPage.results.sequence')}</h4>
                                <p className="result-value sequence-value">
                                    {result.sequence || 'N/A'}
                                </p>
                                <small>{t('schedulingHubPage.results.sequence.description')}</small>
                            </div>
                        </div>

                        <div className="result-card">
                            <div className="card-icon">⏱️</div>
                            <div className="card-content">
                                <h4>{t('schedulingHubPage.results.totalDelay')}</h4>
                                <p className="result-value">
                                    {result.totalDelay !== undefined ? result.totalDelay : 'N/A'}
                                    <span className="unit">{t('schedulingHubPage.results.totalDelay.unit')}</span>
                                </p>
                                <small>{t('schedulingHubPage.results.totalDelay.description')}</small>
                            </div>
                        </div>

                        <div className="result-card">
                            <div className="card-icon">⚡</div>
                            <div className="card-content">
                                <h4>{t('schedulingHubPage.results.computationTime')}</h4>
                                <p className="result-value">
                                    {result.runtimeSeconds !== undefined
                                        ? result.runtimeSeconds.toFixed(4)
                                        : 'N/A'}
                                    <span className="unit">{t('schedulingHubPage.results.computationTime.unit')}</span>
                                </p>
                                <small>{t('schedulingHubPage.results.computationTime.description')}</small>
                            </div>
                        </div>
                    </div>

                    <div className="results-note">
                        <strong>{t('schedulingHubPage.results.note')}</strong> {t('schedulingHubPage.results.note.message')}
                    </div>
                </div>
            )}

            {/* Info Section */}
            {!result && !error && !isLoading && (
                <div className="info-section">
                    <h3>{t('schedulingHubPage.info.title')}</h3>
                    <p>
                        {t('schedulingHubPage.info.description')}
                    </p>
                    <ul>
                        <li><strong>{t('schedulingHubPage.info.heuristic')}</strong></li>
                        <li><strong>{t('schedulingHubPage.info.optimal')}</strong></li>
                    </ul>
                </div>
            )}
        </div>
    );
};

console.log('SchedulingHubPage component loaded! ⚙️');

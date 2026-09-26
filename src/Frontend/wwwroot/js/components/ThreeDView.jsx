// 3D View Component - React
const ThreeDView = () => {
    const { t } = useTranslation();
    const containerRef = React.useRef(null);
    const visualizationRef = React.useRef(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSceneLoading, setIsSceneLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    const [showOverlay, setShowOverlay] = React.useState(false);
    const [selectedData, setSelectedData] = React.useState(null);
    
    // --- ESTADOS DE PESQUISA ---
    const [searchId, setSearchId] = React.useState('');
    const [suggestions, setSuggestions] = React.useState([]);
    const [searchStatus, setSearchStatus] = React.useState(null); 
    const [selectedIndex, setSelectedIndex] = React.useState(-1); // Para navegação ↑↓

    // Estilos de UI
    const labelStyle = { textAlign: 'left', padding: '8px 5px', fontSize: '0.85rem', color: '#94a3b8', borderBottom: '1px solid #1e293b' };
    const valueStyle = { textAlign: 'right', padding: '8px 5px', fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc', borderBottom: '1px solid #1e293b' };

    let activeRole = 'Guest';
    try {
        const userCtx = useUser();
        if (userCtx) activeRole = userCtx.activeRole;
    } catch (e) { console.warn("Contexto de utilizador não encontrado."); }

    const isAdmin = activeRole === 'Admin';

    React.useEffect(() => {
        const initializeVisualization = () => {
            try {
                if (!containerRef.current) return;
                containerRef.current.innerHTML = '';
                const containerId = 'threejs-container-' + Date.now();
                containerRef.current.id = containerId;

                const vis = new window.PortVisualization(containerId);
                visualizationRef.current = vis;

                vis.onSelect = (data) => {
                    setSelectedData(data);
                    setSearchStatus(null); 
                };
                vis.onToggleOverlay = () => setShowOverlay(prev => !prev);

                setIsLoading(false);
                setError(null);
                setTimeout(() => {
                    if (!visualizationRef.current) return;
                    visualizationRef.current.loadPortData().finally(() => setIsSceneLoading(false));
                }, 100);
            } catch (err) {
                setError(t('threeDView.initError') + ' ' + err.message);
                setIsLoading(false);
            }
        };
        initializeVisualization();
        return () => { if (visualizationRef.current) visualizationRef.current.dispose(); };
    }, []);

    // --- LÓGICA DE AUTO-COMPLETE ---
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchId(value);
        setSearchStatus(null); 
        setSelectedIndex(-1);

        if (value.length > 0 && visualizationRef.current?.getSearchableEntities) {
            const allEntities = visualizationRef.current.getSearchableEntities();
            const filtered = allEntities.filter(name => 
                name.toLowerCase().startsWith(value.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 8));
        } else {
            setSuggestions([]);
        }
    };

    // --- NAVEGAÇÃO POR TECLADO (↑↓ e Enter) ---
    const handleKeyDown = (e) => {
        if (suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % suggestions.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === 'Enter') {
                if (selectedIndex >= 0) {
                    e.preventDefault();
                    handleSearch(suggestions[selectedIndex]);
                } else {
                    handleSearch();
                }
            }
        } else if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSearch = (term) => {
        const finalTerm = term || searchId;
        if (visualizationRef.current?.searchAndFocus && finalTerm) {
            const found = visualizationRef.current.searchAndFocus(finalTerm);
            if (!found) {
                setSearchStatus('not_found');
                setSuggestions([]);
            } else {
                setSearchId(finalTerm);
                setSuggestions([]);
                setSearchStatus(null);
                setSelectedIndex(-1);
            }
        }
    };

    if (error) return <div className="error">{error}</div>;

    return (
        <div className="page-section" style={{ position: 'relative' }}>
            <h2 className="page-title">{t('threeDView.title')}</h2>
            
            <div style={{ position: 'relative', width: '100%' }}>
                <div 
                    ref={containerRef} 
                    className="visualization-container" 
                    style={{ width: '100%', height: '600px', background: '#111', borderRadius: '8px', overflow: 'hidden' }} 
                />

                {/* Shown while the 3D models are downloaded and the port is built */}
                {isSceneLoading && (
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 1050, borderRadius: '8px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px',
                        background: 'rgba(15, 23, 42, 0.75)', color: '#e2e8f0', pointerEvents: 'none'
                    }}>
                        <div className="spinner" style={{
                            width: '42px', height: '42px', borderRadius: '50%',
                            border: '4px solid rgba(56, 189, 248, 0.25)', borderTopColor: '#38bdf8',
                            animation: 'threeDViewSpin 0.9s linear infinite'
                        }} />
                        <div style={{ fontWeight: 600 }}>{t('threeDView.loading')}</div>
                        <style>{'@keyframes threeDViewSpin { to { transform: rotate(360deg); } }'}</style>
                    </div>
                )}

                {/* BARRA DE PESQUISA MINI (Sem autoFocus) */}
                <div style={{ position: 'absolute', top: '15px', left: '20px', zIndex: 1100 }}>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                            <input 
                                type="text" 
                                placeholder={t('threeDView.searchPlaceholder')}
                                value={searchId}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                autoComplete="off" // Previne sugestões nativas do browser
                                style={{
                                    padding: '0 12px', borderRadius: '20px', 
                                    border: searchStatus === 'not_found' ? '1.5px solid #ef4444' : '1px solid #334155',
                                    background: 'rgba(15, 23, 42, 0.95)', color: 'white', width: '200px', outline: 'none',
                                    height: '28px', fontSize: '0.75rem' 
                                }}
                            />
                            
                            {suggestions.length > 0 && (
                                <ul style={{
                                    position: 'absolute', top: '32px', left: 0, right: 0,
                                    background: '#0f172a', border: '1px solid #334155', borderRadius: '8px',
                                    margin: 0, padding: 0, listStyle: 'none', overflow: 'hidden', zIndex: 1200
                                }}>
                                    {suggestions.map((s, idx) => (
                                        <li key={idx} 
                                            onClick={() => { setSearchId(s); handleSearch(s); }}
                                            style={{ 
                                                padding: '6px 12px', cursor: 'pointer', fontSize: '0.75rem', borderBottom: '1px solid #1e293b',
                                                background: idx === selectedIndex ? '#38bdf8' : 'transparent',
                                                color: idx === selectedIndex ? '#0f172a' : 'white',
                                                fontWeight: idx === selectedIndex ? 'bold' : 'normal'
                                            }}
                                            onMouseEnter={() => setSelectedIndex(idx)}
                                        >
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {searchStatus === 'not_found' && (
                                <div style={{
                                    position: 'absolute', top: '34px', left: 0,
                                    background: 'black', color: '#ef4444',
                                    padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem',
                                    fontWeight: 'bold', border: '1px solid #ef4444', 
                                    whiteSpace: 'nowrap', zIndex: 1150
                                }}>
                                    ⚠️ {t('threeDView.notFound')}
                                </div>
                            )}
                        </div>
                        
                        <button 
                            onClick={() => handleSearch()} 
                            style={{ 
                                height: '28px', padding: '0 12px', borderRadius: '20px',
                                background: '#38bdf8', color: '#0f172a', fontWeight: 'bold',
                                fontSize: '0.75rem', border: 'none', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}
                        >
                            {t('threeDView.go')}
                        </button>
                    </div>
                </div>

                {/* OVERLAY DE DETALHES */}
                {showOverlay && (
                    <div className="result-container" style={{
                        position: 'absolute', top: '65px', left: '20px', 
                        width: '350px', zIndex: 1000, background: 'rgba(15, 23, 42, 0.95)', 
                        color: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #334155',
                        maxHeight: '75vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #38bdf8', paddingBottom: '10px', marginBottom: '15px' }}>
                            <h4 style={{ margin: 0, color: '#38bdf8' }}>ℹ️ {t('threeDView.details')}</h4>
                            <button onClick={() => setShowOverlay(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                        </div>
                        {!selectedData ? <p style={{ textAlign: 'center' }}>{t('threeDView.selectObject')}</p> : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr><th style={labelStyle}>{t('threeDView.name')}</th><td style={valueStyle}>{selectedData.name || selectedData.vesselName || 'N/A'}</td></tr>
                                    <tr><th style={labelStyle}>{t('threeDView.type')}</th><td style={valueStyle}>{selectedData.subtype || selectedData.type || t('threeDView.object')}</td></tr>
                                    <tr><th style={labelStyle}>{t('threeDView.length')}</th><td style={valueStyle}>{selectedData.lengthMeters || selectedData.length || selectedData.width || '0'}m</td></tr>
                                    <tr><th style={labelStyle}>{t('threeDView.widthDepth')}</th><td style={valueStyle}>{selectedData.depthMeters || selectedData.depth || selectedData.width || '0'}m</td></tr>
                                    {selectedData.maxCapacityTeu && (<tr><th style={labelStyle}>{t('threeDView.capacity')}</th><td style={valueStyle}>{selectedData.maxCapacityTeu} TEU</td></tr>)}
                                    {isAdmin && (
                                        <>
                                            <tr style={{ background: 'rgba(56, 189, 248, 0.1)' }}><td colSpan="2" style={{ padding: '8px', textAlign: 'center', fontSize: '0.7rem', color: '#38bdf8', fontWeight: 'bold' }}>{t('threeDView.operationalData')}</td></tr>
                                            <tr><th style={labelStyle}>{t('threeDView.status')}</th><td style={{...valueStyle, color: '#4ade80'}}>{selectedData.status || t('threeDView.active')}</td></tr>
                                            {selectedData.type === 'Vessel' && (
                                                <>
                                                    <tr><th style={labelStyle}>ETA</th><td style={valueStyle}>{selectedData.arrivalTime || 'N/A'}</td></tr>
                                                    <tr><th style={labelStyle}>ETD</th><td style={valueStyle}>{selectedData.departureTime || 'N/A'}</td></tr>
                                                </>
                                            )}
                                        </>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* CONTROLOS E AJUDA */}
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                <button 
                    className="btn" 
                    onClick={() => visualizationRef.current?.frameCamera()}
                    style={{ padding: '8px 15px', borderRadius: '20px', background: 'linear-gradient(to right, #6366f1, #a855f7)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                >
                    {t('threeDView.resetCamera')}
                </button>
                <span style={{ marginLeft: '10px', fontSize: '0.75rem', opacity: 0.6, color: '#94a3b8' }}>
                    {t('threeDView.help.suggestions')} | {t('threeDView.help.press')} <strong>'i'</strong> {t('threeDView.help.info')} | {t('threeDView.help.press')} <strong>'r'</strong> {t('threeDView.help.reset')} | {t('threeDView.help.press')} <strong>Esc</strong> {t('threeDView.help.clear')}
                </span>
            </div>
        </div>
    );
};
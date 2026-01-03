// 3D View Component - React
const ThreeDView = () => {
    const containerRef = React.useRef(null);
    const visualizationRef = React.useRef(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    const [showOverlay, setShowOverlay] = React.useState(false);
    const [selectedData, setSelectedData] = React.useState(null);

    // Estilos de UI para a tabela
    const labelStyle = { textAlign: 'left', padding: '8px 5px', fontSize: '0.85rem', color: '#94a3b8', borderBottom: '1px solid #1e293b' };
    const valueStyle = { textAlign: 'right', padding: '8px 5px', fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc', borderBottom: '1px solid #1e293b' };

    // Verificação de Role (Segurança US 4.2.3)
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

                const vis = new PortVisualization(containerId);
                visualizationRef.current = vis;

                vis.onSelect = (data) => setSelectedData(data);
                vis.onToggleOverlay = () => setShowOverlay(prev => !prev);

                setIsLoading(false);
                setError(null);
                setTimeout(() => { if (visualizationRef.current) visualizationRef.current.loadPortData(); }, 100);
            } catch (err) {
                setError('Erro ao iniciar 3D: ' + err.message);
                setIsLoading(false);
            }
        };
        initializeVisualization();
        return () => { if (visualizationRef.current) visualizationRef.current.dispose(); };
    }, []);

    const handleResetView = () => visualizationRef.current?.controls?.reset();

    if (error) return <div className="error">{error}</div>;

    return (
        <div className="page-section" style={{ position: 'relative' }}>
            <h2 className="page-title">Visualização 3D do Porto</h2>
            
            <div ref={containerRef} className="visualization-container" 
                 style={{ width: '100%', height: '600px', background: '#111', borderRadius: '8px', overflow: 'hidden' }} />

            {/* OVERLAY À ESQUERDA - US 4.2.3 */}
            {showOverlay && (
                <div className="result-container" style={{
                    position: 'absolute', top: '20px', left: '20px', 
                    width: '350px', zIndex: 1000, background: 'rgba(15, 23, 42, 0.95)', 
                    color: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #334155',
                    maxHeight: '85vh', overflowY: 'auto'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #38bdf8', paddingBottom: '10px', marginBottom: '15px' }}>
                        <h4 style={{ margin: 0, color: '#38bdf8' }}>ℹ️ Detalhes do Objeto</h4>
                        <button onClick={() => setShowOverlay(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                    </div>

                    {!selectedData ? (
                        <p style={{ textAlign: 'center' }}>Selecione um objeto no mapa.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                {/* --- SEÇÃO PÚBLICA: Nome e Dimensões --- */}
                                <tr><th style={labelStyle}>Nome</th><td style={valueStyle}>{selectedData.name || selectedData.vesselName || 'N/A'}</td></tr>
                                <tr><th style={labelStyle}>Tipo</th><td style={valueStyle}>{selectedData.subtype || selectedData.type || 'Objeto'}</td></tr>
                                
                                <tr><th style={labelStyle}>Comprimento</th><td style={valueStyle}>{selectedData.lengthMeters || selectedData.length || selectedData.width || '0'}m</td></tr>
                                <tr><th style={labelStyle}>Largura / Prof.</th><td style={valueStyle}>{selectedData.depth || selectedData.width || '0'}m</td></tr>

                                {/* Campos técnicos públicos específicos */}
                                {selectedData.maxCapacityTeu && (
                                    <tr><th style={labelStyle}>Capacidade</th><td style={valueStyle}>{selectedData.maxCapacityTeu} TEU</td></tr>
                                )}
                                {selectedData.maxDraftMeters && (
                                    <tr><th style={labelStyle}>Calado Máx.</th><td style={valueStyle}>{selectedData.maxDraftMeters}m</td></tr>
                                )}

                                {/* --- SEÇÃO RESTRITA: Apenas para Admin --- */}
                                {isAdmin ? (
                                    <>
                                        <tr style={{ background: 'rgba(56, 189, 248, 0.1)' }}>
                                            <td colSpan="2" style={{ padding: '8px', textAlign: 'center', fontSize: '0.7rem', color: '#38bdf8', fontWeight: 'bold' }}>
                                                DADOS OPERACIONAIS
                                            </td>
                                        </tr>
                                        <tr><th style={labelStyle}>Estado</th><td style={{...valueStyle, color: '#4ade80'}}>{selectedData.status || 'Ativo'}</td></tr>
                                        
                                        {/* REQUISITO ESPECÍFICO: ETA/ETD Apenas para Barcos */}
                                        {selectedData.type === 'Vessel' && (
                                            <>
                                                <tr><th style={labelStyle}>ETA (Chegada)</th><td style={valueStyle}>{selectedData.arrivalTime || selectedData.eta || 'N/A'}</td></tr>
                                                <tr><th style={labelStyle}>ETD (Saída)</th><td style={valueStyle}>{selectedData.departureTime || selectedData.etd || 'N/A'}</td></tr>
                                            </>
                                        )}

                                        {/* Ocupação apenas para Armazéns/Yards */}
                                        {selectedData.currentOccupancyTeu !== undefined && (
                                            <tr><th style={labelStyle}>Ocupação Atual</th><td style={valueStyle}>{selectedData.currentOccupancyTeu} TEU</td></tr>
                                        )}
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan="2" style={{ padding: '15px 5px', fontSize: '0.75rem', opacity: 0.6, fontStyle: 'italic', textAlign: 'center' }}>
                                            🔒 Informações operacionais restritas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                    <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.7rem', opacity: 0.5 }}>
                        Pressione <strong>'i'</strong> para fechar
                    </div>
                </div>
            )}
        </div>
    );
};
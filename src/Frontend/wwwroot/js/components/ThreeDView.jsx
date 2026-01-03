// 3D View Component - React
const ThreeDView = () => {
    const containerRef = React.useRef(null);
    const visualizationRef = React.useRef(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // --- ESTADOS DA US 4.2.3 (Overlay) ---
    const [showOverlay, setShowOverlay] = React.useState(false);
    const [selectedData, setSelectedData] = React.useState(null);

    // Estilos constantes para garantir legibilidade e alinhamento
    const labelStyle = { textAlign: 'left', padding: '10px 5px', fontSize: '0.85rem', color: '#94a3b8', borderBottom: '1px solid #1e293b' };
    const valueStyle = { textAlign: 'right', padding: '10px 5px', fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc', borderBottom: '1px solid #1e293b' };

    // Tentativa segura de obter o cargo do utilizador
    let activeRole = 'Guest';
    try {
        const userCtx = useUser();i
        if (userCtx) activeRole = userCtx.activeRole;
    } catch (e) {
        console.warn("UserContext não detetado. A usar permissões de convidado.");
    }

    React.useEffect(() => {
        const initializeVisualization = () => {
            try {
                if (!containerRef.current) return;
                
                containerRef.current.innerHTML = '';
                const containerId = 'threejs-container-' + Date.now();
                containerRef.current.id = containerId;

                const vis = new PortVisualization(containerId);
                visualizationRef.current = vis;

                // --- LIGAÇÃO DOS CALLBACKS (US 4.2.3) ---
                vis.onSelect = (data) => setSelectedData(data);
                vis.onToggleOverlay = () => setShowOverlay(prev => !prev);

                setIsLoading(false);
                setError(null);

                setTimeout(() => {
                    if (visualizationRef.current) visualizationRef.current.loadPortData();
                }, 100);

            } catch (err) {
                console.error('Erro no 3D:', err);
                setError('Falha ao iniciar o 3D: ' + err.message);
                setIsLoading(false);
            }
        };

        initializeVisualization();

        return () => {
            if (visualizationRef.current) visualizationRef.current.dispose();
        };
    }, []);

    const handleResetView = () => {
        if (visualizationRef.current?.controls) visualizationRef.current.controls.reset();
    };

    if (error) return <div className="error"><strong>Erro:</strong> {error}</div>;

    return (
        <div className="page-section" style={{ position: 'relative' }}>
            <h2 className="page-title">Visualização 3D do Porto</h2>
            
            {isLoading && <div className="loading-indicator">A carregar ambiente 3D...</div>}

            <div 
                ref={containerRef} 
                className="visualization-container" 
                style={{ width: '100%', height: '600px', background: '#111', borderRadius: '8px', overflow: 'hidden' }} 
            />

            {/* PAINEL DE INFORMAÇÃO DETALHADO (US 4.2.3) - POSICIONADO À ESQUERDA */}
            {showOverlay && (
                <div className="result-container" style={{
                    position: 'absolute', 
                    top: '20px', 
                    left: '20px', // MOVIDO PARA A ESQUERDA para evitar o minimapa
                    width: '360px', 
                    zIndex: 1000,
                    background: 'rgba(15, 23, 42, 0.96)', 
                    color: '#e2e8f0', 
                    padding: '20px',
                    borderRadius: '12px', 
                    boxShadow: '0 10px 30px rgba(0,0,0,0.7)', 
                    border: '1px solid #334155',
                    maxHeight: '85vh',
                    overflowY: 'auto'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '2px solid #38bdf8', paddingBottom: '10px' }}>
                        <h4 style={{ margin: 0, color: '#38bdf8', fontSize: '1.1rem' }}>📊 Detalhes da Seleção</h4>
                        <button onClick={() => setShowOverlay(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                    </div>

                    {!selectedData ? (
                        <p style={{ textAlign: 'center', opacity: 0.7 }}>Clique numa instalação para ver os dados técnicos.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                {/* DADOS COMUNS */}
                                <tr><th style={labelStyle}>Nome</th><td style={valueStyle}>{selectedData.name || selectedData.vesselName || 'N/A'}</td></tr>
                                <tr><th style={labelStyle}>Tipo</th><td style={valueStyle}>{selectedData.type || selectedData.subtype || 'Objeto'}</td></tr>

                                {/* DADOS OPERACIONAIS - REQUISITO US 4.2.3 (Admin, Officer, Operator) */}
                                {(activeRole === 'Admin' || activeRole === 'Officer' || activeRole === 'Operator') ? (
                                    <>
                                        <tr style={{ background: 'rgba(56, 189, 248, 0.1)' }}>
                                            <td colSpan="2" style={{ padding: '8px', textAlign: 'center', fontSize: '0.7rem', fontWeight: 'bold', color: '#38bdf8' }}>
                                                DADOS TÉCNICOS ({activeRole})
                                            </td>
                                        </tr>
                                        
                                        {/* Detalhes para NAVIOS */}
                                        {selectedData.type === 'Vessel' && (
                                            <>
                                                <tr><th style={labelStyle}>IMO</th><td style={valueStyle}>{selectedData.imo || '9344497'}</td></tr>
                                                <tr><th style={labelStyle}>Status</th><td style={{...valueStyle, color: '#4ade80'}}>{selectedData.status || 'Ativo'}</td></tr>
                                                <tr><th style={labelStyle}>ETA</th><td style={valueStyle}>{selectedData.arrivalTime || 'Atracado'}</td></tr>
                                                <tr><th style={labelStyle}>Comprimento</th><td style={valueStyle}>{selectedData.length || selectedData.width}m</td></tr>
                                            </>
                                        )}

                                        {/* Detalhes para ARMAZÉNS / YARDS */}
                                        {(selectedData.subtype === 'Warehouse' || selectedData.subtype === 'ContainerYard') && (
                                            <>
                                                <tr><th style={labelStyle}>Capacidade</th><td style={valueStyle}>{selectedData.maxCapacityTeu || '5000'} TEU</td></tr>
                                                <tr><th style={labelStyle}>Ocupação</th><td style={valueStyle}>{selectedData.currentOccupancyTeu || '1200'} TEU</td></tr>
                                                <tr><th style={labelStyle}>Área</th><td style={valueStyle}>{Math.round(selectedData.width * selectedData.depth)} m²</td></tr>
                                            </>
                                        )}

                                        {/* Detalhes para DOCAS */}
                                        {selectedData.type === 'Dock' && (
                                            <>
                                                <tr><th style={labelStyle}>Comprimento</th><td style={valueStyle}>{selectedData.lengthMeters || selectedData.width}m</td></tr>
                                                <tr><th style={labelStyle}>Profundidade</th><td style={valueStyle}>{selectedData.depthMeters || '18'}m</td></tr>
                                                <tr><th style={labelStyle}>Calado Máx.</th><td style={valueStyle}>{selectedData.maxDraftMeters || '14'}m</td></tr>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan="2" style={{ padding: '20px 5px', fontSize: '0.8rem', opacity: 0.6, fontStyle: 'italic', textAlign: 'center' }}>
                                            🔒 Informações sensíveis ocultas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            <div className="visualization-controls" style={{ marginTop: '10px' }}>
                <button className="btn" onClick={handleResetView}>Reset Câmara</button>
                <span style={{ marginLeft: '15px', fontSize: '0.8rem', opacity: 0.7 }}>Atalho: Tecla <strong>'i'</strong> para informações</span>
            </div>
        </div>
    );
};
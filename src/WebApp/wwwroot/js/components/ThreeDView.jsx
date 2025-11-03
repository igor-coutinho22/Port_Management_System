// 3D View Component - React
const ThreeDView = () => {
    const containerRef = React.useRef(null);
    const visualizationRef = React.useRef(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        console.log('ThreeDView: Component mounted, initializing 3D...');
        
        // Wait a bit for the DOM to be ready
        const initializeVisualization = () => {
            try {
                if (!containerRef.current) {
                    console.error('ThreeDView: Container ref not available');
                    setError('3D container not available');
                    setIsLoading(false);
                    return;
                }

                if (typeof PortVisualization === 'undefined') {
                    console.error('ThreeDView: PortVisualization class not available');
                    setError('3D visualization library not loaded');
                    setIsLoading(false);
                    return;
                }

                console.log('ThreeDView: Creating visualization...');
                
                // Clean up existing visualization
                if (visualizationRef.current) {
                    try {
                        visualizationRef.current.dispose();
                    } catch (e) {
                        console.warn('Error disposing previous visualization:', e);
                    }
                }
                
                // Clear container
                containerRef.current.innerHTML = '';
                
                // Create new visualization with container ID
                const containerId = 'threejs-container-' + Date.now();
                containerRef.current.id = containerId;
                
                visualizationRef.current = new PortVisualization(containerId);
                
                setIsLoading(false);
                setError(null);
                
                // Load port data
                setTimeout(() => {
                    if (visualizationRef.current) {
                        visualizationRef.current.loadPortData();
                    }
                }, 500);
                
            } catch (err) {
                console.error('ThreeDView: Error initializing visualization:', err);
                setError('Failed to initialize 3D visualization: ' + err.message);
                setIsLoading(false);
            }
        };

        // Initialize after a short delay
        const timeoutId = setTimeout(initializeVisualization, 100);

        // Cleanup on unmount
        return () => {
            clearTimeout(timeoutId);
            if (visualizationRef.current) {
                try {
                    visualizationRef.current.dispose();
                } catch (e) {
                    console.warn('Error disposing visualization on unmount:', e);
                }
            }
        };
    }, []);

    const handleResetView = () => {
        if (visualizationRef.current && visualizationRef.current.controls) {
            visualizationRef.current.controls.reset();
        }
    };

    const handleReloadData = () => {
        if (visualizationRef.current) {
            visualizationRef.current.loadPortData();
        }
    };

    if (error) {
        return (
            <div className="page-section">
                <h2 className="page-title">3D Port Visualization</h2>
                <div className="error">
                    <strong>Error:</strong> {error}
                </div>
                <p>Please refresh the page to try again.</p>
            </div>
        );
    }

    return (
        <div className="page-section">
            <h2 className="page-title">3D Port Visualization</h2>
            <p>Interactive 3D representation of the port environment. Use mouse to navigate:</p>
            <ul>
                <li><strong>Left Click + Drag:</strong> Rotate view</li>
                <li><strong>Mouse Wheel:</strong> Zoom in/out</li>
                <li><strong>Right Click + Drag:</strong> Pan view</li>
            </ul>
            
            {isLoading && (
                <div className="loading-indicator">Loading 3D Environment...</div>
            )}
            
            <div 
                ref={containerRef}
                className="visualization-container"
                style={{ 
                    width: '100%', 
                    height: '500px', 
                    background: isLoading ? '#f0f0f0' : 'transparent',
                    position: 'relative',
                    minHeight: '500px'
                }}
            />
            
            <div className="visualization-controls">
                <button className="btn" onClick={handleResetView}>
                    Reset View
                </button>
                <button className="btn" onClick={handleReloadData}>
                    Reload Data
                </button>
            </div>
        </div>
    );
};
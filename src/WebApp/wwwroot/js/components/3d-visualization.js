// 3D Visualization Module using Three.js
class PortVisualization {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.animationId = null;
        
        // Initialize the 3D scene
        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, // Field of view
            this.container.offsetWidth / this.container.offsetHeight, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        this.camera.position.set(50, 30, 50);
        this.camera.lookAt(0, 0, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Add renderer to container
        this.container.appendChild(this.renderer.domElement);

        // Add orbit controls for camera interaction
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        this.controls.minDistance = 10;
        this.controls.maxDistance = 200;

        // Add lighting
        this.setupLighting();

        // Create the port environment
        this.createPortEnvironment();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation loop
        this.animate();
    }

    setupLighting() {
        // Ambient light for general illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 25);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
    }

    createPortEnvironment() {
        // Create water plane
        this.createWater();
        
        // Create some basic port infrastructure
        this.createDocks();
        this.createContainerYards();
        this.createWarehouses();
        
        // Add some basic vessels (placeholder)
        this.createVessels();
    }

    createWater() {
        const waterGeometry = new THREE.PlaneGeometry(200, 200);
        const waterMaterial = new THREE.MeshLambertMaterial({
            color: 0x006994,
            transparent: true,
            opacity: 0.8
        });
        
        const water = new THREE.Mesh(waterGeometry, waterMaterial);
        water.rotation.x = -Math.PI / 2;
        water.position.y = -1;
        this.scene.add(water);
    }

    createDocks() {
        // Create several dock structures
        const dockPositions = [
            { x: -20, z: 0 },
            { x: 0, z: 0 },
            { x: 20, z: 0 }
        ];

        dockPositions.forEach((pos, index) => {
            // Dock platform
            const dockGeometry = new THREE.BoxGeometry(15, 1, 8);
            const dockMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
            
            const dock = new THREE.Mesh(dockGeometry, dockMaterial);
            dock.position.set(pos.x, 0, pos.z);
            dock.castShadow = true;
            dock.receiveShadow = true;
            this.scene.add(dock);

            // Add dock label
            this.addLabel(`Dock ${index + 1}`, pos.x, 2, pos.z);
        });
    }

    createContainerYards() {
        // Container yard positions (behind docks)
        const yardPositions = [
            { x: -20, z: 20 },
            { x: 0, z: 20 },
            { x: 20, z: 20 }
        ];

        yardPositions.forEach((pos, index) => {
            // Yard ground
            const yardGeometry = new THREE.BoxGeometry(12, 0.2, 15);
            const yardMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
            
            const yard = new THREE.Mesh(yardGeometry, yardMaterial);
            yard.position.set(pos.x, 0, pos.z);
            yard.receiveShadow = true;
            this.scene.add(yard);

            // Add some containers
            this.addContainersToYard(pos.x, pos.z);

            // Add yard label
            this.addLabel(`Container Yard ${index + 1}`, pos.x, 3, pos.z);
        });
    }

    createWarehouses() {
        // Warehouse positions (further back)
        const warehousePositions = [
            { x: -15, z: 40 },
            { x: 15, z: 40 }
        ];

        warehousePositions.forEach((pos, index) => {
            // Warehouse building
            const warehouseGeometry = new THREE.BoxGeometry(10, 6, 8);
            const warehouseMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
            
            const warehouse = new THREE.Mesh(warehouseGeometry, warehouseMaterial);
            warehouse.position.set(pos.x, 3, pos.z);
            warehouse.castShadow = true;
            warehouse.receiveShadow = true;
            this.scene.add(warehouse);

            // Warehouse roof
            const roofGeometry = new THREE.BoxGeometry(11, 0.5, 9);
            const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
            
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.set(pos.x, 6.25, pos.z);
            this.scene.add(roof);

            // Add warehouse label
            this.addLabel(`Warehouse ${index + 1}`, pos.x, 8, pos.z);
        });
    }

    addContainersToYard(centerX, centerZ) {
        const containerColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF];
        
        for (let i = 0; i < 8; i++) {
            const containerGeometry = new THREE.BoxGeometry(2, 2, 1);
            const containerMaterial = new THREE.MeshLambertMaterial({
                color: containerColors[i % containerColors.length]
            });
            
            const container = new THREE.Mesh(containerGeometry, containerMaterial);
            const offsetX = (i % 4 - 1.5) * 2.5;
            const offsetZ = Math.floor(i / 4) * 2 - 1;
            
            container.position.set(centerX + offsetX, 1, centerZ + offsetZ);
            container.castShadow = true;
            this.scene.add(container);
        }
    }

    createVessels() {
        // Create simple vessel representations
        const vesselPositions = [
            { x: -20, z: -15 },
            { x: 5, z: -18 }
        ];

        vesselPositions.forEach((pos, index) => {
            // Vessel hull
            const hullGeometry = new THREE.BoxGeometry(12, 3, 4);
            const hullMaterial = new THREE.MeshLambertMaterial({ color: 0x2F4F4F });
            
            const hull = new THREE.Mesh(hullGeometry, hullMaterial);
            hull.position.set(pos.x, 1.5, pos.z);
            hull.castShadow = true;
            this.scene.add(hull);

            // Vessel superstructure
            const superGeometry = new THREE.BoxGeometry(4, 4, 3);
            const superMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
            
            const superstructure = new THREE.Mesh(superGeometry, superMaterial);
            superstructure.position.set(pos.x + 3, 4.5, pos.z);
            superstructure.castShadow = true;
            this.scene.add(superstructure);

            // Add vessel label
            this.addLabel(`Vessel ${index + 1}`, pos.x, 6, pos.z);
        });
    }

    addLabel(text, x, y, z) {
        // Create text sprite for labels
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = 'white';
        context.font = '20px Arial';
        context.textAlign = 'center';
        context.fillText(text, canvas.width / 2, canvas.height / 2 + 7);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        
        sprite.position.set(x, y, z);
        sprite.scale.set(8, 2, 1);
        this.scene.add(sprite);
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        const width = this.container.offsetWidth;
        const height = this.container.offsetHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Render the scene
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }

    // Method to load data from backend and update the visualization
    async loadPortData() {
        try {
            // This will be implemented later to fetch real data from your APIs
            console.log('Loading port data from backend...');
            
            // Example: fetch dock data
            // const docks = await fetch('/api/docks').then(r => r.json());
            // Update visualization based on real data
            
        } catch (error) {
            console.error('Error loading port data:', error);
        }
    }

    // Clean up resources
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }
        
        if (this.controls) {
            this.controls.dispose();
        }
    }
}

// Global variable to store the current visualization instance
let currentVisualization = null;
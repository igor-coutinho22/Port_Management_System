class PortVisualization {

    constructor(containerId) {
        this.container = document.getElementById(containerId);

        // Core engine modules
        this.dataFetcher = new PortDataFetcher();
        this.layoutEngine = new PortLayoutEngine();
        this.geometryBuilder = new PortGeometryBuilder();

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            5000
        );
        this.camera.position.set(0, 350, 700);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.container.appendChild(this.renderer.domElement);

        // Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;

        // Registry of all meshes
        this.objects = [];

        // Interaction system
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.selectedObject = null;

        // Callback set by ThreeDView.jsx
        this.onSelect = null;

        // Click listener
        this.renderer.domElement.addEventListener("pointerdown", evt => {
            this.onPointerDown(evt);
        });

        // Lights
        this.addLights();

        // Animation loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    // -------------------------------------------------------------------------
    // LIGHTS
    // -------------------------------------------------------------------------
    addLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 0.9);
        sun.position.set(300, 800, 300);
        sun.castShadow = true;
        this.scene.add(sun);
    }

    // -------------------------------------------------------------------------
    // LOAD REAL DATA → COMPUTE LAYOUT → BUILD GEOMETRY
    // -------------------------------------------------------------------------
    async loadPortData() {
        console.log("Loading port data…");

        this.clearScene();
        this.addWaterPlane();

        try {
            const rawData = await this.dataFetcher.loadAll();
            const layout = this.layoutEngine.computeLayout(rawData);

            console.log("Layout:", layout);

            this.buildDocks(layout.docks);
            this.buildStorageAreas(layout.storageAreas);
            this.buildResources(layout.resources);

            this.frameCamera();
        }
        catch (err) {
            console.error("Failed to load port data:", err);
        }
    }

    // -------------------------------------------------------------------------
    // INTERACTION — CLICK TO SELECT
    // -------------------------------------------------------------------------
    onPointerDown(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();

        this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.camera);

        const intersections = this.raycaster.intersectObjects(this.objects, false);
        if (intersections.length === 0) return;

        const obj = intersections[0].object;

        // Ignore labels
        if (obj instanceof THREE.Sprite) return;

        this.handleSelection(obj);
    }

    handleSelection(obj) {
        // remove previous highlight
        if (this.selectedObject) {
            if (this.selectedObject.material?.emissive) {
                this.selectedObject.material.emissive.setHex(0x000000);
            }
        }

        this.selectedObject = obj;

        // highlight
        if (obj.material && obj.material.emissive) {
            obj.material.emissive.setHex(0x333333);
        }

        // send metadata to React
        if (this.onSelect && obj.userData) {
            this.onSelect(obj.userData);
        }
    }

    // -------------------------------------------------------------------------
    // CLEAR SCENE
    // -------------------------------------------------------------------------
    clearScene() {
        this.objects.forEach(obj => {
            this.scene.remove(obj);

            if (obj.geometry) obj.geometry.dispose();

            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
        });

        this.objects = [];
    }

    // -------------------------------------------------------------------------
    // WATER
    // -------------------------------------------------------------------------
    addWaterPlane() {
        const geo = new THREE.PlaneGeometry(6000, 6000);
        const mat = new THREE.MeshPhongMaterial({
            color: 0x1ca3ec,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });

        const water = new THREE.Mesh(geo, mat);
        water.rotation.x = -Math.PI / 2;

        this.scene.add(water);
        this.objects.push(water);
    }

    // -------------------------------------------------------------------------
    // BUILD DOCKS
    // -------------------------------------------------------------------------
    buildDocks(docks) {
        docks.forEach(d => {
            const mesh = this.geometryBuilder.createDock(d);
            mesh.position.set(d.x, d.y, d.z);

            // Bind metadata for click selection
            mesh.userData = { type: "dock", dock: d };

            this.scene.add(mesh);
            this.objects.push(mesh);

            const label = this.geometryBuilder.createLabel(d.name);
            label.position.set(d.x, d.y + 50, d.z);

            this.scene.add(label);
            this.objects.push(label);
        });
    }

    // -------------------------------------------------------------------------
    // BUILD STORAGE AREAS (WAREHOUSE + YARD)
    // -------------------------------------------------------------------------
    buildStorageAreas(areas) {
        areas.forEach(sa => {
            let mesh;

            if (sa.subtype === "Warehouse") {
                mesh = this.geometryBuilder.createWarehouse(sa);
            } else {
                mesh = this.geometryBuilder.createContainerYard(sa);
            }

            mesh.position.set(sa.x, sa.y, sa.z);

            mesh.userData = { type: sa.subtype, area: sa };

            this.scene.add(mesh);
            this.objects.push(mesh);

            const label = this.geometryBuilder.createLabel(sa.name);
            label.position.set(sa.x, sa.y + sa.height + 30, sa.z);

            this.scene.add(label);
            this.objects.push(label);
        });
    }

    // -------------------------------------------------------------------------
    // BUILD RESOURCES (CRANES + VEHICLES)
    // -------------------------------------------------------------------------
    buildResources(resources) {
        resources.forEach(r => {
            const mesh = this.geometryBuilder.createResource(r);
            mesh.position.set(r.x, r.y, r.z);

            mesh.userData = { type: "resource", resource: r };

            this.scene.add(mesh);
            this.objects.push(mesh);

            const label = this.geometryBuilder.createLabel(r.name);
            label.position.set(r.x, r.y + 50, r.z);

            this.scene.add(label);
            this.objects.push(label);
        });
    }

    // -------------------------------------------------------------------------
    // CAMERA AUTO-FRAME
    // -------------------------------------------------------------------------
    frameCamera() {
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    // -------------------------------------------------------------------------
    // RENDER LOOP
    // -------------------------------------------------------------------------
    animate() {
        requestAnimationFrame(this.animate);
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    // -------------------------------------------------------------------------
    // DISPOSE
    // -------------------------------------------------------------------------
    dispose() {
        this.clearScene();
        this.renderer.dispose();
    }
}

// GLOBAL EXPORT
window.PortVisualization = PortVisualization;

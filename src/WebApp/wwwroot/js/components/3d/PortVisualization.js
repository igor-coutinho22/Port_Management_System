class PortVisualization {

    constructor(containerId) {
        this.container = document.getElementById(containerId);

        // Core modules
        this.dataFetcher = new PortDataFetcher();
        this.layoutEngine = new PortLayoutEngine();
        this.geometryBuilder = new PortGeometryBuilder();

        // Main scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue

        // Main camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 5000);
        this.camera.position.set(0, 350, 700);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // OrbitControls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1; // Don't go below ground

        // Object registry
        this.objects = [];

        // Interaction system
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.selectedObject = null;
        this.hoveredObject = null;

        // External callback (React-integrated)
        this.onSelect = null;

        // Hover & click handlers
        this.renderer.domElement.addEventListener("pointerdown", e => this.onPointerDown(e));
        this.renderer.domElement.addEventListener("pointermove", e => this.onPointerMove(e));

        // Tooltip DOM element
        this.tooltip = this.createTooltipElement();

        // Lighting
        this.addLights();

        // Fly-To animation state
        this.flyToActive = false;
        this.flyStartTime = 0;
        this.flyDuration = 1000;
        this.flyFromPos = new THREE.Vector3();
        this.flyFromTarget = new THREE.Vector3();
        this.flyToPos = new THREE.Vector3();
        this.flyToTarget = new THREE.Vector3();

        // -------------------------------
        // MINIMAP SETUP
        // -------------------------------
        this.setupMinimap();

        // Bind animation loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);

        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    // -----------------------------------------------------------------------------
    // TOOLTIP
    // -----------------------------------------------------------------------------
    createTooltipElement() {
        const el = document.createElement("div");
        Object.assign(el.style, {
            position: "absolute",
            pointerEvents: "none",
            padding: "6px 10px",
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            borderRadius: "6px",
            fontSize: "12px",
            whiteSpace: "nowrap",
            transition: "opacity 0.12s",
            opacity: 0,
            zIndex: 999
        });
        this.container.appendChild(el);
        return el;
    }

    showTooltip(text, x, y) {
        this.tooltip.innerText = text;
        this.tooltip.style.left = `${x + 12}px`;
        this.tooltip.style.top = `${y + 12}px`;
        this.tooltip.style.opacity = 1;
    }

    hideTooltip() {
        this.tooltip.style.opacity = 0;
    }

    // -----------------------------------------------------------------------------
    // LIGHTING
    // -----------------------------------------------------------------------------
    addLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xffffff, 0.8);
        sun.position.set(300, 800, 300);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 2000;

        // Increase shadow camera size to cover port
        const d = 1000;
        sun.shadow.camera.left = -d;
        sun.shadow.camera.right = d;
        sun.shadow.camera.top = d;
        sun.shadow.camera.bottom = -d;

        this.scene.add(sun);
    }

    // -----------------------------------------------------------------------------
    // MINIMAP SETUP (Orthographic top-down camera)
    // -----------------------------------------------------------------------------
    setupMinimap() {
        const size = 220; // minimap resolution
        this.minimapSize = size;

        // Mini-map camera
        this.minimapCamera = new THREE.OrthographicCamera(
            -500, 500, 500, -500, 0.1, 5000
        );
        this.minimapCamera.position.set(0, 2000, 0);
        this.minimapCamera.lookAt(0, 0, 0);

        // Canvas viewport for minimap rendering
        this.minimap = document.createElement("div");
        Object.assign(this.minimap.style, {
            position: "absolute",
            width: `${size}px`,
            height: `${size}px`,
            top: "12px",
            right: "12px",
            border: "2px solid rgba(0,0,0,0.6)",
            borderRadius: "4px",
            overflow: "hidden",
            pointerEvents: "none", // do not block normal interaction
            zIndex: 900,
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
        });
        this.container.appendChild(this.minimap);

        // Camera direction arrow (HTML)
        this.minimapArrow = document.createElement("div");
        Object.assign(this.minimapArrow.style, {
            position: "absolute",
            width: "0",
            height: "0",
            borderLeft: "10px solid transparent",
            borderRight: "10px solid transparent",
            borderBottom: "20px solid red",
            left: "50%",
            top: "50%",
            transformOrigin: "50% 50%",
            pointerEvents: "none",
            zIndex: 901
        });
        this.minimap.appendChild(this.minimapArrow);
    }

    // -----------------------------------------------------------------------------
    // UPDATE MINIMAP CAMERA
    // -----------------------------------------------------------------------------
    updateMinimap() {
        // Follow main camera X/Z but always top-down
        this.minimapCamera.position.x = this.camera.position.x;
        this.minimapCamera.position.z = this.camera.position.z;

        // Always look downward at target
        this.minimapCamera.lookAt(
            this.controls.target.x,
            0,
            this.controls.target.z
        );

        // Update arrow rotation (camera yaw)
        const dx = this.camera.position.x - this.controls.target.x;
        const dz = this.camera.position.z - this.controls.target.z;
        const angle = Math.atan2(dx, dz); // camera facing direction
        this.minimapArrow.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
    }

    // -----------------------------------------------------------------------------
    // LOAD PORT DATA
    // -----------------------------------------------------------------------------

    async loadPortData() {
        console.log("PortVisualization: loadPortData called");
        this.clearScene();
        this.addWaterPlane();

        try {
            const data = await this.dataFetcher.loadAll();
            console.log("PortVisualization: Data fetched", data);

            // Initialize textures
            if (data.textureConfig) {
                this.geometryBuilder.loadTextures(data.textureConfig);
            }

            const layout = this.layoutEngine.computeLayout(data);
            console.log("PortVisualization: Layout computed", layout);

            this.buildDocks(layout.docks);
            this.buildStorageAreas(layout.storageAreas);
            this.buildResources(layout.resources);
            this.buildVessels(layout.vessels);
            this.buildStaff(layout.staff);

            console.log("PortVisualization: Scene built with objects", this.objects.length);

            this.frameCamera();
        } catch (err) {
            console.error("Error loading port data:", err);
        }
    }

    // -----------------------------------------------------------------------------
    // CAMERA FLY-TO
    // -----------------------------------------------------------------------------
    flyToObject(pos) {
        this.flyToActive = true;
        this.flyStartTime = performance.now();

        // Start
        this.flyFromPos.copy(this.camera.position);
        this.flyFromTarget.copy(this.controls.target);

        // End
        this.flyToTarget.set(pos.x, pos.y, pos.z);
        this.flyToPos.set(pos.x + 180, pos.y + 120, pos.z + 180);
    }

    updateFlyTo() {
        if (!this.flyToActive) return;

        const now = performance.now();
        const t = Math.min(1, (now - this.flyStartTime) / this.flyDuration);
        const eased = t * t * (3 - 2 * t);

        this.camera.position.lerpVectors(this.flyFromPos, this.flyToPos, eased);
        this.controls.target.lerpVectors(this.flyFromTarget, this.flyToTarget, eased);

        if (t >= 1) {
            this.flyToActive = false;
        }
    }

    // -----------------------------------------------------------------------------
    // CLICK SELECTION
    // -----------------------------------------------------------------------------
    onPointerDown(e) {
        const obj = this.castRay(e);
        if (!obj || obj instanceof THREE.Sprite) return;

        this.handleSelection(obj);
        this.flyToObject(obj.position);
    }

    handleSelection(obj) {
        if (this.selectedObject && this.selectedObject.material?.emissive) {
            this.selectedObject.material.emissive.setHex(0x000000);
        }

        // Handle groups (like warehouses)
        let target = obj;
        if (obj.parent instanceof THREE.Group) {
            target = obj.parent; // Select the group logic if needed, but visual highlight is on mesh
        }

        this.selectedObject = obj;

        if (obj.material?.emissive) {
            obj.material.emissive.setHex(0x333333);
        }

        if (this.onSelect && (obj.userData || target.userData)) {
            this.onSelect(obj.userData || target.userData);
        }
    }

    // -----------------------------------------------------------------------------
    // HOVER TOOLTIP
    // -----------------------------------------------------------------------------
    onPointerMove(e) {
        const obj = this.castRay(e);

        if (!obj || obj instanceof THREE.Sprite) {
            this.hoveredObject = null;
            this.hideTooltip();
            return;
        }

        if (obj !== this.hoveredObject) {
            this.hoveredObject = obj;

            // Check userData on object or its parent group
            const d = obj.userData && Object.keys(obj.userData).length > 0 ? obj.userData : obj.parent.userData;

            if (!d) {
                this.hideTooltip();
                return;
            }

            let text = "";
            if (d.type === "Dock") text = `Dock: ${d.name}`;
            else if (d.subtype === "Warehouse") text = `Warehouse: ${d.name}`;
            else if (d.subtype === "ContainerYard") text = `Yard: ${d.name}`;
            else if (d.type === "resource") text = `Resource: ${d.name}`;
            else if (d.type === "Vessel") text = `Vessel: ${d.name} (${d.vesselType})`;
            else if (d.type === "Staff") text = `Staff: ${d.name} (${d.status})`;
            else text = d.name || "Object";

            this.showTooltip(text, e.clientX, e.clientY);
        } else {
            this.showTooltip(this.tooltip.innerText, e.clientX, e.clientY);
        }
    }

    // -----------------------------------------------------------------------------
    // RAYCAST
    // -----------------------------------------------------------------------------
    castRay(e) {
        const rect = this.renderer.domElement.getBoundingClientRect();

        this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.camera);
        const hits = this.raycaster.intersectObjects(this.objects, true); // recursive for groups

        return hits.length ? hits[0].object : null;
    }

    // -----------------------------------------------------------------------------
    // CLEANUP
    // -----------------------------------------------------------------------------
    clearScene() {
        // Remove all added objects
        this.objects.forEach(o => {
            this.scene.remove(o);
            // Dispose logic
            if (o.geometry) o.geometry.dispose();
            if (o.material) {
                if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
                else o.material.dispose();
            }
        });
        this.objects = [];

        // Keep lights? For now, let's just clear objects list but scene.remove might need to be selective
        // Actually, better to remove everything except lights/camera if possible, 
        // or just remove what we tracked in this.objects
    }

    // -----------------------------------------------------------------------------
    // WATER
    // -----------------------------------------------------------------------------
    addWaterPlane() {
        const geo = new THREE.PlaneGeometry(10000, 10000);
        const mat = new THREE.MeshPhongMaterial({
            color: 0x006994, // Darker blue from placeholder
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });

        const water = new THREE.Mesh(geo, mat);
        water.rotation.x = -Math.PI / 2;
        water.position.y = -0.5; // Slightly below 0

        this.scene.add(water);
        // We don't push water to this.objects if we don't want to interact with it
    }

    // -----------------------------------------------------------------------------
    // DOCKS
    // -----------------------------------------------------------------------------
    buildDocks(docks) {
        docks.forEach(d => {
            const mesh = this.geometryBuilder.createDock(d);
            mesh.position.set(d.x, d.y, d.z);
            mesh.userData = { type: "Dock", ...d };

            this.scene.add(mesh);
            this.objects.push(mesh);

            const label = this.geometryBuilder.createLabel(d.name);
            label.position.set(d.x, d.y + 30, d.z);
            this.scene.add(label);
            // Labels not interactive usually
        });
    }

    // -----------------------------------------------------------------------------
    // STORAGE AREAS
    // -----------------------------------------------------------------------------
    buildStorageAreas(areas) {
        areas.forEach(a => {
            const mesh =
                a.subtype === "Warehouse"
                    ? this.geometryBuilder.createWarehouse(a)
                    : this.geometryBuilder.createContainerYard(a);

            mesh.position.set(a.x, a.y, a.z);
            // UserData on group
            mesh.userData = { ...a };

            this.scene.add(mesh);
            this.objects.push(mesh);

            const label = this.geometryBuilder.createLabel(a.name);
            label.position.set(a.x, a.y + a.height + 20, a.z);
            this.scene.add(label);
        });
    }

    // -----------------------------------------------------------------------------
    // RESOURCES
    // -----------------------------------------------------------------------------
    buildResources(resources) {
        resources.forEach(r => {
            const mesh = this.geometryBuilder.createResource(r);
            mesh.position.set(r.x, r.y, r.z);
            mesh.userData = { type: "resource", ...r };

            this.scene.add(mesh);
            this.objects.push(mesh);
        });
    }

    // -----------------------------------------------------------------------------
    // VESSELS
    // -----------------------------------------------------------------------------
    buildVessels(vessels) {
        vessels.forEach(v => {
            const mesh = this.geometryBuilder.createVessel(v);
            mesh.position.set(v.x, v.y, v.z);
            mesh.userData = { type: "Vessel", ...v };

            this.scene.add(mesh);
            this.objects.push(mesh);

            const label = this.geometryBuilder.createLabel(v.name);
            label.position.set(v.x, v.y + v.height + 20, v.z);
            this.scene.add(label);
        });
    }

    // -----------------------------------------------------------------------------
    // STAFF
    // -----------------------------------------------------------------------------
    buildStaff(staffList) {
        staffList.forEach(s => {
            const mesh = this.geometryBuilder.createStaff(s);
            mesh.position.set(s.x, s.y, s.z);
            mesh.userData = { type: "Staff", ...s };

            this.scene.add(mesh);
            this.objects.push(mesh);
        });
    }

    // -----------------------------------------------------------------------------
    // CAMERA TARGET RESET
    // -----------------------------------------------------------------------------
    frameCamera() {
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    // -----------------------------------------------------------------------------
    // ANIMATION LOOP
    // -----------------------------------------------------------------------------
    animate() {
        if (!this.renderer) return; // Stopped

        requestAnimationFrame(this.animate);

        this.updateFlyTo();
        this.controls.update();

        // Render main scene
        this.renderer.setViewport(0, 0, this.container.clientWidth, this.container.clientHeight);
        this.renderer.setScissorTest(false);
        this.renderer.render(this.scene, this.camera);

        // Render minimap in top-right
        this.updateMinimap();

        const size = this.minimapSize;
        this.renderer.setViewport(
            this.container.clientWidth - size - 12,
            this.container.clientHeight - size - 12,
            size,
            size
        );
        this.renderer.setScissor(
            this.container.clientWidth - size - 12,
            this.container.clientHeight - size - 12,
            size,
            size
        );
        this.renderer.setScissorTest(true);
        this.renderer.render(this.scene, this.minimapCamera);

        this.renderer.setScissorTest(false);
    }

    // -----------------------------------------------------------------------------
    // DISPOSE
    // -----------------------------------------------------------------------------
    dispose() {
        this.clearScene();
        this.renderer.dispose();
        this.hideTooltip();
        this.renderer = null; // Stop loop
    }
}

// Global export
window.PortVisualization = PortVisualization;

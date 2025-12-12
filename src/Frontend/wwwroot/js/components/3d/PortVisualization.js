class PortVisualization {

    constructor(containerId) {
        this.container = document.getElementById(containerId);

        // Core modules
        this.dataFetcher = new PortDataFetcher();
        this.layoutEngine = new PortLayoutEngine();
        this.geometryBuilder = new PortGeometryBuilder();

        // Main scene
        this.scene = new THREE.Scene();

        // Sky colors
        this.daySkyColor = new THREE.Color(0x87ceeb);    // light blue
        this.nightSkyColor = new THREE.Color(0x02030A);  // deep navy night
        this.nightAmbientColor = new THREE.Color(0x4d6f9a);
        this.dayAmbientColor = new THREE.Color(0xffffff);

        this.scene.background = this.daySkyColor.clone();

        // Main camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 10000);
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
        this.controls.minDistance = 100;
        this.controls.maxDistance = 2000;

        this.controls.mouseButtons = {
            LEFT: THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.ROTATE
        };

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

        this.timeOfDay = 0.20; // 0..1
        this.dayDurationSeconds = 300; // 1 full day per 5 minutes

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
        const ambient = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambient);
        this.ambientLight = ambient;

        const hemi = new THREE.HemisphereLight(0x3c5a7a, 0x060606, 0.4);
        this.scene.add(hemi);
        this.hemiLight = hemi;

        // Pivot that will rotate
        const sunPivot = new THREE.Object3D();
        this.scene.add(sunPivot);
        this.sunPivot = sunPivot;

        const sun = new THREE.DirectionalLight(0xfff2cc, 0.8);
        sun.position.set(300, 800, 300);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 2000;

        const d = 1000;
        sun.shadow.camera.left = -d;
        sun.shadow.camera.right = d;
        sun.shadow.camera.top = d;
        sun.shadow.camera.bottom = -d;

        this.scene.add(sun.target);

        sunPivot.add(sun);
        this.sun = sun;

        // Visible sun mesh
        const sunGeom = new THREE.SphereGeometry(50, 32, 32);
        const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
        const sunMesh = new THREE.Mesh(sunGeom, sunMat);
        sunMesh.position.copy(sun.position);
        sunPivot.add(sunMesh);
        this.sunMesh = sunMesh;
    }


    // -----------------------------------------------------------------------------
    // MINIMAP SETUP (Orthographic top-down camera)
    // -----------------------------------------------------------------------------
    setupMinimap() {
        const size = 110; // minimap resolution
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
        THREE.Cache.enabled = false;
        console.log("PortVisualization: loadPortData called");
        this.clearScene();
        this.addWaterPlane();
        this.addGroundPlane();

        try {
            const data = await this.dataFetcher.loadAll();
            console.log("PortVisualization: Data fetched", data);

            // Initialize textures
            if (data.textureConfig) {
                this.geometryBuilder.loadTextures(data.textureConfig);
            }

            if (data.modelConfig) {
                await this.geometryBuilder.loadModels(data.modelConfig);
            }
            
            // Initialize geometries
            try {
                await this.geometryBuilder.loadModels();
            } catch (e) {
                console.error("Error loading 3D models:", e);
            }

            const layout = this.layoutEngine.computeLayout(data);
            console.log("PortVisualization: Layout computed", layout);

            this.buildDocks(layout.docks);
            this.buildStorageAreas(layout.storageAreas);
            this.buildContainers(layout.containers);
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
        const cast = this.castRay(e);
        const obj = cast.object
        if (!obj || obj instanceof THREE.Sprite) return;

        this.handleSelection(obj);
        this.flyToObject(cast.point);
    }

    handleSelection(obj) {
        if (this.selectedObject && this.selectedObject.material?.emissive) {
            this.selectedObject.material.emissive.setHex(0x000000);
        }

        // Handle groups (like warehouses)
        let target = this.findParent(obj);

        this.selectedObject = obj;

        if (obj.material?.emissive) {
            obj.material.emissive.setHex(0x333333);
        }

        if (this.onSelect && (obj.userData || target.userData)) {
            this.onSelect(obj.userData || target.userData);
        }
    }

    findParent(obj) {
        let target = obj;
        if (obj.parent instanceof THREE.Group) {
            target = obj.parent; // Select the group logic if needed, but visual highlight is on mesh
        }
        return target;
    }

    // -----------------------------------------------------------------------------
    // HOVER TOOLTIP
    // -----------------------------------------------------------------------------
    onPointerMove(e) {
        const obj = this.castRay(e)?.object || null;

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

        console.warn(hits.length ? "Hovering: " + hits[0].name + "\n" + hits[0] : "Hovering no object");

        return hits.length ? hits[0] : null;
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
        const geo = new THREE.PlaneGeometry(10000, 4980);
        const mat = this.geometryBuilder.materials.water;
        const water = new THREE.Mesh(geo, mat);
        water.rotation.x = -Math.PI / 2;
        water.position.y = -0.5; // Slightly below 0
        water.position.z = -2450
        water.receiveShadow = true;
        this.scene.add(water);
        // We don't push water to this.objects because we don't want to interact with it
    }

    addGroundPlane() {
        const geo = new THREE.BoxGeometry(10000, 2, 5020);
        const mat = this.geometryBuilder.materials.asphalt;
        const ground = new THREE.Mesh(geo, mat);
        ground.position.y = 0.5; // Less below 0
        ground.position.z = 2550; //just after docks
        ground.receiveShadow = true;
        ground.castShadow = false;
        this.scene.add(ground);
        // We don't push ground to this.objects because we don't want to interact with it
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
    // CONTAINERS
    // -----------------------------------------------------------------------------
    buildContainers(containers) {
        containers.forEach(c => {
            const mesh = this.geometryBuilder.createContainer(c);
            mesh.position.set(c.x, c.y, c.z);
            mesh.userData = { type: "Container", ...c };

            this.scene.add(mesh);
            this.objects.push(mesh);
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

        const now = performance.now();
        if (!this._lastTime) this._lastTime = now;
        const deltaSec = (now - this._lastTime) / 1000;
        this._lastTime = now;

        this.updateFlyTo();
        this.controls.update();

        const minY = 5;
        if (this.camera.position.y < minY) {
            this.camera.position.y = minY;
        }

        const time = now * 0.0001;

        this.updateWater(time);

        this.updateSun(deltaSec);

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

    updateWater(time) {
        const waterMat = this.geometryBuilder.materials.water;
        if (waterMat && waterMat.map) {
            waterMat.map.offset.x = time * 0.3;
            waterMat.map.offset.y = time * 0.1;
        }
        if (waterMat && waterMat.normalMap) {
            waterMat.normalMap.offset.x = time * 0.2;
            waterMat.normalMap.offset.y = time * 0.15;
        }
    }

    updateSun(deltaSec) {
        if (!this.sun || !this.sunMesh || !this.camera || !this.ambientLight) return;

        // -----------------------------------------------
        // TIME-OF-DAY 0..1
        // -----------------------------------------------
        const speed = 1 / this.dayDurationSeconds; // 1 full cycle per dayDurationSeconds
        this.timeOfDay = (this.timeOfDay + deltaSec * speed) % 1; // 0..1
        const t = this.timeOfDay;

        // -----------------------------------------------
        // SUN ORBIT
        // -----------------------------------------------
        // Angle for full orbit (0..2π)
        const angle = t * Math.PI * 2;

        // Sun height: -1 (deep below) → 0 (horizon) → +1 (straight up)
        const h = Math.sin(angle);

        const radius = 5500; // must be < camera.far (you have 10000)
        const y = h * radius;
        const z = -Math.cos(angle) * radius; // keep sun on "sea side" (negative z for noon)

        this.sun.position.set(0, y, z);
        this.sunMesh.position.copy(this.sun.position);
        this.sunMesh.visible = true; // always visible; we dim lights instead of hiding

        // Point light toward scene center
        this.sun.target.position.set(0, 0, 0);
        this.sun.target.updateMatrixWorld();

        // -----------------------------------------------
        // DAYLIGHT FACTOR based on sun height
        // -----------------------------------------------
        // twilight is a band around horizon where we fade smoothly
        const twilight = 0.2; // tweak: 0.1 = sharper, 0.3 = softer
        let lightFactor;

        if (h <= -twilight) {
            // full night
            lightFactor = 0;
        } else if (h >= twilight) {
            // full day
            lightFactor = 1;
        } else {
            // smooth fade in [-twilight, +twilight]
            const u = (h + twilight) / (2 * twilight); // -twilight -> 0, +twilight -> 1
            lightFactor = u * u * (3 - 2 * u); // smoothstep
        }

        // -----------------------------------------------
        // KEEP SUN VISUALLY BIG – scale with distance
        // -----------------------------------------------
        const dist = this.camera.position.distanceTo(this.sunMesh.position);
        if (dist > 0) {
            const baseRadius = 50;     // original SphereGeometry radius
            const apparentSize = 0.06; // increase to make sun look bigger on screen
            const scale = (dist * apparentSize) / baseRadius;
            this.sunMesh.scale.setScalar(scale);
        }

        // -----------------------------------------------
        // SUN + AMBIENT INTENSITY
        // -----------------------------------------------
        this.sun.intensity = 0.2 + 0.8 * lightFactor;

        const minAmbient = 0.35; // moonlight
        const maxAmbient = 0.6;  // daylight fill
        this.ambientLight.intensity =
            minAmbient + (maxAmbient - minAmbient) * lightFactor;

        // -----------------------------------------------
        // AMBIENT COLOR (moonlight ↔ daylight)
        // -----------------------------------------------
        const daylightColor = this.dayAmbientColor || new THREE.Color(0xffffff);
        const moonColor = this.nightAmbientColor || new THREE.Color(0x4d6f9a);

        const ambientColor = new THREE.Color();
        ambientColor.lerpColors(moonColor, daylightColor, lightFactor);
        this.ambientLight.color.copy(ambientColor);

        // Hemisphere light: stronger at night for soft sky glow
        if (this.hemiLight) {
            this.hemiLight.intensity = 0.4 * (1 - lightFactor);
        }

        // -----------------------------------------------
        // SKY BACKGROUND FADE (night ↔ day)
        // -----------------------------------------------
        const skyColor = new THREE.Color();
        skyColor.lerpColors(this.nightSkyColor, this.daySkyColor, lightFactor);
        this.scene.background = skyColor;
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

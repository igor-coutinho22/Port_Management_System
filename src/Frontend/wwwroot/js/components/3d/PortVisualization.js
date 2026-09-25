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
        this.controls.maxPolarAngle = Math.PI / 2; // Don't go below ground
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

        this.onSelect = null;
        this.onToggleOverlay = null;

        // External callback (React-integrated)
        this.onSelect = null;

        // Hover & click handlers
        this.renderer.domElement.addEventListener("pointerdown", e => this.onPointerDown(e));
        this.renderer.domElement.addEventListener("pointermove", e => this.onPointerMove(e));

        // Tooltip DOM element
        this.tooltip = this.createTooltipElement();

        // Lighting
        this.addLights();

        this.setupSelectionSpotlight();

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

        this.timeOfDay = 0.45; // 0..1
        this.dayDurationSeconds = 300; // 1 full day per 5 minutes

        this._keydownHandler = (e) => {
            // Ignore shortcuts while the user is typing (e.g. in the search box)
            const el = e.target;
            if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;

            const key = e.key.toLowerCase();
            if (e.key.toLowerCase() === 'i' && typeof this.onToggleOverlay === 'function') {
                this.onToggleOverlay();
            }

            if (key === 'r') {
                this.frameCamera();
            }

            if (key === 'escape') {
                this.clearSelection();
            }
        };
        window.addEventListener('keydown', this._keydownHandler);
    }

    // -------------------------------------------------------------------------
    // TOOLTIP
    // -------------------------------------------------------------------------

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

    // -------------------------------------------------------------------------
    // LIGHTING
    // -------------------------------------------------------------------------

    addLights() {
        const ambient = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(ambient);
        this.ambientLight = ambient;

        const hemi = new THREE.HemisphereLight(0x3c5a7a, 0x060606, 0.4);
        this.scene.add(hemi);
        this.hemiLight = hemi;

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

        const sunGeom = new THREE.PlaneGeometry(100, 100);
        const sunMat = this.geometryBuilder.materials.sun;
        sunMat.transparent = true;
        sunMat.opacity = 0.75;
        const sunMesh = new THREE.Mesh(sunGeom, sunMat);
        sunMesh.position.copy(sun.position);
        sunPivot.add(sunMesh);
        this.sunMesh = sunMesh;
    }

    // -------------------------------------------------------------------------
    // MINIMAP
    // -------------------------------------------------------------------------

    setupMinimap() {
        const size = 110;
        this.minimapSize = size;

        this.minimapCamera = new THREE.OrthographicCamera(
            -500, 500, 500, -500, 0.1, 5000
        );
        this.minimapCamera.position.set(0, 2000, 0);
        this.minimapCamera.lookAt(0, 0, 0);

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
            pointerEvents: "none",
            zIndex: 900,
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
        });
        this.container.appendChild(this.minimap);

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

    updateMinimap() {
        this.minimapCamera.position.x = this.camera.position.x;
        this.minimapCamera.position.z = this.camera.position.z;

        this.minimapCamera.lookAt(
            this.controls.target.x,
            0,
            this.controls.target.z
        );

        const dx = this.camera.position.x - this.controls.target.x;
        const dz = this.camera.position.z - this.controls.target.z;
        const angle = Math.atan2(dx, dz);
        this.minimapArrow.style.transform = `translate(-50%, -50%) rotate(${angle}rad)`;
    }

    // -------------------------------------------------------------------------
    // LOAD PORT DATA
    // -------------------------------------------------------------------------

    async loadPortData() {
        THREE.Cache.enabled = false;
        this.clearScene();
        this.addWaterPlane();
        this.addGroundPlane();

        try {
            const data = await this.dataFetcher.loadAll();

            if (data.textureConfig) {
                this.geometryBuilder.loadTextures(data.textureConfig);
            }

            if (data.modelConfig) {
                await this.geometryBuilder.loadModels(data.modelConfig);
            }

            const layout = this.layoutEngine.computeLayout(data);


            // Fator de distanciamento
            const spacingFactor = 1.3;
            const spacingFactor1 = 1.6;
            const spacingFactor2 = 1.2;

            // Aplicar o distanciamento a todos os elementos para manter o layout alinhado
            layout.roads.forEach(r => {
                r.x *= spacingFactor1;
                r.z *= spacingFactor2;

                if (r.orientation === "horizontal") {
                    r.width += 600;
                } else if (r.orientation === "vertical") {
                    r.depth += 175;
                }

            });

            // Aplicar o mesmo distanciamento aos restantes objetos
            layout.intersections.forEach(i => {
                i.x *= spacingFactor1;
                i.z *= spacingFactor2;
            });
            layout.vessels.forEach(v => v.x *= spacingFactor);
            layout.storageAreas.forEach(a => {
                a.x *= spacingFactor1;
                a.z *= spacingFactor2;
            });
            layout.docks.forEach(d => d.x *= spacingFactor);
            layout.staff.forEach(s => s.x *= spacingFactor);
            layout.resources.forEach(r => r.z *= spacingFactor2);

            if (layout.containers) {
                layout.containers.forEach(c => c.x *= spacingFactor);
            }

            // --- FIM DOS AJUSTES ---

            this.buildDocks(layout.docks);
            this.buildStorageAreas(layout.storageAreas);
            this.buildContainers(layout.containers);
            this.buildResources(layout.resources);
            this.buildVessels(layout.vessels);
            this.buildStaff(layout.staff);

            // Constrói as estradas com as novas coordenadas e comprimentos
            this.buildRoads(layout.roads, layout.intersections);

            this.frameCamera();
        } catch (err) {
            console.error("Error loading port data:", err);
        }
    }

    // -------------------------------------------------------------------------
    // SELECTION SPOTLIGHT (US 4.2.5 / 4.2.6)
    // A spotlight above and in front of the selected object (camera side): the cone
    // is sized to the object, it casts shadows, moves and fades smoothly, and the
    // rest of the scene is dimmed while an object is selected.
    // -------------------------------------------------------------------------
    setupSelectionSpotlight() {
        const spot = new THREE.SpotLight(0xfff4e0, 0);
        spot.angle = Math.PI / 8;
        spot.penumbra = 0.15;
        spot.decay = 1;
        spot.castShadow = true;
        spot.shadow.mapSize.width = 1024;
        spot.shadow.mapSize.height = 1024;
        spot.shadow.bias = -0.0005;
        spot.visible = false;
        this.scene.add(spot);
        this.scene.add(spot.target);
        this.selectionSpotlight = spot;

        this.spotState = {
            object: null,
            level: 0,            // 0 = off, 1 = fully on (smoothed)
            center: new THREE.Vector3(),
            height: 150,
            lean: 0,
            goalPosition: new THREE.Vector3(),
            goalTarget: new THREE.Vector3(),
            goalAngle: Math.PI / 8,
            maxIntensity: 2.8
        };
    }

    // Light position: above the object, leaning towards the camera so the visible side is lit
    computeSpotlightPosition(out) {
        const s = this.spotState;
        const towardsCamera = new THREE.Vector3().subVectors(this.camera.position, s.center);
        towardsCamera.y = 0;
        if (towardsCamera.lengthSq() > 0) towardsCamera.normalize();
        return out.copy(s.center).addScaledVector(towardsCamera, s.lean).setY(s.center.y + s.height);
    }

    focusSpotlight(object) {
        const s = this.spotState;
        const spot = this.selectionSpotlight;
        if (!s || !spot) return;

        const box = new THREE.Box3().setFromObject(object);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Radius of the object's footprint on the ground: the pool of light hugs the object
        const footprint = Math.max(Math.hypot(size.x, size.z) / 2, 5);

        s.object = object;
        s.center.set(center.x, box.min.y, center.z);    // aim at the base so the pool sits around the object
        s.height = Math.max(footprint * 4, size.y * 3, 120);
        s.lean = s.height * 0.25;                       // slightly towards the camera
        s.goalTarget.copy(s.center);
        this.computeSpotlightPosition(s.goalPosition);

        // Cone just wide enough for the footprint (small margin for the soft edge)
        const lightDistance = s.goalPosition.distanceTo(s.goalTarget);
        s.goalAngle = THREE.MathUtils.clamp(Math.atan((footprint * 1.05) / lightDistance), Math.PI / 90, Math.PI / 5);

        // When the light is off, it appears in place (fades in) instead of flying from the previous spot
        if (s.level < 0.01) {
            spot.position.copy(s.goalPosition);
            spot.target.position.copy(s.goalTarget);
            spot.angle = s.goalAngle;
        }
    }

    clearSelection() {
        this.selectedObject = null;
        if (this.spotState) this.spotState.object = null;
    }

    updateSpotlight(deltaSec) {
        const s = this.spotState;
        const spot = this.selectionSpotlight;
        if (!s || !spot) return;

        if (s.object) this.computeSpotlightPosition(s.goalPosition);

        // Exponential smoothing: frame-rate independent transitions
        const k = 1 - Math.exp(-deltaSec * 6);
        spot.position.lerp(s.goalPosition, k);
        spot.target.position.lerp(s.goalTarget, k);
        spot.target.updateMatrixWorld();
        spot.angle += (s.goalAngle - spot.angle) * k;
        s.level += ((s.object ? 1 : 0) - s.level) * k;
        if (!s.object && s.level < 0.001) s.level = 0;

        const lightDistance = spot.position.distanceTo(spot.target.position);
        spot.distance = lightDistance * 2.2; // also bounds the shadow camera
        spot.intensity = s.level * s.maxIntensity;
        spot.visible = s.level > 0;

        // Dim the rest of the scene so the spotlight stands out (runs after updateSun each frame)
        const dim = 1 - 0.7 * s.level;
        if (this.sun) this.sun.intensity *= dim;
        if (this.ambientLight) this.ambientLight.intensity *= dim;
        if (this.hemiLight) this.hemiLight.intensity *= dim;
    }

    // -------------------------------------------------------------------------
    // CAMERA FLY-TO
    // -------------------------------------------------------------------------

    flyToObject(pos) {
        this.flyToActive = true;
        this.flyStartTime = performance.now();

        this.flyFromPos.copy(this.camera.position);
        this.flyFromTarget.copy(this.controls.target);

        this.flyToTarget.set(pos.x, pos.y, pos.z);
        this.flyToPos.set(pos.x + 180, pos.y + 120, pos.z + 180);
    }

    updateFlyTo() {
        if (!this.flyToActive) return;

        const now = performance.now();
        const t = Math.min(1, (now - this.flyStartTime) / this.flyDuration);
        // Função de easing para suavizar o início e o fim do movimento
        const eased = t * t * (3 - 2 * t);

        // Interpolação da câmara e do alvo dos controlos
        this.camera.position.lerpVectors(this.flyFromPos, this.flyToPos, eased);
        this.controls.target.lerpVectors(this.flyFromTarget, this.flyToTarget, eased);

        if (t >= 1) {
            this.flyToActive = false;
        }
    }

    // -------------------------------------------------------------------------
    // CLICK SELECTION
    // -------------------------------------------------------------------------
    onPointerDown(e) {
        if (e.button !== 0) return;

        const cast = this.castRay(e);
        const obj = cast?.object || null;
        if (!obj || obj instanceof THREE.Sprite) return;

        this.handleSelection(obj);

        if (this.selectedObject) {
            const box = new THREE.Box3().setFromObject(this.selectedObject);
            const center = new THREE.Vector3();
            box.getCenter(center);

            this.flyToObject(center);
        }
    }

    handleSelection(obj) {
        const targetEntity = this.findParent(obj);
        if (!targetEntity) return;

        this.selectedObject = targetEntity;
        this.focusSpotlight(targetEntity);

        if (this.onSelect) {
            this.onSelect(targetEntity.userData);
        }
    }

    findParent(obj) {
        if (!obj || obj.type === 'Scene') return null;

        if (obj.userData && obj.userData.isSelectableRoot) {
            return obj;
        }

        return this.findParent(obj.parent);
    }

    // -------------------------------------------------------------------------
    // HOVER TOOLTIP
    // -------------------------------------------------------------------------
    onPointerMove(e) {
        const obj = this.castRay(e)?.object || null;

        if (!obj || obj instanceof THREE.Sprite) {
            this.hoveredObject = null;
            this.hideTooltip();
            return;
        }

        if (obj !== this.hoveredObject) {
            this.hoveredObject = obj;

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
            else if (d.type === "Road") text = `Road`;
            else if (d.type === "Intersection") text = `Intersection`;
            else text = d.name || "Object";

            this.showTooltip(text, e.clientX, e.clientY);
        } else {
            this.showTooltip(this.tooltip.innerText, e.clientX, e.clientY);
        }
    }

    // -------------------------------------------------------------------------
    // RAYCAST
    // -------------------------------------------------------------------------
    castRay(e) {
        const rect = this.renderer.domElement.getBoundingClientRect();

        this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.pointer, this.camera);
        const hits = this.raycaster.intersectObjects(this.objects, true);

        return hits.length ? hits[0] : null;
    }

    // -------------------------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------------------------
    clearScene() {
        this.objects.forEach(o => {
            this.scene.remove(o);
            if (o.geometry) o.geometry.dispose();
            if (o.material) {
                if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
                else o.material.dispose();
            }
        });
        this.objects = [];
    }

    // -------------------------------------------------------------------------
    // WATER & GROUND
    // -------------------------------------------------------------------------
    addWaterPlane() {
        const geo = new THREE.PlaneGeometry(3000, 4980);
        const mat = this.geometryBuilder.materials.water;
        const water = new THREE.Mesh(geo, mat);
        water.rotation.x = -Math.PI / 2;
        water.position.y = -0.5;
        water.position.z = -2435;
        water.receiveShadow = true;
        this.scene.add(water);
    }

    addGroundPlane() {
        const geo = new THREE.BoxGeometry(3000, 2, 5020);
        const mat = this.geometryBuilder.materials.asphalt;
        const ground = new THREE.Mesh(geo, mat);
        ground.position.y = 0.5;
        ground.position.z = 2565;
        ground.receiveShadow = true;
        ground.castShadow = false;
        // Render ground before roads to reduce any remaining flicker.
        ground.renderOrder = -10;
        this.scene.add(ground);
    }

    // -------------------------------------------------------------------------
    // SEARCH & FOCUS
    // -------------------------------------------------------------------------

    // Procurar objeto por ID e focar a câmara
    searchAndFocus(searchTerm) {
        if (!searchTerm) return;

        const term = searchTerm.toLowerCase();

        // Procura nos objetos registados
        const target = this.objects.find(obj => {
            const data = obj.userData;
            return (
                (data.id && data.id.toString().toLowerCase() === term) ||
                (data.name && data.name.toLowerCase().includes(term)) ||
                (data.vesselName && data.vesselName.toLowerCase().includes(term))
            );
        });

        if (target) {
            // Usar a animação de voo para o centro do objeto
            const box = new THREE.Box3().setFromObject(target);
            const center = new THREE.Vector3();
            box.getCenter(center);

            this.flyToObject(center);

            // Opcional: Selecionar automaticamente para abrir o painel da US 3
            this.handleSelection(target);
            return true;
        }

        console.warn("Objeto não encontrado:", searchTerm);
        return false;
    }

    // US 5: Devolve lista de todos os nomes/IDs para sugestões
    getSearchableEntities() {
        return this.objects
            .filter(obj => obj.userData && obj.userData.isSelectableRoot)
            .map(obj => obj.userData.name || obj.userData.vesselName || obj.userData.id?.toString())
            .filter(name => name !== undefined);
    }

    // -------------------------------------------------------------------------
    // DOCKS
    // -------------------------------------------------------------------------
    buildDocks(docks) {
        docks.forEach(d => {
            const mesh = this.geometryBuilder.createDock(d);
            mesh.position.set(d.x, d.y, d.z);
            mesh.userData = { type: "Dock", ...d, isSelectableRoot: true };

            this.scene.add(mesh);
            this.objects.push(mesh);

            const label = this.geometryBuilder.createLabel(d.name);
            label.position.set(d.x, d.y + 30, d.z);
            this.scene.add(label);
        });
    }

    // -------------------------------------------------------------------------
    // STORAGE AREAS
    // -------------------------------------------------------------------------
    buildStorageAreas(areas) {
        areas.forEach(a => {
            const mesh =
                a.subtype === "Warehouse"
                    ? this.geometryBuilder.createWarehouse(a)
                    : this.geometryBuilder.createContainerYard(a);

            mesh.position.set(a.x, a.y, a.z);
            mesh.userData = { ...a, isSelectableRoot: true };

            this.scene.add(mesh);
            this.objects.push(mesh);

            const label = this.geometryBuilder.createLabel(a.name);
            label.position.set(a.x, a.y + a.height + 20, a.z);
            this.scene.add(label);
        });
    }

    // -------------------------------------------------------------------------
    // CONTAINERS
    // -------------------------------------------------------------------------
    buildContainers(containers) {
        containers.forEach(c => {
            const mesh = this.geometryBuilder.createContainer(c);
            mesh.position.set(c.x, c.y, c.z);
            mesh.userData = { type: "Container", ...c, isSelectableRoot: true };

            this.scene.add(mesh);
            this.objects.push(mesh);
        });
    }

    // -------------------------------------------------------------------------
    // RESOURCES
    // -------------------------------------------------------------------------
    buildResources(resources) {
        resources.forEach(r => {
            const mesh = this.geometryBuilder.createResource(r);
            mesh.position.set(r.x, r.y, r.z);
            mesh.userData = { type: "resource", ...r, isSelectableRoot: true };

            this.scene.add(mesh);
            this.objects.push(mesh);
        });
    }

    // -------------------------------------------------------------------------
    // VESSELS
    // -------------------------------------------------------------------------
    buildVessels(vessels) {
        vessels.forEach(v => {
            const mesh = this.geometryBuilder.createVessel(v);
            mesh.position.set(v.x, v.y, v.z);
            mesh.userData = { type: "Vessel", ...v, isSelectableRoot: true };

            this.scene.add(mesh);
            this.objects.push(mesh);

            const label = this.geometryBuilder.createLabel(v.name);
            label.position.set(v.x, v.y + v.height + 20, v.z);
            this.scene.add(label);
        });
    }

    // -------------------------------------------------------------------------
    // STAFF
    // -------------------------------------------------------------------------
    buildStaff(staffList) {
        staffList.forEach(s => {
            const mesh = this.geometryBuilder.createStaff(s);
            mesh.position.set(s.x, s.y, s.z);
            mesh.userData = { type: "Staff", ...s, isSelectableRoot: true };

            this.scene.add(mesh);
            this.objects.push(mesh);
        });
    }

    // -------------------------------------------------------------------------
    // NEW: ROADS & SIDEWALKS
    // -------------------------------------------------------------------------
    buildRoads(roads, intersections) {
        if (!roads) return;

        // Identificamos a estrada horizontal que está no centro (z próximo de 2565)
        const filteredRoads = roads.filter(r => {
            if (r.orientation === "horizontal") {
                const isMiddle = Math.abs(r.z - 2565) < 100;
                return !isMiddle;
            }
            return true;
        });

        const roadW_Fixed = 80;
        const sidewalkW_Fixed = 8;
        const lightInterval = 130;
        const eps = 1e-6;

        const overlaps1D = (aMin, aMax, bMin, bMax) => (aMax >= bMin - eps) && (bMax >= aMin - eps);

        const getSidewalkExclusions = (r) => {
            if (!intersections || !intersections.length) return [];
            const halfW = r.orientation === "horizontal" ? r.width / 2 : roadW_Fixed / 2;
            const halfD = r.orientation === "horizontal" ? roadW_Fixed / 2 : r.depth / 2;
            const roadXMin = r.x - halfW; const roadXMax = r.x + halfW;
            const roadZMin = r.z - halfD; const roadZMax = r.z + halfD;

            const intervals = [];
            for (const i of intersections) {
                const ih = roadW_Fixed / 2;
                const iXMin = i.x - ih; const iXMax = i.x + ih;
                const iZMin = i.z - ih; const iZMax = i.z + ih;
                if (r.orientation === "horizontal") {
                    if (overlaps1D(roadZMin, roadZMax, iZMin, iZMax) && overlaps1D(roadXMin, roadXMax, iXMin, iXMax))
                        intervals.push({ start: (iXMin - r.x), end: (iXMax - r.x) });
                } else {
                    if (overlaps1D(roadXMin, roadXMax, iXMin, iXMax) && overlaps1D(roadZMin, roadZMax, iZMin, iZMax))
                        intervals.push({ start: (iZMin - r.z), end: (iZMax - r.z) });
                }
            }
            intervals.sort((a, b) => a.start - b.start);
            const merged = [];
            for (const iv of intervals) {
                if (!merged.length) { merged.push({ ...iv }); continue; }
                const last = merged[merged.length - 1];
                if (iv.start <= last.end + 2) last.end = Math.max(last.end, iv.end);
                else merged.push({ ...iv });
            }
            return merged;
        };

        const buildAllowedSegments = (totalLen, exclusions, margin = 1) => {
            const half = totalLen / 2; const allowed = []; const clamp = (v) => Math.max(-half, Math.min(half, v));
            const ex = (exclusions || []).map(iv => ({ start: clamp(iv.start - margin), end: clamp(iv.end + margin) })).filter(iv => iv.end > iv.start);
            if (!ex.length) return [{ center: 0, length: totalLen }];
            let cursor = -half;
            for (const iv of ex) {
                if (iv.start > cursor + 1e-3) {
                    const len = iv.start - cursor;
                    if (len > 2) allowed.push({ center: (cursor + iv.start) / 2, length: len });
                }
                cursor = Math.max(cursor, iv.end);
            }
            if (half > cursor + 1e-3) {
                const len = half - cursor;
                if (len > 2) allowed.push({ center: (cursor + half) / 2, length: len });
            }
            return allowed;
        };

        // 1. DESENHAR ESTRADAS E PASSEIOS LATERAIS
        filteredRoads.forEach(r => {
            const finalW = r.orientation === "horizontal" ? r.width : roadW_Fixed;
            const finalD = r.orientation === "horizontal" ? roadW_Fixed : r.depth;
            const roadMesh = this.geometryBuilder.createRoadSegment(finalW, finalD);
            roadMesh.position.set(r.x, 1.75, r.z);
            roadMesh.userData = { type: "Road", isSelectableRoot: true };
            this.scene.add(roadMesh);
            this.objects.push(roadMesh);

            const ex = getSidewalkExclusions(r);
            const allowed = buildAllowedSegments(r.orientation === "horizontal" ? r.width : r.depth, ex, 5);

            allowed.forEach(seg => {
                const start = seg.center - seg.length / 2;
                const end = seg.center + seg.length / 2;

                // Linha Central e Faixas...
                const centerLine = r.orientation === "horizontal"
                    ? this.geometryBuilder.createLaneLine(seg.length, 1.5)
                    : this.geometryBuilder.createLaneLine(1.5, seg.length);
                centerLine.position.set(
                    r.orientation === "horizontal" ? r.x + seg.center : r.x,
                    1.925,
                    r.orientation === "horizontal" ? r.z : r.z + seg.center
                );
                this.scene.add(centerLine);

                const laneOffset = roadW_Fixed / 4;
                [laneOffset, -laneOffset].forEach(offset => {
                    let cursor = start;
                    while (cursor < end - 1e-3) {
                        const dLen = Math.min(10, end - cursor);
                        if (dLen > 1) {
                            const dash = r.orientation === "horizontal"
                                ? this.geometryBuilder.createLaneLine(dLen, 0.8)
                                : this.geometryBuilder.createLaneLine(0.8, dLen);
                            const posX = r.orientation === "horizontal" ? r.x + cursor + dLen / 2 : r.x + offset;
                            const posZ = r.orientation === "horizontal" ? r.z + offset : r.z + cursor + dLen / 2;
                            dash.position.set(posX, 1.92, posZ);
                            this.scene.add(dash);
                        }
                        cursor += 25;
                    }
                });

                // Candeeiros...
                let lightCursor = start + 20;
                while (lightCursor < end - 20) {
                    const sideOff = roadW_Fixed / 2 + 3;
                    [sideOff, -sideOff].forEach(sOff => {
                        const lp = this.geometryBuilder.createStreetLight();
                        const lx = r.orientation === "horizontal" ? r.x + lightCursor : r.x + sOff;
                        const lz = r.orientation === "horizontal" ? r.z + sOff : r.z + lightCursor;
                        lp.position.set(lx, 2, lz);
                        this.scene.add(lp);
                        this.objects.push(lp);
                    });
                    lightCursor += lightInterval;
                }
            });

            // Passeios das Estradas
            const zOff = roadW_Fixed / 2 + sidewalkW_Fixed / 2;
            allowed.forEach(seg => {
                if (r.orientation === "horizontal") {
                    const swTop = this.geometryBuilder.createSidewalk(seg.length, sidewalkW_Fixed);
                    swTop.position.set(r.x + seg.center, 1.755, r.z + zOff);
                    this.scene.add(swTop);
                    const swBot = this.geometryBuilder.createSidewalk(seg.length, sidewalkW_Fixed);
                    swBot.position.set(r.x + seg.center, 1.755, r.z - zOff);
                    this.scene.add(swBot);
                } else {
                    const swR = this.geometryBuilder.createSidewalk(sidewalkW_Fixed, seg.length);
                    swR.position.set(r.x + zOff, 1.755, r.z + seg.center);
                    this.scene.add(swR);
                    const swL = this.geometryBuilder.createSidewalk(sidewalkW_Fixed, seg.length);
                    swL.position.set(r.x - zOff, 1.755, r.z + seg.center);
                    this.scene.add(swL);
                }
            });
        });

        // 2. CRUZAMENTOS, PASSADEIRAS E UNIÃO DE PASSEIOS
        if (intersections) {
            intersections.forEach(i => {
                if (Math.abs(i.z - 2565) < 100) return;

                // Cruzamento Base
                const interMesh = this.geometryBuilder.createIntersection(roadW_Fixed);
                interMesh.position.set(i.x, 1.9, i.z);
                this.scene.add(interMesh);
                this.objects.push(interMesh);

                // --- NOVO: UNIÃO DOS PASSEIOS NOS CANTOS ---
                const cornerDist = roadW_Fixed / 2 + sidewalkW_Fixed / 2;
                const corners = [
                    { x: cornerDist, z: cornerDist },   // SE
                    { x: cornerDist, z: -cornerDist },  // NE
                    { x: -cornerDist, z: cornerDist },  // SW
                    { x: -cornerDist, z: -cornerDist }  // NW
                ];

                corners.forEach(pos => {
                    const cornerSw = this.geometryBuilder.createSidewalk(sidewalkW_Fixed, sidewalkW_Fixed);
                    cornerSw.position.set(i.x + pos.x, 1.755, i.z + pos.z);
                    this.scene.add(cornerSw);
                });
                // -------------------------------------------

                // Passadeiras (Zebra)
                const ih = roadW_Fixed / 2;
                const zebraL = 15;
                const addZebra = (rotY, cx, cz) => {
                    const stripeCount = 13;
                    for (let k = 0; k < stripeCount; k++) {
                        const step = (k - (stripeCount - 1) / 2) * 6;
                        const stripe = this.geometryBuilder.createCrosswalkStripe(zebraL, 2.5);
                        stripe.rotation.y = rotY;
                        stripe.position.set(cx + (rotY === 0 ? 0 : step), 1.93, cz + (rotY === 0 ? step : 0));
                        this.scene.add(stripe);
                    }
                };

                const zebraOff = ih + 12;
                addZebra(Math.PI / 2, i.x, i.z - zebraOff);
                addZebra(Math.PI / 2, i.x, i.z + zebraOff);
                addZebra(0, i.x + zebraOff, i.z);
                addZebra(0, i.x - zebraOff, i.z);
            });
        }
    }

    // -------------------------------------------------------------------------
    // CAMERA TARGET RESET
    // -------------------------------------------------------------------------
    frameCamera() {

        // Ativar o estado de animação 
        this.flyToActive = true;
        this.flyStartTime = performance.now();

        // Definir a Origem
        this.flyFromPos.copy(this.camera.position);
        this.flyFromTarget.copy(this.controls.target);

        // Definir o Destino
        this.flyToPos.set(0, 350, 1200);
        this.flyToTarget.set(0, 0, 650); // Olhar para o meio do porto
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    // -------------------------------------------------------------------------
    // ANIMATION LOOP
    // -------------------------------------------------------------------------
    animate() {
        if (!this.renderer) return;

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
        this.updateSpotlight(deltaSec);

        // Renderização principal
        this.renderer.setViewport(0, 0, this.container.clientWidth, this.container.clientHeight);
        this.renderer.setScissorTest(false);
        this.renderer.render(this.scene, this.camera);

        this.updateMinimap();

        // Renderização do Minimapa (Scissor test)
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

        const speed = 1 / this.dayDurationSeconds;
        this.timeOfDay = (this.timeOfDay + deltaSec * speed) % 1;
        const t = this.timeOfDay;

        const angle = -t * Math.PI * 2;
        const southTilt = 0.25;
        const h = Math.sin(angle); // h > 0 é dia, h < 0 é noite

        const radius = 5500;
        const y = h * radius;
        const z = -Math.cos(angle) * radius;
        const x = h * radius * southTilt;

        this.sun.position.set(0, y, z);
        this.sunMesh.position.copy(this.sun.position);
        this.sunMesh.visible = true;

        this.sun.target.position.set(0, 0, 0);
        this.sun.target.updateMatrixWorld();

        const twilight = 0.2;
        let lightFactor;

        if (h <= -twilight) {
            lightFactor = 0;
        } else if (h >= twilight) {
            lightFactor = 1;
        } else {
            const u = (h + twilight) / (2 * twilight);
            lightFactor = u * u * (3 - 2 * u);
        }

        // --- LÓGICA DOS CANDEEIROS COM TIMING AJUSTADO ---
        // Alteramos o limite de 0.1 para 0.8:
        // 1. Ao pôr-do-sol: Ligam quando a luz desce dos 80% (Sol a chegar ao mar)
        // 2. Ao nascer-do-sol: Apagam apenas quando a luz passa dos 80% (Sol já bem acima da terra)
        const isNight = lightFactor < 0.8;

        this.scene.traverse(obj => {
            // Luz PointLight (o clarão no asfalto)
            if (obj instanceof THREE.PointLight && obj.userData.isNightLight) {
                obj.intensity = isNight ? 1.3 : 0;
            }

            // Brilho da bola (lâmpada visual)
            if (obj.isMesh && obj.userData.isNightBulb) {
                if (isNight) {
                    obj.material.emissive.setHex(0xffffaa);
                    obj.material.emissiveIntensity = 1.0;
                } else {
                    obj.material.emissive.setHex(0x000000);
                    obj.material.emissiveIntensity = 0;
                }
            }
        });
        // -------------------------------------------------

        const dist = this.camera.position.distanceTo(this.sunMesh.position);
        if (dist > 0) {
            const baseSize = 100;
            const apparentSize = 0.2;
            const scale = (dist * apparentSize) / baseSize;
            this.sunMesh.scale.setScalar(scale);
        }

        this.sunMesh.lookAt(this.camera.position);
        this.sun.intensity = 0.2 + 0.8 * lightFactor;

        const minAmbient = 0.35;
        const maxAmbient = 0.6;
        this.ambientLight.intensity = minAmbient + (maxAmbient - minAmbient) * lightFactor;

        const daylightColor = this.dayAmbientColor || new THREE.Color(0xffffff);
        const moonColor = this.nightAmbientColor || new THREE.Color(0x4d6f9a);

        const ambientColor = new THREE.Color();
        ambientColor.lerpColors(moonColor, daylightColor, lightFactor);
        this.ambientLight.color.copy(ambientColor);

        if (this.hemiLight) {
            this.hemiLight.intensity = 0.4 * (1 - lightFactor);
        }

        const skyColor = new THREE.Color();
        skyColor.lerpColors(this.nightSkyColor, this.daySkyColor, lightFactor);
        this.scene.background = skyColor;

        // Sincronizar o nevoeiro (Fog) com a cor do céu
        if (this.scene.fog) {
            this.scene.fog.color.copy(skyColor);
        }
    }

    // -------------------------------------------------------------------------
    // DISPOSE
    // -------------------------------------------------------------------------
    dispose() {
        window.removeEventListener('keydown', this._keydownHandler);
        this.clearScene();
        this.hideTooltip();
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer.domElement.remove();
        }
        this.renderer = null;
    }
}

window.PortVisualization = PortVisualization;

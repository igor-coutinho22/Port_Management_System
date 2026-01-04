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

        this.selectionSpotlight = new THREE.SpotLight(0xffffff, 0); // Intensidade inicial 0
        this.selectionSpotlight.penumbra = 1; // CA: Penumbra suave para transição clara
        this.selectionSpotlight.angle = Math.PI / 50; // Foco concentrado
        this.selectionSpotlight.distance = 2500;
        this.selectionSpotlight.castShadow = true;

        this.scene.add(this.selectionSpotlight);
        this.scene.add(this.selectionSpotlight.target);

        // Fly-To animation state
        this.flyToActive = false;
        this.flyStartTime = 0;
        this.flyDuration = 1000;
        this.flyFromPos = new THREE.Vector3();
        this.flyFromTarget = new THREE.Vector3();
        this.flyToPos = new THREE.Vector3();
        this.flyToTarget = new THREE.Vector3();

        this.flyFromSpotlightTarget = new THREE.Vector3();
        this.flyToSpotlightTarget = new THREE.Vector3();

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
            const key = e.key.toLowerCase();
            if (e.key.toLowerCase() === 'i' && typeof this.onToggleOverlay === 'function') {
                this.onToggleOverlay();
            }

            if (key === 'r') {
                console.log("Reset disparado por tecla");
                this.frameCamera();
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
        console.log("PortVisualization: loadPortData called");
        this.clearScene();
        this.addWaterPlane();
        this.addGroundPlane();

        try {
            const data = await this.dataFetcher.loadAll();
            console.log("PortVisualization: Data fetched", data);

            if (data.textureConfig) {
                this.geometryBuilder.loadTextures(data.textureConfig);
            }

            if (data.modelConfig) {
                await this.geometryBuilder.loadModels(data.modelConfig);
            }

            const layout = this.layoutEngine.computeLayout(data);
            console.log("PortVisualization: Layout computed", layout);

            this.buildDocks(layout.docks);
            this.buildStorageAreas(layout.storageAreas);
            this.buildContainers(layout.containers);
            this.buildResources(layout.resources);
            this.buildVessels(layout.vessels);
            this.buildStaff(layout.staff);

            // NEW: build roads and intersections after main objects
            this.buildRoads(layout.roads, layout.intersections);

            console.log("PortVisualization: Scene built with objects", this.objects.length);

            this.frameCamera();
        } catch (err) {
            console.error("Error loading port data:", err);
        }
    }

    // -------------------------------------------------------------------------
    // CAMERA FLY-TO
    // -------------------------------------------------------------------------
    
    flyToObject(pos) {
        this.flyToActive = true;
        this.flyStartTime = performance.now();

        this.flyFromPos.copy(this.camera.position);
        this.flyFromTarget.copy(this.controls.target);

        // US 4.2.6: Captura a posição inicial do alvo do foco
        if (this.selectionSpotlight) {
            this.flyFromSpotlightTarget.copy(this.selectionSpotlight.target.position);
        }

        this.flyToTarget.set(pos.x, pos.y, pos.z);
        this.flyToPos.set(pos.x + 180, pos.y + 120, pos.z + 180);

        // US 4.2.6: O destino do foco é o centro do objeto (pos)
        this.flyToSpotlightTarget.set(pos.x, pos.y, pos.z);
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

        // US 4.2.6: Interpolação suave do alvo do Spotlight
        if (this.selectionSpotlight) {
            this.selectionSpotlight.target.position.lerpVectors(
                this.flyFromSpotlightTarget, 
                this.flyToSpotlightTarget, 
                eased
            );
            this.selectionSpotlight.target.updateMatrixWorld();
        }

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

        // Lógica original de emissive (limpeza)
        if (this.selectedObject) {
            this.selectedObject.traverse(child => {
                if (child.isMesh && child.material?.emissive) child.material.emissive.setHex(0x000000);
            });
        }

        this.selectedObject = targetEntity;

        // Lógica original de emissive (destaque)
        targetEntity.traverse(child => {
            if (child.isMesh && child.material?.emissive) {
                child.material.emissive.setHex(0x333333);
            }
        });

        if (this.selectionSpotlight) {
            // Apenas ativamos a luz aqui. O movimento da posição 
            // será feito suavemente pelo updateFlyTo().
            this.selectionSpotlight.intensity = 3.0; 
        }

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
    // Adiciona este método à classe PortVisualization no teu ficheiro .js
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

        const eps = 1e-6;

        const overlaps1D = (aMin, aMax, bMin, bMax) => (aMax >= bMin - eps) && (bMax >= aMin - eps);

        // Given a road, return exclusion intervals along the road axis (in local units from road center)
        // where sidewalks must NOT be drawn (the intersection square).
        const getSidewalkExclusions = (r) => {
            if (!intersections || !intersections.length) return [];

            const halfW = r.width / 2;
            const halfD = r.depth / 2;

            const roadXMin = r.x - halfW;
            const roadXMax = r.x + halfW;
            const roadZMin = r.z - halfD;
            const roadZMax = r.z + halfD;

            const intervals = [];
            for (const i of intersections) {
                const ih = (i.size || 0) / 2;
                const iXMin = i.x - ih;
                const iXMax = i.x + ih;
                const iZMin = i.z - ih;
                const iZMax = i.z + ih;

                // Only consider intersections that overlap the road rectangle in the perpendicular axis.
                // For horizontal roads, we exclude along X when Z overlaps. For vertical, exclude along Z when X overlaps.
                if (r.orientation === "horizontal") {
                    if (!overlaps1D(roadZMin, roadZMax, iZMin, iZMax)) continue;
                    if (!overlaps1D(roadXMin, roadXMax, iXMin, iXMax)) continue;
                    // convert to local interval along X relative to road center
                    intervals.push({ start: (iXMin - r.x), end: (iXMax - r.x) });
                } else {
                    if (!overlaps1D(roadXMin, roadXMax, iXMin, iXMax)) continue;
                    if (!overlaps1D(roadZMin, roadZMax, iZMin, iZMax)) continue;
                    // convert to local interval along Z relative to road center
                    intervals.push({ start: (iZMin - r.z), end: (iZMax - r.z) });
                }
            }

            if (!intervals.length) return [];

            // Merge overlaps
            intervals.sort((a, b) => a.start - b.start);
            const merged = [];
            for (const iv of intervals) {
                if (!merged.length) { merged.push({ ...iv }); continue; }
                const last = merged[merged.length - 1];
                if (iv.start <= last.end + 2) {
                    last.end = Math.max(last.end, iv.end);
                } else {
                    merged.push({ ...iv });
                }
            }
            return merged;
        };

        // Build sidewalk segments along a 1D axis, excluding merged intervals.
        // Returns [{ center, length }] in road-local coordinates.
        const buildAllowedSegments = (totalLen, exclusions, margin = 1) => {
            const half = totalLen / 2;
            const allowed = [];

            const clamp = (v) => Math.max(-half, Math.min(half, v));
            const ex = (exclusions || []).map(iv => ({
                start: clamp(iv.start - margin),
                end: clamp(iv.end + margin)
            })).filter(iv => iv.end > iv.start);

            if (!ex.length) {
                return [{ center: 0, length: totalLen }];
            }

            let cursor = -half;
            for (const iv of ex) {
                if (iv.start > cursor + 1e-3) {
                    const segStart = cursor;
                    const segEnd = iv.start;
                    const len = segEnd - segStart;
                    if (len > 2) allowed.push({ center: (segStart + segEnd) / 2, length: len });
                }
                cursor = Math.max(cursor, iv.end);
            }
            if (half > cursor + 1e-3) {
                const len = half - cursor;
                if (len > 2) allowed.push({ center: (cursor + half) / 2, length: len });
            }
            return allowed;
        };

        roads.forEach(r => {
            const roadMesh = this.geometryBuilder.createRoadSegment(r.width, r.depth);
            // Place roads slightly above the ground plane to avoid z-fighting
            roadMesh.position.set(r.x, 1.75, r.z);
            roadMesh.renderOrder = 10;
            roadMesh.userData = { type: "Road", orientation: r.orientation, isSelectableRoot: true };
            this.scene.add(roadMesh);
            this.objects.push(roadMesh);

            // -----------------------------
            // Road markings (dashed centerline, clipped near intersections)
            // -----------------------------
            const markY = 1.92;
            const dashLen = 10;
            const dashGap = 10;
            const centerLineW = 1.6;
            const clipMargin = 10;

            const ex = getSidewalkExclusions(r);
            // reuse exclusion intervals (intersection squares) to clip dashed line too
            const buildAllowed = buildAllowedSegments(
                r.orientation === "horizontal" ? r.width : r.depth,
                ex,
                clipMargin
            );

            const addDashed = (seg) => {
                // seg: {center, length} along the road axis in local space
                const start = seg.center - seg.length / 2;
                const end = seg.center + seg.length / 2;
                let cursor = start;
                while (cursor < end - 1e-3) {
                    const len = Math.min(dashLen, end - cursor);
                    if (len > 1) {
                        if (r.orientation === "horizontal") {
                            const dash = this.geometryBuilder.createLaneLine(len, centerLineW);
                            dash.position.set(r.x + (cursor + len / 2), markY, r.z);
                            dash.renderOrder = 30;
                            dash.userData = { type: "RoadMarking", kind: "center-dash" };
                            this.scene.add(dash);
                        } else {
                            const dash = this.geometryBuilder.createLaneLine(centerLineW, len);
                            dash.position.set(r.x, markY, r.z + (cursor + len / 2));
                            dash.renderOrder = 30;
                            dash.userData = { type: "RoadMarking", kind: "center-dash" };
                            this.scene.add(dash);
                        }
                    }
                    cursor += dashLen + dashGap;
                }
            };

            buildAllowed.forEach(addDashed);

            const sidewalkThickness = this.layoutEngine.sidewalkDepth;

            // Sidewalks need a larger cut-out than the asphalt/intersection square.
            // Otherwise the horizontal and vertical sidewalks will stop at slightly different
            // places (since each road sees the intersection from a different axis).
            // Expanding by half the sidewalk width makes the corner join consistently.
            const sidewalkCornerCut = (i) => ((i.size || 0) / 2) + (sidewalkThickness / 2);

            const exclusions = (ex || []).map(iv => ({ ...iv }));
            const allowed = buildAllowedSegments(
                r.orientation === "horizontal" ? r.width : r.depth,
                exclusions,
                sidewalkThickness / 2
            );

            if (r.orientation === "horizontal") {
                const zTop = r.z + r.depth / 2 + sidewalkThickness / 2;
                const zBot = r.z - r.depth / 2 - sidewalkThickness / 2;

                allowed.forEach(seg => {
                    const swTop = this.geometryBuilder.createSidewalk(seg.length+12, sidewalkThickness);
                    swTop.position.set(r.x + seg.center, 1.755, zTop);
                    swTop.renderOrder = 15;
                    swTop.userData = { type: "Sidewalk" };
                    this.scene.add(swTop);

                    const swBot = this.geometryBuilder.createSidewalk(seg.length+12, sidewalkThickness);
                    swBot.position.set(r.x + seg.center, 1.755, zBot);
                    swBot.renderOrder = 15;
                    swBot.userData = { type: "Sidewalk" };
                    this.scene.add(swBot);
                });
            } else {
                const xRight = r.x + r.width / 2 + sidewalkThickness / 2;
                const xLeft = r.x - r.width / 2 - sidewalkThickness / 2;

                allowed.forEach(seg => {
                    const swR = this.geometryBuilder.createSidewalk(sidewalkThickness, seg.length+12);
                    swR.position.set(xRight, 1.755, r.z + seg.center);
                    swR.renderOrder = 15;
                    swR.userData = { type: "Sidewalk" };
                    this.scene.add(swR);

                    const swL = this.geometryBuilder.createSidewalk(sidewalkThickness, seg.length+11.8);
                    swL.position.set(xLeft, 1.755, r.z + seg.center);
                    swL.renderOrder = 15;
                    swL.userData = { type: "Sidewalk" };
                    this.scene.add(swL);
                });
            }
        });

        if (!intersections) return;

        intersections.forEach(i => {
            const interMesh = this.geometryBuilder.createIntersection(i.size);
            // Place intersections slightly above roads so they render on top and avoid z-fighting
            interMesh.position.set(i.x, 1.9, i.z);
            interMesh.renderOrder = 20;
            interMesh.userData = { type: "Intersection" };
            this.scene.add(interMesh);
            this.objects.push(interMesh);

            // -----------------------------
            // Crosswalks (realistic: zebra stripes placed OUTSIDE the intersection)
            // Each crosswalk is perpendicular to the approaching traffic.
            // Also include a stop bar just before the crosswalk.
            // -----------------------------
            const markY = 1.93;
            const ih = ((i.size || 0) + 20) / 2;

            // Dimensions tuned for this scene scale.
            // Crosswalk should fit within road width (between sidewalks) and sit close to the corner.
            const roadW = this.layoutEngine.roadDepth;
            const sidewalkW = this.layoutEngine.sidewalkDepth;

            const zebraStripeW = 2.5; // stripe thickness (along travel direction)
            const zebraGap = 4;     // space between stripes (along travel direction)
            const zebraCount = 6;

            // Crosswalk length along curb (across the road). Keep it inside the asphalt (avoid sidewalks).
            const zebraStripeL = Math.max(6, Math.min(roadW - 12, i.size * 0.55));

            // Place crosswalk just OUTSIDE the intersection and keep stop bar a bit before it.
            // Push crosswalk farther from the intersection than the curb line.
            const cornerMargin = 10.0;
            const crosswalkOffset = ih + (sidewalkW / 2) + cornerMargin;

            // Stop bar should be before the crosswalk (approach side).
            const stopBarOffset = crosswalkOffset - (zebraStripeW + 20);
            const stopBarW = 2;
            const stopBarL = zebraStripeL + 20;

            const addStopBar = (rotY, x, z) => {
                const bar = this.geometryBuilder.createLaneLine(stopBarL, stopBarW);
                bar.position.set(x, markY, z);
                bar.rotation.y = rotY;
                bar.renderOrder = 34;
                bar.userData = { type: "RoadMarking", kind: "stopbar" };
                this.scene.add(bar);
            };

            const addZebra = (rotY, cx, cz) => {
                for (let k = 0; k < zebraCount; k++) {
                    const offset = (k - (zebraCount - 1) / 2) * (zebraStripeW + zebraGap);
                    const stripe = this.geometryBuilder.createCrosswalkStripe(zebraStripeL, zebraStripeW);
                    stripe.position.set(cx, markY, cz);
                    stripe.rotation.y = rotY;
                    stripe.renderOrder = 35;
                    stripe.userData = { type: "RoadMarking", kind: "crosswalk" };

                    // Offset along the axis perpendicular to crosswalk direction
                    if (Math.abs(rotY) < 1e-6) {
                        // crosswalk runs along X => offset along Z
                        stripe.position.z += offset;
                    } else {
                        // crosswalk runs along Z => offset along X
                        stripe.position.x += offset;
                    }

                    this.scene.add(stripe);
                }
            };

            const offsets = [
                { x: -i.size - 5, z: -i.size - 5 },
                { x: i.size + 5, z: -i.size - 5 },
                { x: -i.size - 5, z: i.size + 5 },
                { x: i.size + 5, z: i.size + 5 }
            ];

            offsets.forEach(offset => {
                const lightPost = this.geometryBuilder.createStreetLight();
                lightPost.position.set(i.x + offset.x, 2, i.z + offset.z);
                this.scene.add(lightPost);
                // Não esquecer de adicionar ao array de objetos se quiseres que sejam clicáveis
                this.objects.push(lightPost); 
            });

            // Crosswalk stripes should be PERPENDICULAR to the direction of travel.
            // - Traffic along Z (north/south approaches) => crosswalk runs along X? No: stripes should run along Z,
            //   so the crosswalk plate is rotated 90°.
            // - Traffic along X (east/west approaches) => rotate 0°.

            // North approach (traffic moving +Z toward intersection)
            addStopBar(0, i.x, i.z + stopBarOffset);
            addZebra(Math.PI / 2, i.x, i.z + crosswalkOffset);

            // South approach (traffic moving -Z)
            addStopBar(0, i.x, i.z - stopBarOffset);
            addZebra(Math.PI / 2, i.x, i.z - crosswalkOffset);

            // East approach (traffic moving +X)
            addStopBar(Math.PI / 2, i.x + stopBarOffset, i.z);
            addZebra(0, i.x + crosswalkOffset, i.z);

            // West approach (traffic moving -X)
            addStopBar(Math.PI / 2, i.x - stopBarOffset, i.z);
            addZebra(0, i.x - crosswalkOffset, i.z);
        });
    }

    // -------------------------------------------------------------------------
    // CAMERA TARGET RESET
    // -------------------------------------------------------------------------
    frameCamera() {
        console.log("PortVisualization: Executando reset suave da câmara");
    
        // Ativar o estado de animação 
        this.flyToActive = true;
        this.flyStartTime = performance.now();

        // Definir a Origem
        this.flyFromPos.copy(this.camera.position);
        this.flyFromTarget.copy(this.controls.target);

        // Definir o Destino
        this.flyToPos.set(0, 300, 1100); 
        this.flyToTarget.set(0, 0, 600); // Olhar para o meio do porto
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

        // 4.2.5: Spotlight segue a câmara ---
        if (this.selectionSpotlight) {
            this.selectionSpotlight.position.copy(this.camera.position);
        }

        const minY = 5;
        if (this.camera.position.y < minY) {
            this.camera.position.y = minY;
        }

        const time = now * 0.0001;

        this.updateWater(time);
        this.updateSun(deltaSec);

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
        const h = Math.sin(angle);

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
        this.ambientLight.intensity =
            minAmbient + (maxAmbient - minAmbient) * lightFactor;

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

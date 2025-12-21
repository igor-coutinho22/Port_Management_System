class PortGeometryBuilder {

    constructor() {
        // Default materials (fallback)
        this.materials = {
            dock: new THREE.MeshStandardMaterial({ color: 0x888888 }),
            dockSide: new THREE.MeshStandardMaterial({ color: 0x666666 }),
            yardSurface: new THREE.MeshStandardMaterial({ color: 0x555555 }),
            container: [
                new THREE.MeshStandardMaterial({ color: 0xAA0000 }),
                new THREE.MeshStandardMaterial({ color: 0x00AA00 }),
                new THREE.MeshStandardMaterial({ color: 0x0000AA }),
                new THREE.MeshStandardMaterial({ color: 0xAAAA00 })
            ],
            warehouseWall: new THREE.MeshStandardMaterial({ color: 0xFF0000 }),
            warehouseRoof: new THREE.MeshStandardMaterial({ color: 0xFFFFFF }),
            craneBody: new THREE.MeshStandardMaterial({ color: 0xFFD700 }),
            vehicleBody: new THREE.MeshStandardMaterial({ color: 0x607D8B }),
            vesselHull: new THREE.MeshStandardMaterial({ color: 0xAAAAAA }),
            vesselBridge: new THREE.MeshStandardMaterial({ color: 0xEEEEEE }),
            staffBody: new THREE.MeshStandardMaterial({ color: 0xFFA500 }),
            water: new THREE.MeshStandardMaterial({ color: 0x006994 }),
            asphalt: new THREE.MeshStandardMaterial({ color: 0xCCCCCC }),

            // Sun: unlit textured quad
            sun: new THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide
            }),

            // New: sidewalks
            sidewalk: new THREE.MeshStandardMaterial({ color: 0x999999 })
        };

        // Dedicated asphalt for roads (clone of ground asphalt) so polygonOffset doesn't affect the ground.
        // IMPORTANT: Ground uses `materials.asphalt` as-is.
        this.materials.roadAsphalt = this.materials.asphalt.clone();

        // Roads should read as darker asphalt than the base ground slab.
        // If a texture map is applied later, this color still works as a multiplier/tint.
        this.materials.roadAsphalt.color.setHex(0x4B4B4B);

        this.materials.roadAsphalt.polygonOffset = true;
        // Pull roads slightly closer to camera in depth comparison to avoid z-fighting
        this.materials.roadAsphalt.polygonOffsetFactor = -4;
        this.materials.roadAsphalt.polygonOffsetUnits = -4;

        // Road markings (lane lines / crosswalks)
        // Keep them as simple flat overlays with strong polygonOffset so they never flicker.
        this.materials.roadMarking = new THREE.MeshStandardMaterial({
            color: 0xF2F2F2,
            roughness: 0.6,
            metalness: 0.0
        });
        this.materials.roadMarking.polygonOffset = true;
        this.materials.roadMarking.polygonOffsetFactor = -8;
        this.materials.roadMarking.polygonOffsetUnits = -8;

        this.textureLoader = new THREE.TextureLoader();
        this.gltfLoader = new THREE.GLTFLoader();

        // key -> THREE.Object3D (root scene)
        this.models = {};
        // key -> { url, transform, ... } from models.json
        this.modelDefs = {};
    }

    // -------------------------------------------------------------------------
    // TEXTURE LOADING
    // -------------------------------------------------------------------------
    loadTextures(config) {
        if (!config || !config.materials) return;

        const loadMat = (matName, diffuse, targetMat, repeatA, repeatB) => {
            const conf = config.materials[matName];
            if (!conf) return;

            if (conf.colorMap && diffuse) {
                this.textureLoader.load(conf.colorMap, (tex) => {

                    // SPECIAL CASE: SUN PNG (alpha + no tiling + correct color)
                    if (matName === "sun") {
                        tex.encoding = THREE.sRGBEncoding;
                        tex.wrapS = THREE.ClampToEdgeWrapping;
                        tex.wrapT = THREE.ClampToEdgeWrapping;
                        tex.minFilter = THREE.LinearMipmapLinearFilter;
                        tex.magFilter = THREE.LinearFilter;
                        tex.generateMipmaps = true;

                        targetMat.map = tex;
                        targetMat.needsUpdate = true;
                        return;
                    }

                    tex.wrapS = THREE.RepeatWrapping;
                    tex.wrapT = THREE.RepeatWrapping;
                    tex.colorSpace = THREE.SRGBColorSpace;
                    tex.anisotropy = 8;
                    targetMat.map = tex;
                    targetMat.needsUpdate = true;
                    if (repeatA || repeatB) {
                        targetMat.map.repeat.set(repeatA || 0, repeatB || 0);
                    }
                });
            }

            if (conf.normalMap && !diffuse) {
                this.textureLoader.load(conf.normalMap, (tex) => {
                    tex.wrapS = THREE.RepeatWrapping;
                    tex.wrapT = THREE.RepeatWrapping;
                    tex.colorSpace = THREE.NoColorSpace;
                    tex.anisotropy = 8;
                    targetMat.normalMap = tex;
                    targetMat.needsUpdate = true;
                    if (repeatA || repeatB) {
                        targetMat.normalMap.repeat.set(repeatA || 0, repeatB || 0);
                    }
                });
            }

            if (conf.roughness !== undefined) targetMat.roughness = conf.roughness;
            if (conf.metalness !== undefined) targetMat.metalness = conf.metalness;
        };

        // Apply to specific materials
        loadMat("concrete", true, this.materials.dock, null, null);
        loadMat("concrete", true, this.materials.yardSurface, null, null);

        loadMat("metal", true, this.materials.vesselHull, null, null);
        loadMat("metal", false, this.materials.vesselBridge, null, null);

        loadMat("metal", true, this.materials.craneBody, null, null);
        this.materials.container.forEach(c => loadMat("container", true, c, null, null));

        loadMat("water", true, this.materials.water, 500, 250);
        loadMat("metal", true, this.materials.warehouseRoof, null, null);
        loadMat("metal", false, this.materials.warehouseWall, null, null);
        loadMat("asphalt", true, this.materials.asphalt, 500, 250);

        // Sun texture
        loadMat("sun", true, this.materials.sun, null, null);
    }

    // -------------------------------------------------------------------------
    // MODEL LOADING (uses models.json)
    // -------------------------------------------------------------------------
    async loadModels(config) {
        if (!config || !config.models) return;

        this.modelDefs = config.models;

        const entries = Object.entries(config.models);
        const promises = entries.map(([key, def]) => {
            const url = def.url;
            if (!url) return Promise.resolve();

            return new Promise((resolve) => {
                this.gltfLoader.load(
                    url,
                    (gltf) => {
                        const scene = gltf.scene;
                        scene.traverse(obj => {
                            if (obj.isMesh) {
                                obj.castShadow = true;
                                obj.receiveShadow = true;
                            }
                        });
                        this.models[key] = scene;
                        resolve();
                    },
                    undefined,
                    (err) => {
                        console.error(`Failed to load model '${key}' from ${url}`, err);
                        resolve();
                    }
                );
            });
        });

        return Promise.all(promises);
    }

    // -------------------------------------------------------------------------
    // MODEL HELPERS
    // -------------------------------------------------------------------------
    cloneModel(key) {
        const src = this.models[key];
        if (!src) return null;

        const clone = src.clone(true);
        clone.traverse(obj => {
            if (obj.isMesh) {
                obj.castShadow = true;
                obj.receiveShadow = true;
            }
        });
        return clone;
    }

    fitModelToBox(object3D, targetWidth, targetHeight, targetDepth) {
        object3D.updateMatrixWorld(true);
        const box = new THREE.Box3().setFromObject(object3D);
        const size = new THREE.Vector3();
        box.getSize(size);

        if (size.x === 0 || size.y === 0 || size.z === 0) return;

        const scaleX = targetWidth / size.x;
        const scaleY = targetHeight / size.y;
        const scaleZ = targetDepth / size.z;

        const scale = Math.min(scaleX, scaleY, scaleZ);
        object3D.scale.setScalar(scale);

        // Re-center around (0,0,0)
        const center = new THREE.Vector3();
        box.getCenter(center);
        center.multiplyScalar(scale);
        object3D.position.sub(center);
    }

    applyModelTransformFromConfig(obj, key) {
        const tr = this.modelDefs?.[key]?.transform;
        if (!tr) return;

        // Rotations (radians)
        if (tr.rotateX !== undefined) obj.rotation.x += tr.rotateX;
        if (tr.rotateY !== undefined) obj.rotation.y += tr.rotateY;
        if (tr.rotateZ !== undefined) obj.rotation.z += tr.rotateZ;

        // Post-fit scale multiplier
        if (tr.scale !== undefined) obj.scale.multiplyScalar(tr.scale);

        // Local offsets
        if (tr.liftY !== undefined) obj.position.y += tr.liftY;
        if (tr.offsetX !== undefined) obj.position.x += tr.offsetX;
        if (tr.offsetZ !== undefined) obj.position.z += tr.offsetZ;
    }

    makeConfiguredInstance(key, fitW, fitH, fitD) {
        const model = this.cloneModel(key);
        if (!model) return null;

        this.fitModelToBox(model, fitW, fitH, fitD);
        this.applyModelTransformFromConfig(model, key);

        const wrapper = new THREE.Group();
        wrapper.add(model);
        return wrapper;
    }

    // -------------------------------------------------------------------------
    // VESSEL GEOMETRY
    // -------------------------------------------------------------------------
    createVessel(vessel) {
        const { length, width, height, type } = vessel;
        const isContainer = (type || "").toLowerCase().includes("container");

        // Imported vessel
        if (this.models.containerShip) {
            const targetLength = length || 150;
            const targetWidth = width || 30;
            const targetHeight = height || 40;

            const inst = this.makeConfiguredInstance("containerShip", targetLength, targetHeight, targetWidth);
            if (inst) return inst;
        }

        // Fallback procedural vessel...
        const group = new THREE.Group();
        const hullHeight = height * 0.6;

        const hullGeo = new THREE.BoxGeometry(length, hullHeight, width);
        this.adjustUVs(hullGeo, length, hullHeight, width);
        const hull = new THREE.Mesh(hullGeo, this.materials.vesselHull);
        hull.position.y = hullHeight / 2;
        hull.castShadow = true;
        hull.receiveShadow = true;
        group.add(hull);

        const bridgeLength = length * 0.15;
        const bridgeHeight = height * 0.5;
        const bridgeWidth = width * 0.9;

        const bridgeGeo = new THREE.BoxGeometry(bridgeLength, bridgeHeight, bridgeWidth);
        this.adjustUVs(bridgeGeo, bridgeLength, bridgeHeight, bridgeWidth);
        const bridge = new THREE.Mesh(bridgeGeo, this.materials.vesselBridge);
        bridge.position.set(-length / 2 + bridgeLength / 2 + 2, hullHeight + bridgeHeight / 2, 0);
        bridge.castShadow = true;
        bridge.receiveShadow = true;
        group.add(bridge);

        const funnelHeight = height * 0.3;
        const funnelRadius = width * 0.1;
        const funnelGeo = new THREE.CylinderGeometry(funnelRadius, funnelRadius, funnelHeight, 16);
        const funnel = new THREE.Mesh(funnelGeo, new THREE.MeshStandardMaterial({ color: 0x333333 }));
        funnel.castShadow = true;
        funnel.receiveShadow = true;
        funnel.position.set(-length / 2 + bridgeLength / 2 + 2, hullHeight + bridgeHeight + funnelHeight / 2, 0);
        group.add(funnel);

        if (isContainer || length > 150) {
            const cargoGroup = new THREE.Group();
            const cargoLength = length - bridgeLength - 10;
            const cargoWidth = width * 0.8;
            this.addDecorContainers(cargoGroup, cargoLength, cargoWidth, 0);
            cargoGroup.position.set(bridgeLength / 2, hullHeight, 0);
            group.add(cargoGroup);
        }

        return group;
    }

    // -------------------------------------------------------------------------
    // STAFF GEOMETRY
    // -------------------------------------------------------------------------
    createStaff(staff) {
        const height = 10;

        const staffKeys = [
            "maleWorkerYellow",
            "maleWorker",
            "maleManager",
            "femaleWorker"
        ].filter(k => this.models[k]);

        if (staffKeys.length > 0) {
            const key = staffKeys[Math.floor(Math.random() * staffKeys.length)];
            const inst = this.makeConfiguredInstance(key, height * 0.5, height, height * 0.5);
            if (inst) return inst;
        }

        // Fallback procedural staff
        const radius = 1.5;
        const h = 5;
        const geo = new THREE.CylinderGeometry(radius, radius, h, 8);
        const mesh = new THREE.Mesh(geo, this.materials.staffBody);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    // -------------------------------------------------------------------------
    // DOCK GEOMETRY
    // -------------------------------------------------------------------------
    createDock(dock) {
        const { width, height, depth } = dock;

        const inst = this.makeConfiguredInstance("dock", width, height, depth);
        if (inst) return inst;

        // Fallback procedural dock
        const geometry = new THREE.BoxGeometry(width, height, depth);
        this.adjustUVs(geometry, width, height, depth);
        const mesh = new THREE.Mesh(geometry, this.materials.dock);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    // -------------------------------------------------------------------------
    // CONTAINER YARD GEOMETRY
    // -------------------------------------------------------------------------
    createContainerYard(area) {
        const { width, height, depth } = area;

        const inst = this.makeConfiguredInstance("containerYard", width, height, depth);
        if (inst) return inst;

        // Fallback flat pad
        const group = new THREE.Group();
        const groundGeo = new THREE.BoxGeometry(width, height, depth);
        this.adjustUVs(groundGeo, width, height, depth);
        const ground = new THREE.Mesh(groundGeo, this.materials.yardSurface);
        ground.castShadow = true;
        ground.receiveShadow = true;
        group.add(ground);
        return group;
    }

    // -------------------------------------------------------------------------
    // CONTAINER GEOMETRY
    // -------------------------------------------------------------------------
    createContainer(container) {
        const containerWidth = 5;
        const containerHeight = 5;
        const containerDepth = 10;

        const containerModelKeys = [
            "cargoContainerGray",
            "cargoContainerOrange",
            "cargoContainerRusty"
        ].filter(k => this.models[k]);

        if (containerModelKeys.length > 0) {
            const key = containerModelKeys[Math.floor(Math.random() * containerModelKeys.length)];
            const inst = this.makeConfiguredInstance(key, containerWidth, containerHeight, containerDepth);
            if (inst) return inst;
        }

        // Fallback box container
        const geo = new THREE.BoxGeometry(containerWidth, containerHeight, containerDepth);
        this.adjustUVs(geo, containerWidth, containerHeight, containerDepth, 0.2);

        const mat = this.materials.container[
            Math.floor(Math.random() * this.materials.container.length)
        ];

        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        return mesh;
    }

    addDecorContainers(group, areaWidth, areaDepth, groundHeight) {
        const containerWidth = 5;
        const containerDepth = 10;
        const gap = 2;

        const cellWidth = containerWidth + gap;
        const cellDepth = containerDepth + gap;

        const cols = Math.floor((areaWidth - 10) / cellWidth);
        const rows = Math.floor((areaDepth - 10) / cellDepth);
        const maxContainers = Math.min(cols * rows, 50);

        const startX = -((cols * cellWidth) / 2) + cellWidth / 2;
        const startZ = -((rows * cellDepth) / 2) + cellDepth / 2;

        const geo = new THREE.BoxGeometry(containerWidth, containerWidth, containerDepth);
        this.adjustUVs(geo, containerWidth, containerWidth, containerDepth, 0.2);

        let count = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (count >= maxContainers) return;

                if (Math.random() > 0.4) {
                    const mat = this.materials.container[Math.floor(Math.random() * this.materials.container.length)];
                    const mesh = new THREE.Mesh(geo, mat);

                    const x = startX + c * cellWidth;
                    const z = startZ + r * cellDepth;

                    const stackHeight = Math.floor(Math.random() * 3) + 1;

                    for (let h = 0; h < stackHeight; h++) {
                        const stackMesh = mesh.clone();
                        stackMesh.position.set(x, groundHeight + containerWidth / 2 + h * containerWidth, z);
                        stackMesh.castShadow = true;
                        group.add(stackMesh);
                    }
                    count++;
                }
            }
        }
    }

    // -------------------------------------------------------------------------
    // WAREHOUSE GEOMETRY
    // -------------------------------------------------------------------------
    createWarehouse(area) {
        const { width, height, depth } = area;

        const inst = this.makeConfiguredInstance("warehouse", width, height, depth);
        if (inst) return inst;

        // Fallback procedural warehouse
        const group = new THREE.Group();

        const wallGeo = new THREE.BoxGeometry(width, height, depth);
        this.adjustUVs(wallGeo, width, height, depth);
        const walls = new THREE.Mesh(wallGeo, this.materials.warehouseWall);
        walls.castShadow = true;
        walls.receiveShadow = true;
        group.add(walls);

        const flatRoofGeo = new THREE.BoxGeometry(width + 2, 2, depth + 2);
        const flatRoof = new THREE.Mesh(flatRoofGeo, this.materials.warehouseRoof);
        flatRoof.castShadow = true;
        flatRoof.receiveShadow = true;
        flatRoof.position.y = height / 2 + 1;
        group.add(flatRoof);

        return group;
    }

    // -------------------------------------------------------------------------
    // RESOURCES (CRANES / TRUCKS)
    // -------------------------------------------------------------------------
    createResource(resource) {
        const { radius, height, type } = resource;
        const typeStr = (type || resource.resourceType || "").toString().toLowerCase();

        const isCrane =
            typeStr.includes("crane") ||
            resource.resourceType === 0 ||
            resource.resourceType === 1;

        if (isCrane) {
            let craneKey = null;
            if (typeStr.includes("sts") && this.models.stsCrane) craneKey = "stsCrane";
            else if (typeStr.includes("yard") && this.models.yardCrane) craneKey = "yardCrane";
            else if (this.models.constructionCrane) craneKey = "constructionCrane";
            else if (this.models.yardCrane) craneKey = "yardCrane";

            if (craneKey) {
                const inst = this.makeConfiguredInstance(craneKey, height, height, height * 0.5);
                if (inst) return inst;
            }

            // Fallback procedural crane
            const group = new THREE.Group();

            const mastGeo = new THREE.BoxGeometry(radius * 2, height, radius * 2);
            this.adjustUVs(mastGeo, radius * 2, height, radius * 2);
            const mast = new THREE.Mesh(mastGeo, this.materials.craneBody);
            mast.position.y = height / 2;
            mast.castShadow = true;
            mast.receiveShadow = true;
            group.add(mast);

            const boomLength = height * 0.8;
            const boomGeo = new THREE.BoxGeometry(boomLength, radius * 1.5, radius * 1.5);
            this.adjustUVs(boomGeo, boomLength, radius * 1.5, radius * 1.5);
            const boom = new THREE.Mesh(boomGeo, this.materials.craneBody);
            boom.position.set(boomLength / 2 - radius, height - radius, 0);
            boom.castShadow = true;
            boom.receiveShadow = true;
            group.add(boom);

            return group;
        }

        // Trucks / vehicles
        if (this.models.truck) {
            const chassisLength = height * 1.5;
            const chassisWidth = radius * 2.5;
            const chassisHeight = radius * 2.5;

            const inst = this.makeConfiguredInstance("truck", chassisLength, chassisHeight, chassisWidth);
            if (inst) return inst;
        }

        // Fallback procedural truck
        const group = new THREE.Group();

        const chassisLength = height * 1.5;
        const chassisWidth = radius * 2.5;
        const chassisHeight = radius;

        const chassisGeo = new THREE.BoxGeometry(chassisLength, chassisHeight, chassisWidth);
        const chassis = new THREE.Mesh(chassisGeo, this.materials.vehicleBody);
        chassis.position.y = chassisHeight + radius;
        chassis.castShadow = true;
        chassis.receiveShadow = true;
        group.add(chassis);

        const cabinLength = chassisLength * 0.3;
        const cabinHeight = chassisHeight * 1.2;
        const cabinGeo = new THREE.BoxGeometry(cabinLength, cabinHeight, chassisWidth);
        const cabin = new THREE.Mesh(cabinGeo, new THREE.MeshStandardMaterial({ color: 0xEEEEEE }));
        cabin.position.set(chassisLength / 2 - cabinLength / 2, chassisHeight * 2 + radius, 0);
        cabin.castShadow = true;
        cabin.receiveShadow = true;
        group.add(cabin);

        const wheelRadius = radius * 0.6;
        const wheelWidth = radius * 0.4;
        const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 16);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

        const positions = [
            { x: chassisLength / 3, z: chassisWidth / 2 },
            { x: chassisLength / 3, z: -chassisWidth / 2 },
            { x: -chassisLength / 3, z: chassisWidth / 2 },
            { x: -chassisLength / 3, z: -chassisWidth / 2 }
        ];

        positions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeo, wheelMat);
            wheel.rotation.x = Math.PI / 2;
            wheel.position.set(pos.x, wheelRadius, pos.z);
            wheel.receiveShadow = true;
            wheel.castShadow = true;
            group.add(wheel);
        });

        return group;
    }

    // -------------------------------------------------------------------------
    // NEW: ROADS, SIDEWALKS, INTERSECTIONS
    // -------------------------------------------------------------------------
    createRoadSegment(width, depth) {
        const geo = new THREE.BoxGeometry(width, 0.2, depth);
        this.adjustUVs(geo, width, 0.2, depth, 0.02);
        const mesh = new THREE.Mesh(geo, this.materials.roadAsphalt);
        mesh.receiveShadow = true;
        mesh.castShadow = false;
        return mesh;
    }

    createIntersection(size) {
        const geo = new THREE.BoxGeometry(size, 0.22, size);
        this.adjustUVs(geo, size, 0.22, size, 0.02);
        const mesh = new THREE.Mesh(geo, this.materials.roadAsphalt);
        mesh.receiveShadow = true;
        mesh.castShadow = false;
        return mesh;
    }

    createSidewalk(width, depth) {
        const geo = new THREE.BoxGeometry(width, 0.18, depth);
        this.adjustUVs(geo, width, 0.18, depth, 0.05);
        // Sidewalks sit very close to the road/ground plane; use polygonOffset to avoid z-fighting.
        const mat = this.materials.sidewalk;
        mat.polygonOffset = true;
        mat.polygonOffsetFactor = -5;
        mat.polygonOffsetUnits = -5;
        const mesh = new THREE.Mesh(geo, mat);
        mesh.receiveShadow = true;
        mesh.castShadow = false;
        return mesh;
    }

    // -------------------------------------------------------------------------
    // NEW: ROAD MARKINGS
    // -------------------------------------------------------------------------
    createLaneLine(width, depth) {
        // Very thin overlay plate
        const geo = new THREE.BoxGeometry(width, 0.03, depth);
        const mesh = new THREE.Mesh(geo, this.materials.roadMarking);
        mesh.receiveShadow = false;
        mesh.castShadow = false;
        return mesh;
    }

    createCrosswalkStripe(width, depth) {
        // Single stripe (caller places several stripes)
        const geo = new THREE.BoxGeometry(width, 0.03, depth);
        const mesh = new THREE.Mesh(geo, this.materials.roadMarking);
        mesh.receiveShadow = false;
        mesh.castShadow = false;
        return mesh;
    }

    // -------------------------------------------------------------------------
    // UTILS
    // -------------------------------------------------------------------------
    createLabel(text) {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 64;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);

        sprite.scale.set(60, 15, 1);

        return sprite;
    }

    adjustUVs(geometry, width, height, depth, scale = 0.05) {
        const pos = geometry.attributes.position;
        const norm = geometry.attributes.normal;
        const uv = geometry.attributes.uv;

        if (!pos || !norm || !uv) return;

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);

            const nx = Math.abs(norm.getX(i));
            const ny = Math.abs(norm.getY(i));
            const nz = Math.abs(norm.getZ(i));

            if (nx > 0.5) {
                uv.setXY(i, z * scale, y * scale);
            } else if (ny > 0.5) {
                uv.setXY(i, x * scale, z * scale);
            } else {
                uv.setXY(i, x * scale, y * scale);
            }
        }
        uv.needsUpdate = true;
    }
}

window.PortGeometryBuilder = PortGeometryBuilder;

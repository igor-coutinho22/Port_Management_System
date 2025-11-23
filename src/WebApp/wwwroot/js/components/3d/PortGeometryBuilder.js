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
            warehouseWall: new THREE.MeshStandardMaterial({ color: 0x999999 }),
            warehouseRoof: new THREE.MeshStandardMaterial({ color: 0x8B0000 }),
            craneBody: new THREE.MeshStandardMaterial({ color: 0xFFD700 }),
            vehicleBody: new THREE.MeshStandardMaterial({ color: 0x607D8B }),
            vesselHull: new THREE.MeshStandardMaterial({ color: 0x333333 }),
            vesselBridge: new THREE.MeshStandardMaterial({ color: 0xEEEEEE }),
            staffBody: new THREE.MeshStandardMaterial({ color: 0xFFA500 })
        };

        this.textureLoader = new THREE.TextureLoader();
    }

    loadTextures(config) {
        if (!config || !config.materials) return;

        const loadMat = (matName, targetMat) => {
            const conf = config.materials[matName];
            if (!conf) return;

            if (conf.colorMap) {
                this.textureLoader.load(conf.colorMap, (tex) => {
                    tex.wrapS = THREE.RepeatWrapping;
                    tex.wrapT = THREE.RepeatWrapping;
                    targetMat.map = tex;
                    targetMat.needsUpdate = true;
                });
            }
            if (conf.normalMap) {
                this.textureLoader.load(conf.normalMap, (tex) => {
                    tex.wrapS = THREE.RepeatWrapping;
                    tex.wrapT = THREE.RepeatWrapping;
                    targetMat.normalMap = tex;
                    targetMat.needsUpdate = true;
                });
            }
            if (conf.roughness !== undefined) targetMat.roughness = conf.roughness;
            if (conf.metalness !== undefined) targetMat.metalness = conf.metalness;
        };

        // Apply to specific materials
        loadMat("concrete", this.materials.dock);
        loadMat("concrete", this.materials.yardSurface);
        loadMat("metal", this.materials.vesselHull);
        loadMat("metal", this.materials.craneBody);
        loadMat("container", this.materials.container[0]); // Apply to first container type for now
        // We could clone materials for other container colors but keep the texture
    }

    // -----------------------------------------------------------------------------
    // VESSEL GEOMETRY
    // -----------------------------------------------------------------------------
    createVessel(vessel) {
        const { length, width, height } = vessel;

        const group = new THREE.Group();

        // Hull
        const hullHeight = height * 0.7;
        const hullGeo = new THREE.BoxGeometry(length, hullHeight, width);
        // Adjust UVs for tiling
        this.adjustUVs(hullGeo, length, hullHeight, width);

        const hull = new THREE.Mesh(hullGeo, this.materials.vesselHull);
        hull.position.y = hullHeight / 2;
        hull.castShadow = true;
        hull.receiveShadow = true;
        group.add(hull);

        // Bridge/Superstructure
        const bridgeLength = length * 0.2;
        const bridgeHeight = height * 0.5;
        const bridgeWidth = width * 0.8;
        const bridgeGeo = new THREE.BoxGeometry(bridgeLength, bridgeHeight, bridgeWidth);
        this.adjustUVs(bridgeGeo, bridgeLength, bridgeHeight, bridgeWidth);

        const bridge = new THREE.Mesh(bridgeGeo, this.materials.vesselBridge);
        bridge.position.set(-length / 2 + bridgeLength, hullHeight + bridgeHeight / 2, 0); // Stern
        bridge.castShadow = true;
        bridge.receiveShadow = true;
        group.add(bridge);

        return group;
    }

    // -----------------------------------------------------------------------------
    // STAFF GEOMETRY
    // -----------------------------------------------------------------------------
    createStaff(staff) {
        const height = 10;
        const radius = 1.5;
        const h = 5;

        const geo = new THREE.CylinderGeometry(radius, radius, h, 8);
        const mesh = new THREE.Mesh(geo, this.materials.staffBody);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    // -----------------------------------------------------------------------------
    // DOCK GEOMETRY
    // -----------------------------------------------------------------------------
    createDock(dock) {
        const { width, height, depth } = dock;

        const geometry = new THREE.BoxGeometry(width, height, depth);
        this.adjustUVs(geometry, width, height, depth);

        const mesh = new THREE.Mesh(geometry, this.materials.dock);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    // -----------------------------------------------------------------------------
    // CONTAINER YARD GEOMETRY
    // -----------------------------------------------------------------------------
    createContainerYard(area) {
        const { width, height, depth } = area;

        const group = new THREE.Group();

        // Ground
        const groundGeo = new THREE.BoxGeometry(width, height, depth);
        this.adjustUVs(groundGeo, width, height, depth);

        const ground = new THREE.Mesh(groundGeo, this.materials.yardSurface);
        ground.receiveShadow = true;
        group.add(ground);

        // Add some random containers
        this.addDecorContainers(group, width, depth, height);

        return group;
    }

    addDecorContainers(group, areaWidth, areaDepth, groundHeight) {
        const containerSize = 5;
        const numContainers = Math.floor((areaWidth * areaDepth) / 500);

        const geo = new THREE.BoxGeometry(containerSize, containerSize, containerSize * 2);
        // UVs for container
        this.adjustUVs(geo, containerSize, containerSize, containerSize * 2, 0.2); // Smaller scale

        for (let i = 0; i < numContainers; i++) {
            const mat = this.materials.container[Math.floor(Math.random() * this.materials.container.length)];
            const mesh = new THREE.Mesh(geo, mat);

            const x = (Math.random() - 0.5) * (areaWidth - 10);
            const z = (Math.random() - 0.5) * (areaDepth - 10);

            mesh.position.set(x, groundHeight / 2 + containerSize / 2, z);
            mesh.castShadow = true;
            group.add(mesh);
        }
    }

    // -----------------------------------------------------------------------------
    // WAREHOUSE GEOMETRY
    // -----------------------------------------------------------------------------
    createWarehouse(area) {
        const { width, height, depth } = area;

        const group = new THREE.Group();

        // Walls
        const wallGeo = new THREE.BoxGeometry(width, height, depth);
        this.adjustUVs(wallGeo, width, height, depth);

        const walls = new THREE.Mesh(wallGeo, this.materials.warehouseWall);
        walls.castShadow = true;
        walls.receiveShadow = true;
        group.add(walls);

        // Roof
        const flatRoofGeo = new THREE.BoxGeometry(width + 2, 2, depth + 2);
        const flatRoof = new THREE.Mesh(flatRoofGeo, this.materials.warehouseRoof);
        flatRoof.position.y = height / 2 + 1;

        group.add(flatRoof);

        return group;
    }

    // -----------------------------------------------------------------------------
    // RESOURCES
    // -----------------------------------------------------------------------------
    // -----------------------------------------------------------------------------
    // RESOURCES
    // -----------------------------------------------------------------------------
    createResource(resource) {
        const { radius, height, type } = resource;
        const isCrane = (type || "").toLowerCase().includes("crane") || (resource.resourceType === 0) || (resource.resourceType === 1);

        if (isCrane) {
            const group = new THREE.Group();

            // Vertical mast
            const mastGeo = new THREE.BoxGeometry(radius * 2, height, radius * 2);
            this.adjustUVs(mastGeo, radius * 2, height, radius * 2);
            const mast = new THREE.Mesh(mastGeo, this.materials.craneBody);
            mast.position.y = height / 2;
            mast.castShadow = true;
            mast.receiveShadow = true;
            group.add(mast);

            // Horizontal boom (arm)
            const boomLength = height * 0.8;
            const boomGeo = new THREE.BoxGeometry(boomLength, radius * 1.5, radius * 1.5);
            this.adjustUVs(boomGeo, boomLength, radius * 1.5, radius * 1.5);
            const boom = new THREE.Mesh(boomGeo, this.materials.craneBody);
            boom.position.set(boomLength / 2 - radius, height - radius, 0);
            boom.castShadow = true;
            boom.receiveShadow = true;
            group.add(boom);

            return group;
        } else {
            // Simple cylinder for other vehicles
            const geo = new THREE.CylinderGeometry(radius, radius, height, 16);
            const mat = this.materials.vehicleBody;

            const mesh = new THREE.Mesh(geo, mat);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            return mesh;
        }
    }

    // -----------------------------------------------------------------------------
    // UTILS
    // -----------------------------------------------------------------------------
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

            // Determine major axis and map UVs accordingly
            if (nx > 0.5) {
                // Side facing X: map Z, Y
                uv.setXY(i, z * scale, y * scale);
            } else if (ny > 0.5) {
                // Top/Bottom facing Y: map X, Z
                uv.setXY(i, x * scale, z * scale);
            } else {
                // Side facing Z: map X, Y
                uv.setXY(i, x * scale, y * scale);
            }
        }
        uv.needsUpdate = true;
    }
}

window.PortGeometryBuilder = PortGeometryBuilder;

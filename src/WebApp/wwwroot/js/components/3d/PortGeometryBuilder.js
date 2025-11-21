class PortGeometryBuilder {

    constructor() {
        // Materials - mixing new style with some placeholder colors
        this.materials = {
            dock: new THREE.MeshPhongMaterial({ color: 0x8B4513 }), // Brown like placeholder
            dockSide: new THREE.MeshPhongMaterial({ color: 0x5D4037 }),

            yardSurface: new THREE.MeshPhongMaterial({ color: 0x666666 }), // Grey like placeholder
            container: [
                new THREE.MeshPhongMaterial({ color: 0xFF0000 }),
                new THREE.MeshPhongMaterial({ color: 0x00FF00 }),
                new THREE.MeshPhongMaterial({ color: 0x0000FF }),
                new THREE.MeshPhongMaterial({ color: 0xFFFF00 })
            ],

            warehouseWall: new THREE.MeshPhongMaterial({ color: 0x888888 }), // Grey walls
            warehouseRoof: new THREE.MeshPhongMaterial({ color: 0x8B0000 }), // Red roof like placeholder

            craneBody: new THREE.MeshPhongMaterial({ color: 0xFFD700 }),
            vehicleBody: new THREE.MeshPhongMaterial({ color: 0x607D8B })
        };
    }

    // -----------------------------------------------------------------------------
    // DOCK GEOMETRY
    // -----------------------------------------------------------------------------
    createDock(dock) {
        const { width, height, depth } = dock; // Note: width is length along X, depth is width along Z

        const geometry = new THREE.BoxGeometry(width, height, depth);
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
        const ground = new THREE.Mesh(groundGeo, this.materials.yardSurface);
        ground.receiveShadow = true;
        group.add(ground);

        // Add some random containers on top to make it look alive
        this.addDecorContainers(group, width, depth, height);

        return group;
    }

    addDecorContainers(group, areaWidth, areaDepth, groundHeight) {
        const containerSize = 5;
        const numContainers = Math.floor((areaWidth * areaDepth) / 500); // Density

        const geo = new THREE.BoxGeometry(containerSize, containerSize, containerSize * 2);

        for (let i = 0; i < numContainers; i++) {
            const mat = this.materials.container[Math.floor(Math.random() * this.materials.container.length)];
            const mesh = new THREE.Mesh(geo, mat);

            // Random position within area
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
        const walls = new THREE.Mesh(wallGeo, this.materials.warehouseWall);
        walls.castShadow = true;
        walls.receiveShadow = true;
        group.add(walls);

        // Roof
        const roofHeight = 5;
        const roofGeo = new THREE.ConeGeometry(Math.max(width, depth) * 0.8, roofHeight, 4);
        const roof = new THREE.Mesh(roofGeo, this.materials.warehouseRoof);

        // Rotate roof to align with building (pyramid style or prism)
        // For simplicity, let's use a prism (Box) or just a flat top with color
        // Reverting to simple box roof for stability
        const flatRoofGeo = new THREE.BoxGeometry(width + 2, 2, depth + 2);
        const flatRoof = new THREE.Mesh(flatRoofGeo, this.materials.warehouseRoof);
        flatRoof.position.y = height / 2 + 1;

        group.add(flatRoof);

        return group;
    }

    // -----------------------------------------------------------------------------
    // RESOURCES (Cranes, trucks, etc.)
    // -----------------------------------------------------------------------------
    createResource(resource) {
        const { radius, height, type } = resource;

        const isCrane = (type || "").toLowerCase().includes("crane");

        const geo = new THREE.CylinderGeometry(radius, radius, height, 16);
        const mat = isCrane ? this.materials.craneBody : this.materials.vehicleBody;

        const mesh = new THREE.Mesh(geo, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    // -----------------------------------------------------------------------------
    // LABEL CREATION (CanvasTexture)
    // -----------------------------------------------------------------------------
    createLabel(text) {
        const canvas = document.createElement("canvas");
        canvas.width = 256;
        canvas.height = 64;

        const ctx = canvas.getContext("2d");
        // Background
        ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Text
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
}

// GLOBAL EXPORT
window.PortGeometryBuilder = PortGeometryBuilder;

class PortGeometryBuilder {

    constructor() {
        // Basic materials used across the scene
        this.materials = {
            dockSurface: new THREE.MeshPhongMaterial({ color: 0x8b5a2b }),
            dockSide: new THREE.MeshPhongMaterial({ color: 0x6b4423 }),
            yardSurface: new THREE.MeshPhongMaterial({ color: 0xa6cc6e }),
            warehouseWall: new THREE.MeshPhongMaterial({ color: 0xd0d3d4 }),
            warehouseRoof: new THREE.MeshPhongMaterial({ color: 0xa0a0a0 }),
            craneBody: new THREE.MeshPhongMaterial({ color: 0xffd700 }),
            vehicleBody: new THREE.MeshPhongMaterial({ color: 0x666666 })
        };
    }

    // -----------------------------------------------------------------------------
    // DOCK GEOMETRY
    // -----------------------------------------------------------------------------
    createDock(dock) {
        const { length, width, height } = dock;

        // Dock main body
        const dockGeometry = new THREE.BoxGeometry(length, height, width);

        // Use multi-materials: top + sides
        const mat = [
            this.materials.dockSide, // right
            this.materials.dockSide, // left
            this.materials.dockSurface, // top
            this.materials.dockSide, // bottom
            this.materials.dockSide, // front
            this.materials.dockSide  // back
        ];

        const mesh = new THREE.Mesh(dockGeometry, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    // -----------------------------------------------------------------------------
    // CONTAINER YARD GEOMETRY
    // -----------------------------------------------------------------------------
    createContainerYard(area) {
        const { width, depth, height } = area;

        const yardGeo = new THREE.BoxGeometry(width, height, depth);
        const yardMat = this.materials.yardSurface;

        const mesh = new THREE.Mesh(yardGeo, yardMat);
        mesh.receiveShadow = true;

        // OPTIONAL: Add surface grid texture later

        return mesh;
    }

    // -----------------------------------------------------------------------------
    // WAREHOUSE GEOMETRY
    // -----------------------------------------------------------------------------
    createWarehouse(area) {
        const { width, depth, height } = area;

        // Building (walls)
        const buildingGeo = new THREE.BoxGeometry(width, height, depth);
        const buildingMat = this.materials.warehouseWall;

        const building = new THREE.Mesh(buildingGeo, buildingMat);
        building.castShadow = true;
        building.receiveShadow = true;

        // Roof
        const roofGeo = new THREE.BoxGeometry(width, 6, depth);
        const roofMat = this.materials.warehouseRoof;

        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.set(0, height / 2 + 3, 0);
        roof.castShadow = true;
        roof.receiveShadow = true;

        // Group both into one object
        const group = new THREE.Group();
        group.add(building);
        group.add(roof);

        return group;
    }

    // -----------------------------------------------------------------------------
    // RESOURCES (Cranes, trucks, etc.)
    // -----------------------------------------------------------------------------
    createResource(resource) {
        const { radius, height, type } = resource;

        const isCrane = type.toLowerCase().includes("crane");

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
        ctx.fillStyle = "white";
        ctx.font = "28px Arial";
        ctx.fillText(text, 10, 40);

        const texture = new THREE.CanvasTexture(canvas);

        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);

        sprite.scale.set(180, 50, 1);

        return sprite;
    }
}

// GLOBAL EXPORT
window.PortGeometryBuilder = PortGeometryBuilder;

// -----------------------------------------------------------------------------
// PortLayoutEngine.js
// Converts REAL backend data → 3D spatial layout (positions & grouping)
// -----------------------------------------------------------------------------

class PortLayoutEngine {

    constructor() {
        // Scaling factor: 1 meter in data = N units in 3D
        this.scale = 1.5; 

        // Spacing between major port zones
        this.zSpacing = 180;
        this.xSpacing = 120;
    }

    // -----------------------------------------------------------------------------
    // MAIN ENTRY — compute positions for all port objects
    // -----------------------------------------------------------------------------
    computeLayout({ docks, storageAreas, resources }) {
        const dockLayouts = this.layoutDocks(docks);
        const storageLayouts = this.layoutStorageAreas(storageAreas, dockLayouts);
        const resourceLayouts = this.layoutResources(resources, storageLayouts);

        return {
            docks: dockLayouts,
            storageAreas: storageLayouts,
            resources: resourceLayouts
        };
    }

    // -----------------------------------------------------------------------------
    // DOCKS LAYOUT
    // -----------------------------------------------------------------------------
    layoutDocks(docks) {
        const layouts = [];
        let x = -500;

        docks.forEach((dock, index) => {

            const length = (dock.lengthMeters || 200) * this.scale;
            const width = 40 * this.scale;

            layouts.push({
                id: dock.id,
                name: dock.name,
                type: "Dock",
                width,
                length,
                height: 20,
                x: x + length / 2,
                y: 10,
                z: -200
            });

            x += length + this.xSpacing;
        });

        return layouts;
    }

    // -----------------------------------------------------------------------------
    // STORAGE AREA LAYOUT (Warehouses + Yards)
    // -----------------------------------------------------------------------------
    layoutStorageAreas(storageAreas, dockLayouts) {

        const layouts = [];
        let z = 200;

        storageAreas.forEach(sa => {
            const isWarehouse = sa.subtype === "Warehouse";
            const isYard = sa.subtype === "ContainerYard";

            // Dimensions scaled
            const sizeX = isWarehouse ? 200 * this.scale : 300 * this.scale;
            const sizeZ = isWarehouse ? 120 * this.scale : 250 * this.scale;
            const height = isWarehouse ? 60 : 8;

            layouts.push({
                id: sa.id,
                name: sa.name,
                subtype: sa.subtype,
                width: sizeX,
                depth: sizeZ,
                height,
                x: -400,          // could be improved later by zone clustering
                y: height / 2,
                z
            });

            z += sizeZ + this.zSpacing;
        });

        return layouts;
    }

    // -----------------------------------------------------------------------------
    // RESOURCES LAYOUT (Cranes, Trucks, etc.)
    // -----------------------------------------------------------------------------
    layoutResources(resources, storageLayouts) {
        const layouts = [];

        let x = 450;
        const z = 20;

        resources.forEach(res => {
            layouts.push({
                id: res.id,
                name: res.description,
                type: res.resourceType,
                height: 60,
                radius: 10,
                x,
                y: 30,
                z
            });

            x += this.xSpacing / 1.5;
        });

        return layouts;
    }
}

// GLOBAL EXPORT
window.PortLayoutEngine = PortLayoutEngine;

// -----------------------------------------------------------------------------
// PortLayoutEngine.js
// Converts REAL backend data → 3D spatial layout (positions & grouping)
// -----------------------------------------------------------------------------

class PortLayoutEngine {

    constructor() {
        // Scaling factor: 1 meter in data = N units in 3D
        this.scale = 1.0;

        // Spacing between major port zones
        this.dockSpacing = 50;
        this.storageSpacing = 40;

        // Base positions
        this.waterLineZ = 0;
        this.dockZ = 20; // Docks start slightly inland from water line
        this.storageZ = 150; // Storage areas behind docks
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

        // Calculate total width to center them
        let totalWidth = 0;
        docks.forEach(d => {
            totalWidth += (d.lengthMeters || 200) * this.scale + this.dockSpacing;
        });
        totalWidth -= this.dockSpacing; // Remove last spacing

        let currentX = -totalWidth / 2;

        docks.forEach((dock, index) => {
            const length = (dock.lengthMeters || 200) * this.scale;
            const width = 40 * this.scale; // Fixed width for visual representation
            const height = 10; // Height above water

            layouts.push({
                id: dock.id,
                name: dock.name,
                type: "Dock",
                width: length, // In 3D, we often align length along X
                depth: width,  // and width/depth along Z
                height: height,
                x: currentX + length / 2,
                y: height / 2,
                z: this.dockZ
            });

            currentX += length + this.dockSpacing;
        });

        return layouts;
    }

    // -----------------------------------------------------------------------------
    // STORAGE AREA LAYOUT (Warehouses + Yards)
    // -----------------------------------------------------------------------------
    layoutStorageAreas(storageAreas, dockLayouts) {
        const layouts = [];

        // Simple grid layout for storage areas
        const itemsPerRow = 4;
        let row = 0;
        let col = 0;

        const cellWidth = 200;
        const cellDepth = 200;

        // Start position (centered relative to docks or origin)
        const startX = -(itemsPerRow * cellWidth) / 2;
        const startZ = this.storageZ;

        storageAreas.forEach(sa => {
            const isWarehouse = sa.subtype === "Warehouse";

            // Scale dimensions based on capacity if available, or use defaults
            // Heuristic: 1 TEU ~= 1 unit of volume? Or just fixed sizes for now.
            // Let's use fixed sizes but scaled slightly by capacity tier

            let baseSize = 100;
            if (sa.maxCapacityTeu > 1000) baseSize = 150;
            if (sa.maxCapacityTeu > 5000) baseSize = 200;

            const width = baseSize * this.scale;
            const depth = (isWarehouse ? baseSize * 0.6 : baseSize) * this.scale;
            const height = isWarehouse ? 40 : 5; // Warehouses are tall, yards are flat

            const x = startX + col * cellWidth + cellWidth / 2;
            const z = startZ + row * cellDepth + cellDepth / 2;

            layouts.push({
                id: sa.id,
                name: sa.name,
                subtype: sa.subtype,
                width,
                depth,
                height,
                x,
                y: height / 2,
                z
            });

            col++;
            if (col >= itemsPerRow) {
                col = 0;
                row++;
            }
        });

        return layouts;
    }

    // -----------------------------------------------------------------------------
    // RESOURCES LAYOUT (Cranes, Trucks, etc.)
    // -----------------------------------------------------------------------------
    layoutResources(resources, storageLayouts) {
        const layouts = [];

        // Scatter resources around the storage areas or docks
        // For now, place them in a designated "parking" area to the side

        let x = 300; // To the right
        let z = 50;

        resources.forEach((res, i) => {
            layouts.push({
                id: res.id,
                name: res.description,
                type: res.resourceType,
                height: 30,
                radius: 8,
                x: x + (i % 5) * 40,
                y: 15,
                z: z + Math.floor(i / 5) * 40
            });
        });

        return layouts;
    }
}

// GLOBAL EXPORT
window.PortLayoutEngine = PortLayoutEngine;

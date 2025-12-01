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
        this.storageSpacing = 20;

        // Base positions
        this.waterLineZ = 0;
        this.dockZ = 20; // Docks start slightly inland from water line
        this.storageZ = 60; // Storage areas behind docks
    }

    // -----------------------------------------------------------------------------
    // MAIN ENTRY — compute positions for all port objects
    // -----------------------------------------------------------------------------
    computeLayout({ docks, storageAreas, resources, vessels, staff }) {
        const dockLayouts = this.layoutDocks(docks);
        const storageLayouts = this.layoutStorageAreas(storageAreas, dockLayouts);
        const resourceLayouts = this.layoutResources(resources, storageLayouts, dockLayouts);
        const vesselLayouts = this.layoutVessels(vessels || [], dockLayouts);
        const staffLayouts = this.layoutStaff(staff || [], dockLayouts);

        return {
            docks: dockLayouts,
            storageAreas: storageLayouts,
            resources: resourceLayouts,
            vessels: vesselLayouts,
            staff: staffLayouts
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
        const itemsPerRow = dockLayouts.size;
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
        });

        return layouts;
    }

    // -----------------------------------------------------------------------------
    // RESOURCES LAYOUT (Cranes, Trucks, etc.)
    // -----------------------------------------------------------------------------
    layoutResources(resources, storageLayouts, dockLayouts) {
        const layouts = [];

        // Separate resources by type
        const stsCranes = resources.filter(r => (r.resourceType || "").toString().toLowerCase().includes("sts") || (r.resourceType === 0));
        const yardCranes = resources.filter(r => (r.resourceType || "").toString().toLowerCase().includes("yard") || (r.resourceType === 1));
        const others = resources.filter(r => !stsCranes.includes(r) && !yardCranes.includes(r));

        // 1. Place STS Cranes at Docks
        stsCranes.forEach((res, i) => {
            const dock = dockLayouts[i % dockLayouts.length];
            if (dock) {
                // Place along the dock edge
                layouts.push({
                    id: res.id,
                    name: res.description,
                    type: res.resourceType,
                    height: 50, // Taller
                    radius: 5,
                    x: dock.x + (Math.random() - 0.5) * (dock.width - 20),
                    y: dock.height, // On top of dock
                    z: dock.z - dock.depth / 2 + 5 // Near the water edge
                });
            }
        });

        // 2. Place Yard Cranes at Container Yards
        const yards = storageLayouts.filter(s => s.subtype === "ContainerYard");
        yardCranes.forEach((res, i) => {
            const yard = yards.length > 0 ? yards[i % yards.length] : storageLayouts[i % storageLayouts.length];
            if (yard) {
                layouts.push({
                    id: res.id,
                    name: res.description,
                    type: res.resourceType,
                    height: 40,
                    radius: 5,
                    x: yard.x + (Math.random() - 0.5) * (yard.width - 20),
                    y: yard.height, // On ground/yard
                    z: yard.z + (Math.random() - 0.5) * (yard.depth - 20)
                });
            }
        });

        // 3. Scatter others (Trucks, etc.) near storage
        others.forEach((res, i) => {
            // Target "Container Yard North" specifically
            const targetArea = storageLayouts.find(s => s.name === "Container Yard North") || storageLayouts[0];

            let x = 0, z = 0;

            if (targetArea) {
                // Place strictly INSIDE the yard boundaries
                // Margin of 10 units from edge
                const margin = 10;
                const safeWidth = Math.max(0, targetArea.width - margin * 2);
                const safeDepth = Math.max(0, targetArea.depth - margin * 2);

                x = targetArea.x + (Math.random() - 0.5) * safeWidth;
                z = targetArea.z + (Math.random() - 0.5) * safeDepth;
            } else {
                // Fallback
                x = 0;
                z = 100;
            }

            layouts.push({
                id: res.id,
                name: res.description,
                type: res.resourceType,
                height: 15,
                radius: 4,
                x: x,
                y: 5, // On ground
                z: z
            });
        });

        return layouts;
    }

    // -----------------------------------------------------------------------------
    // VESSELS LAYOUT
    // -----------------------------------------------------------------------------
    layoutVessels(vessels, dockLayouts) {
        const layouts = [];

        vessels.forEach((v, i) => {
            const length = (v.length || 100) * this.scale;
            const width = (v.width || 30) * this.scale;

            // Find assigned dock by ID
            const dock = dockLayouts.find(d => d.id === v.dockId);

            let x, z, angle;

            if (dock) {
                // Place alongside the dock
                // Check if another vessel is already at this dock
                const vesselsAtDock = layouts.filter(l => l.dockId === dock.id).length;
                // Use a safe length offset (e.g. 300) because vessels are moored lengthwise (stern-to-bow)
                // and can be up to ~250m long.
                const offset = vesselsAtDock * 300;

                x = dock.x + offset;
                z = dock.z - dock.depth / 2 - width / 2 - 5; // 5 units gap
                angle = 0;
            } else {
                // Anchor out at sea if no dock assigned (fallback)
                // Increase spacing to avoid collisions
                x = (i - vessels.length / 2) * 400; // Increased from 150 to 400
                z = -300 - (i % 3) * 100; // Stagger depth too
                angle = 0;
            }

            layouts.push({
                id: v.id,
                name: v.name,
                type: "Vessel",
                vesselType: v.type,
                dockId: v.dockId, // Store dockId for collision check above
                length: length,
                width: width,
                height: (v.height || 20) * this.scale,
                x: x,
                y: 0, // On water
                z: z,
                rotation: angle
            });
        });

        return layouts;
    }

    // -----------------------------------------------------------------------------
    // STAFF LAYOUT
    // -----------------------------------------------------------------------------
    layoutStaff(staffList, dockLayouts) {
        const layouts = [];

        // Place staff on the docks
        staffList.forEach((s, i) => {
            // Assign to a random dock
            const dock = dockLayouts.length > 0 ? dockLayouts[i % dockLayouts.length] : null;

            let x = 0, z = 50; // Default safe zone if no docks

            if (dock) {
                // Place somewhere on the dock surface
                // Dock is centered at dock.x, dock.z with dimensions dock.width, dock.depth
                x = dock.x + (Math.random() - 0.5) * (dock.width - 10);
                z = dock.z + (Math.random() - 0.5) * (dock.depth - 10);
            } else {
                // Fallback: Place on a "pier" or safe ground area
                x = (i % 5) * 10;
                z = 50 + (Math.floor(i / 5) * 10);
            }

            layouts.push({
                id: s.id,
                name: s.name,
                type: "Staff",
                status: s.status,
                x: x,
                y: 15, // Standing on ground
                z: z
            });
        });

        return layouts;
    }
}

// GLOBAL EXPORT
window.PortLayoutEngine = PortLayoutEngine;

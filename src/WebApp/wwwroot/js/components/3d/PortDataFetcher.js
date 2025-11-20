// -----------------------------------------------------------------------------
// PortDataFetcher.js
// Centralized data fetching & normalization for the 3D Port Visualization
// -----------------------------------------------------------------------------

class PortDataFetcher {

    // Fetch ALL data required for the 3D port visualization
    async loadAll() {
        try {
            const [docks, storageAreas, resources] = await Promise.all([
                this.fetchDocks(),
                this.fetchStorageAreas(),
                this.fetchResources()
            ]);

            return {
                docks,
                storageAreas,
                resources
            };
        } catch (err) {
            console.error("PortDataFetcher.loadAll() failed:", err);
            throw new Error("Failed to load port data from server.");
        }
    }

    // -------------------------------------------------------------------------
    // DOCKS
    // -------------------------------------------------------------------------
    async fetchDocks() {
        const resp = await fetch("/api/docks");
        if (!resp.ok) throw new Error("Failed to fetch docks");

        const docks = await resp.json();

        // Normalize dock DTOs
        return docks.map(d => ({
            id: d.id,
            name: d.name,
            location: d.location,
            lengthMeters: d.lengthMeters || 200,
            depthMeters: d.depthMeters || 10,
            maxDraftMeters: d.maxDraftMeters || 12
        }));
    }

    // -------------------------------------------------------------------------
    // STORAGE AREAS (Warehouses + Container Yards)
    // -------------------------------------------------------------------------
    async fetchStorageAreas() {
        const resp = await fetch("/api/storageAreas");
        if (!resp.ok) throw new Error("Failed to fetch storage areas");

        const rawList = await resp.json();

        return rawList.map(sa => {
            const base = {
                id: sa.id,
                name: sa.storageArea?.name || sa.name,
                type: sa.type || sa.storageAreaType,
                maxCapacityTeu: sa.maxCapacityTeu,
                currentOccupancyTeu: sa.currentOccupancyTeu || 0
            };

            // Detect subtype
            if (sa.specializedCargoType) {
                return {
                    ...base,
                    subtype: "Warehouse",
                    specializedCargoType: sa.specializedCargoType
                };
            }

            if (sa.dockIds || sa.dockConnections) {
                return {
                    ...base,
                    subtype: "ContainerYard",
                    dockIds: sa.dockIds || [],
                    dockConnections: sa.dockConnections || []
                };
            }

            return { ...base, subtype: "Unknown" };
        });
    }

    // -------------------------------------------------------------------------
    // RESOURCES (Cranes, trucks, tractors, etc.)
    // -------------------------------------------------------------------------
    async fetchResources() {
        const resp = await fetch("/api/resources");
        if (!resp.ok) throw new Error("Failed to fetch resources");

        const list = await resp.json();

        return list.map(r => ({
            id: r.id,
            description: r.description,
            resourceType: r.resourceType,
            operationalCapacity: r.operationalCapacity,
            status: r.status || "unknown"
        }));
    }
}

// Expose globally
window.PortDataFetcher = PortDataFetcher;
